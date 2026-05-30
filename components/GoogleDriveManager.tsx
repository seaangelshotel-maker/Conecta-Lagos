import React, { useState, useEffect, useRef } from 'react';
import { 
  Cloud, HardDrive, Search, Folder, FileText, FileImage, 
  FileCheck, FileDown, Eye, Trash2, Plus, LogOut, ArrowLeft, 
  UploadCloud, ChevronRight, Loader2, Sparkles, AlertCircle, FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from './NotificationSystem';
import { 
  getDriveAccessToken, connectGoogleDrive, disconnectGoogleDrive, 
  listDriveFiles, createDriveFolder, uploadFileToDrive, deleteDriveFile, 
  DriveFile 
} from '../services/googleDriveService';

export const GoogleDriveManager: React.FC = () => {
  const { notify, confirm } = useNotification();
  const [token, setToken] = useState<string | null>(getDriveAccessToken());
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Folder Navigation State
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([
    { id: 'root', name: 'Meu Drive' }
  ]);

  // Upload/Folder Actions State
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [showFolderForm, setShowFolderForm] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if Google Drive connect event fires
  useEffect(() => {
    const handleConnected = () => {
      setToken(getDriveAccessToken());
    };
    const handleDisconnected = () => {
      setToken(null);
      setFiles([]);
    };

    window.addEventListener('googleDriveConnected', handleConnected);
    window.addEventListener('googleDriveDisconnected', handleDisconnected);

    return () => {
      window.removeEventListener('googleDriveConnected', handleConnected);
      window.removeEventListener('googleDriveDisconnected', handleDisconnected);
    };
  }, []);

  // Fetch files when token, current folder, or search query changes
  useEffect(() => {
    if (token) {
      loadFiles();
    }
  }, [token, currentFolderId, searchQuery]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const items = await listDriveFiles(currentFolderId, searchQuery);
      setFiles(items);
    } catch (error: any) {
      console.error('Error listing Drive files:', error);
      notify('error', 'Erro ao carregar arquivos do seu Google Drive.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      await connectGoogleDrive();
      notify('success', 'Google Drive conectado com sucesso!');
    } catch (error: any) {
      notify('error', 'Falha ao autorizar acesso ao Google Drive.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnectGoogleDrive();
    notify('info', 'Conexão com o Google Drive encerrada.');
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      setLoading(true);
      await createDriveFolder(newFolderName.trim(), currentFolderId);
      setNewFolderName('');
      setShowFolderForm(false);
      notify('success', `Pasta "${newFolderName}" criada com sucesso!`);
      loadFiles();
    } catch (error: any) {
      notify('error', 'Não foi possível criar a pasta no Google Drive.');
    } finally {
      setLoading(false);
    }
  };

  // Drag & Drop event handling
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFiles(e.target.files);
    }
  };

  const uploadFiles = async (fileList: FileList) => {
    setIsUploading(true);
    setUploadPercent(0);

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        notify('info', `Enviando "${file.name}" para o Drive...`);
        await uploadFileToDrive(file, currentFolderId, (percent) => {
          setUploadPercent(percent);
        });
        notify('success', `Arquivo "${file.name}" enviado com sucesso!`);
      }
      loadFiles();
    } catch (error: any) {
      notify('error', 'Ocorreu um erro ao enviar arquivo ao Google Drive.');
    } finally {
      setIsUploading(false);
      setUploadPercent(0);
    }
  };

  // File Deletion with MANDATORY user confirmation in Portuguese
  const handleDelete = async (fileId: string, fileName: string) => {
    const userConfirmed = await confirm({
      title: 'EXCLUIR ARQUIVO DO DRIVE?',
      message: `Tem certeza que deseja excluir o arquivo "${fileName}" permanentemente do seu Google Drive? Esta ação não pode ser desfeita.`
    });

    if (!userConfirmed) return;

    try {
      setLoading(true);
      await deleteDriveFile(fileId);
      notify('success', 'Arquivo excluído com sucesso!');
      loadFiles();
    } catch (error: any) {
      notify('error', 'Falha ao excluir o arquivo do Google Drive.');
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (id: string, name: string) => {
    setCurrentFolderId(id);
    setFolderPath([...folderPath, { id, name }]);
    setSearchQuery('');
  };

  const handleBreadcrumbClick = (id: string, index: number) => {
    setCurrentFolderId(id);
    setFolderPath(folderPath.slice(0, index + 1));
    setSearchQuery('');
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/vnd.google-apps.folder') {
      return <Folder className="text-yellow-500 fill-yellow-500/20" size={24} />;
    }
    if (mimeType.includes('image/')) {
      return <FileImage className="text-pink-500" size={24} />;
    }
    if (mimeType.includes('pdf')) {
      return <FileText className="text-red-500" size={24} />;
    }
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) {
      return <FileSpreadsheet className="text-emerald-500" size={24} />;
    }
    return <FileText className="text-blue-500" size={24} />;
  };

  const formatBytes = (bytesStr?: string) => {
    if (!bytesStr) return '-';
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes) || bytes === 0) return '-';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-xl border border-slate-100 animate-in slide-in-from-bottom-6 space-y-8">
      {/* HEADER PAGE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-1">
              <Cloud size={10} /> Sincronizador Nuvem
            </span>
          </div>
          <h2 className="text-3xl font-black text-ocean-950 mt-1.5 flex items-center gap-2">
            <HardDrive className="text-blue-600" /> Google Drive
          </h2>
          <p className="text-sm text-slate-500 font-medium">Gerencie mídias, PDFs de cardápios e documentos integrados</p>
        </div>

        {token && (
          <button 
            onClick={handleDisconnect}
            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 transition-colors text-red-600 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider border border-red-100 cursor-pointer"
          >
            <LogOut size={14} />
            <span>Desconectar Drive</span>
          </button>
        )}
      </div>

      {!token ? (
        /* CONNECTED SCREEN NOT CONNECTED */
        <div className="flex flex-col items-center justify-center py-12 px-4 max-w-2xl mx-auto text-center space-y-8">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 via-yellow-400 to-green-500 blur opacity-30 animate-pulse"></div>
            <div className="relative bg-white p-6 rounded-full shadow-lg border border-slate-100 flex items-center justify-center">
              <HardDrive size={52} className="text-blue-600" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-2xl font-black text-ocean-950">Conectar com o Google Drive</h3>
            <p className="text-slate-600 font-medium leading-relaxed text-sm md:text-base">
              Vincule seu Google Drive ao painel do <b>Konecta Rio</b>. Isso permitirá que você adicione e gerencie arquivos, fotos de estabelecimentos, PDFs de cardápios ou panfletos diretamente dos seus arquivos com total facilidade.
            </p>
          </div>

          <button
            onClick={handleConnect}
            disabled={loading}
            className="relative flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-wide hover:shadow-md transition-all active:scale-95 cursor-pointer select-none"
          >
            {loading ? (
              <Loader2 className="animate-spin text-blue-600" size={20} />
            ) : (
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
            )}
            <span>Conectar Conta Google</span>
          </button>
        </div>
      ) : (
        /* MAIN DRIVE NAVIGATION INTERFACE */
        <div className="space-y-6">
          {/* SEARCH & ACTIONS BAR */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50 p-4 rounded-[2rem] border border-slate-100">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Pesquisar nos arquivos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none text-sm transition-colors text-ocean-950 font-medium"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              <button
                onClick={() => setShowFolderForm(!showFolderForm)}
                className="flex items-center gap-2 bg-white text-ocean-800 hover:bg-slate-100 border border-slate-200 px-4 py-3 rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
              >
                <Plus size={16} className="text-blue-600" />
                <span>Nova Pasta</span>
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl text-xs font-black transition-colors shadow-md cursor-pointer"
              >
                <Plus size={16} />
                <span>Enviar Arquivo</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                className="hidden"
                multiple
              />
            </div>
          </div>

          {/* New Folder Inline Form */}
          <AnimatePresence>
            {showFolderForm && (
              <motion.form 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleCreateFolder}
                className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 flex flex-col sm:flex-row gap-3 items-end sm:items-center"
              >
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest pl-1">Nome da Nova Pasta</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Panfletos, Fotos Cardápio, etc."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full bg-white px-4 py-2.5 rounded-xl border border-blue-200 text-sm focus:outline-none focus:border-blue-500 text-ocean-950 font-medium"
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setShowFolderForm(false);
                      setNewFolderName('');
                    }}
                    className="flex-1 sm:flex-none border border-slate-200 bg-white hover:bg-slate-50 transition-colors py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 transition-colors py-2.5 px-4 rounded-xl text-xs font-black text-white cursor-pointer"
                  >
                    Criar Pasta
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* DRAG AND DROP ZONE */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-[2rem] p-8 text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
              dragActive 
                ? 'border-blue-500 bg-blue-50/40 text-blue-700' 
                : 'border-slate-200 hover:border-blue-400 bg-slate-50/30'
            }`}
          >
            <UploadCloud size={32} className={`mb-2 ${dragActive ? 'text-blue-600' : 'text-slate-400'}`} />
            <p className="font-bold text-sm text-ocean-950">
              Arraste e solte arquivos aqui para enviar
            </p>
            <p className="text-xs text-slate-500 mt-1">
              ou clique para selecionar do seu dispositivo
            </p>
          </div>

          {/* ACTIVE UPLOAD STATUS */}
          {isUploading && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs font-black pl-1">
                <span className="text-blue-600 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                  <Loader2 className="animate-spin" size={14} /> Enviando Arquivos...
                </span>
                <span className="text-ocean-950">{uploadPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-2 transition-all duration-300" 
                  style={{ width: `${uploadPercent}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* NAVIGATION BREADCRUMBS */}
          <div className="flex flex-wrap items-center gap-1 text-xs text-slate-500 font-bold bg-white px-1">
            {folderPath.map((folder, index) => (
              <React.Fragment key={folder.id}>
                {index > 0 && <ChevronRight size={12} className="text-slate-400" />}
                <button
                  type="button"
                  onClick={() => handleBreadcrumbClick(folder.id, index)}
                  className={`hover:text-blue-600 transition-colors uppercase tracking-widest cursor-pointer ${
                    index === folderPath.length - 1 ? 'text-ocean-950 font-black' : ''
                  }`}
                >
                  {folder.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* FILES & FOLDERS LIST */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="animate-spin text-blue-600" size={36} />
              <span className="text-sm font-bold text-slate-500">Buscando do Google Drive...</span>
            </div>
          ) : files.length === 0 ? (
            <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-12 text-center max-w-md mx-auto space-y-2 text-slate-500">
              <AlertCircle size={32} className="mx-auto text-slate-400" />
              <p className="font-bold text-ocean-950">Nenhum arquivo ou pasta encontrado</p>
              <p className="text-xs">Esta pasta está vazia. Arraste ou selecione arquivos para adicioná-los e mantê-los seguros.</p>
            </div>
          ) : (
            <div className="overflow-hidden border border-slate-100 rounded-[2rem] shadow-sm bg-white">
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <th className="py-4 px-6">Nome</th>
                      <th className="py-4 px-4">Modificado</th>
                      <th className="py-4 px-4">Tamanho</th>
                      <th className="py-4 px-6 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60 text-sm">
                    {files.map((file) => (
                      <tr 
                        key={file.id} 
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        {/* Name Column */}
                        <td className="py-4 px-6 font-bold text-ocean-950">
                          {file.mimeType === 'application/vnd.google-apps.folder' ? (
                            <button
                              onClick={() => handleFolderClick(file.id, file.name)}
                              className="flex items-center gap-3 text-left focus:outline-none hover:text-blue-600 transition-colors cursor-pointer"
                            >
                              {getFileIcon(file.mimeType)}
                              <span>{file.name}</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-3">
                              {getFileIcon(file.mimeType)}
                              <span className="truncate max-w-[200px] md:max-w-xs">{file.name}</span>
                            </div>
                          )}
                        </td>

                        {/* Modified Column */}
                        <td className="py-4 px-4 text-xs font-medium text-slate-400">
                          {file.modifiedTime 
                            ? new Date(file.modifiedTime).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : '-'}
                        </td>

                        {/* Size Column */}
                        <td className="py-4 px-4 text-xs font-bold text-slate-500">
                          {file.mimeType === 'application/vnd.google-apps.folder' 
                            ? 'Pasta' 
                            : formatBytes(file.size)}
                        </td>

                        {/* Action Column */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noreferrer"
                                title="Visualizar no Drive"
                                className="p-2 border border-slate-100 bg-white hover:bg-slate-50 text-slate-600 rounded-xl transition-colors hover:shadow-inner"
                              >
                                <Eye size={14} />
                              </a>
                            )}
                            
                            {file.webContentLink && (
                              <a
                                href={file.webContentLink}
                                title="Baixar Arquivo"
                                className="p-2 border border-slate-100 bg-white hover:bg-slate-50 text-blue-600 rounded-xl transition-colors hover:shadow-inner"
                              >
                                <FileDown size={14} />
                              </a>
                            )}

                            <button
                              onClick={() => handleDelete(file.id, file.name)}
                              title="Excluir arquivo"
                              className="p-2 border border-red-100 bg-white hover:bg-red-50 text-red-500 rounded-xl transition-colors hover:shadow-inner cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
