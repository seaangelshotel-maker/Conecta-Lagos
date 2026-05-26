import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

// Cache the access token in memory
let cachedDriveAccessToken: string | null = null;
let isInitializing = false;

// Clear the cached token when the user signs out
onAuthStateChanged(auth, (user) => {
  if (!user) {
    cachedDriveAccessToken = null;
  }
});

/**
 * Initiates the Google login flow explicitly requesting the Google Drive scope.
 */
export const connectGoogleDrive = async (): Promise<string> => {
  try {
    isInitializing = true;
    const provider = new GoogleAuthProvider();
    // Request full drive access as requested
    provider.addScope('https://www.googleapis.com/auth/drive');
    provider.setCustomParameters({ prompt: 'select_account' });

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error('Falha ao obter o token de acesso do Google Drive.');
    }

    cachedDriveAccessToken = credential.accessToken;
    // Dispatch custom event to notify components that Drive is connected
    window.dispatchEvent(new Event('googleDriveConnected'));
    return cachedDriveAccessToken;
  } catch (error: any) {
    console.error('Error connecting to Google Drive:', error);
    throw error;
  } finally {
    isInitializing = false;
  }
};

/**
 * Disconnects the cache Drive token in memory
 */
export const disconnectGoogleDrive = () => {
  cachedDriveAccessToken = null;
  window.dispatchEvent(new Event('googleDriveDisconnected'));
};

/**
 * Get the current cached Drive API access token in memory
 */
export const getDriveAccessToken = (): string | null => {
  return cachedDriveAccessToken;
};

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  iconLink?: string;
  thumbnailLink?: string;
  webViewLink?: string;
  webContentLink?: string;
  size?: string;
  modifiedTime?: string;
  parents?: string[];
}

/**
 * List files from the user's Google Drive.
 * Supports filtering by folder (parents) and querying text search.
 */
export const listDriveFiles = async (
  parentId: string = 'root',
  searchText: string = ''
): Promise<DriveFile[]> => {
  const token = getDriveAccessToken();
  if (!token) throw new Error('Não há token de acesso ativo para o Google Drive. Conecte primeiro.');

  let q = `'${parentId}' in parents and trashed = false`;
  if (searchText.trim()) {
    // Escape single quotes for safety
    const safeSearch = searchText.replace(/'/g, "\\'");
    q += ` and name contains '${safeSearch}'`;
  }

  const fields = 'files(id, name, mimeType, iconLink, thumbnailLink, webViewLink, webContentLink, size, modifiedTime, parents)';
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}&orderBy=folder%2Cname&pageSize=100`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => ({}));
    console.error('Drive API list error:', errorDetails);
    throw new Error(`Erro ao listar arquivos do Drive: ${response.statusText}`);
  }

  const data = await response.json();
  return data.files || [];
};

/**
 * Create a new folder in Google Drive.
 */
export const createDriveFolder = async (
  folderName: string,
  parentId: string = 'root'
): Promise<DriveFile> => {
  const token = getDriveAccessToken();
  if (!token) throw new Error('Não há token de acesso ativo para o Google Drive.');

  const body = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentId],
  };

  const response = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => ({}));
    console.error('Drive API folder create error:', errorDetails);
    throw new Error(`Falha ao criar pasta: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Upload a file to Google Drive.
 * Uses a multipart upload to send metadata (with proper parent placement) and the binary contents.
 */
export const uploadFileToDrive = async (
  file: File,
  parentId: string = 'root',
  onProgress?: (percent: number) => void
): Promise<DriveFile> => {
  const token = getDriveAccessToken();
  if (!token) throw new Error('Não há token de acesso ativo para o Google Drive.');

  const metadata = {
    name: file.name,
    parents: [parentId],
  };

  const formData = new FormData();
  formData.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  formData.append('file', file);

  // Note: Standard fetch doesn't support upload progress out of the box nicely,
  // but we can mock or manage a direct XMLHttpRequest wrapper if needed,
  // or use basic multipart API first. Let's write an XHR for clean progress reporting!
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,iconLink,thumbnailLink,webViewLink,size,modifiedTime');
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve(res);
        } catch (e) {
          reject(new Error('Falha ao processar resposta do servidor.'));
        }
      } else {
        reject(new Error(`Erro no envio: ${xhr.statusText || xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Erro de conexão durante o upload do arquivo.'));
    xhr.send(formData);
  });
};

/**
 * Delete a file permanently from Google Drive.
 * (Requires confirmation from user in UX, checked programmatically).
 */
export const deleteDriveFile = async (fileId: string): Promise<boolean> => {
  const token = getDriveAccessToken();
  if (!token) throw new Error('Não há token de acesso ativo para o Google Drive.');

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorDetails = await response.json().catch(() => ({}));
    console.error('Drive API file delete error:', errorDetails);
    throw new Error(`Falha ao excluir arquivo: ${response.statusText}`);
  }

  return true;
};
