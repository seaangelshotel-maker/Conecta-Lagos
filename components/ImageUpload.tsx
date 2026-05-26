
import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Plus } from 'lucide-react';
import { useNotification } from './NotificationSystem';

interface ImageUploadProps {
  currentImage?: string;
  onImageSelect?: (base64: string) => void;
  onBatchSelect?: (images: string[]) => void;
  allowMultiple?: boolean;
  label?: string;
  className?: string;
  maxWidth?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
    currentImage, 
    onImageSelect, 
    onBatchSelect,
    allowMultiple = false,
    label = "Upload de Imagem", 
    className = "",
    maxWidth = 800
}) => {
  const { notify } = useNotification();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      console.log(`[ImageUpload] Iniciando compressão: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
      
      if (!file.type.startsWith('image/')) {
          const errorMsg = `O arquivo "${file.name}" não é uma imagem válida. Tipo detectado: ${file.type}`;
          console.error(`[ImageUpload] ${errorMsg}`);
          reject(new Error(errorMsg));
          return;
      }

      // Check file size before processing (e.g., 15MB limit for browser safety)
      if (file.size > 15 * 1024 * 1024) {
          const errorMsg = `O arquivo "${file.name}" é muito grande (${(file.size / 1024 / 1024).toFixed(2)} MB). Limite de 15MB para processamento.`;
          console.error(`[ImageUpload] ${errorMsg}`);
          reject(new Error(errorMsg));
          return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          try {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;

              if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
              }

              canvas.width = width;
              canvas.height = height;
              
              const ctx = canvas.getContext('2d');
              if (ctx) {
                  ctx.drawImage(img, 0, 0, width, height);
                  // Qualidade 0.6 para economizar ainda mais espaço sem perder muita nitidez
                  const dataUrl = canvas.toDataURL('image/jpeg', 0.6); 
                  console.log(`[ImageUpload] Compressão finalizada: ${file.name} -> ${(dataUrl.length / 1024).toFixed(2)} KB`);
                  resolve(dataUrl);
              } else {
                  const errorMsg = "Erro ao acessar contexto do Canvas para processar a imagem.";
                  console.error(`[ImageUpload] ${errorMsg}`);
                  reject(new Error(errorMsg));
              }
          } catch (e: any) {
              console.error(`[ImageUpload] Erro durante processamento no Canvas:`, e);
              reject(new Error(`Erro no processamento da imagem: ${e.message}`));
          }
        };
        img.onerror = (err) => {
            console.error(`[ImageUpload] Erro ao carregar imagem no objeto Image:`, err);
            reject(new Error("Não foi possível carregar a imagem selecionada. Verifique se o arquivo não está corrompido."));
        };
      };
      reader.onerror = (err) => {
          console.error(`[ImageUpload] Erro no FileReader:`, err);
          reject(new Error("Erro ao ler o arquivo do dispositivo."));
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);

    try {
        if (allowMultiple && onBatchSelect) {
            // Modo Múltiplo: Processa todas e retorna array
            const promises: Promise<string>[] = [];
            // Limita a 10 arquivos por vez para segurança do navegador
            const fileList = Array.from(files).slice(0, 10); 
            
            for (const file of fileList) {
                promises.push(compressImage(file as File));
            }

            const results = await Promise.all(promises);
            onBatchSelect(results);
            notify('success', `${results.length} fotos processadas e otimizadas com sucesso!`);

        } else if (onImageSelect) {
            // Modo Único
            const result = await compressImage(files[0]);
            onImageSelect(result);
            notify('success', "Imagem processada e otimizada com sucesso!");
        }
    } catch (error: any) {
        console.error("[ImageUpload] Falha no processamento de imagem:", error);
        notify('error', error.message || "Erro ao processar imagem. Tente um arquivo diferente (JPG/PNG).");
    } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onImageSelect) onImageSelect('');
      if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className={`w-full ${className}`}>
        {label && <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{label}</label>}
        
        <div 
            onClick={() => !loading && fileInputRef.current?.click()}
            className={`relative w-full aspect-video md:aspect-[2/1] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group ${currentImage ? 'border-transparent' : 'border-slate-300 hover:border-ocean-400 bg-slate-50 hover:bg-ocean-50'}`}
        >
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                multiple={allowMultiple}
                className="hidden" 
            />

            {loading ? (
                <div className="flex flex-col items-center text-ocean-500 bg-white/90 absolute inset-0 justify-center z-20">
                    <Loader2 className="animate-spin mb-2" size={32} />
                    <span className="text-xs font-bold animate-pulse">
                        {allowMultiple ? 'Processando fotos...' : 'Otimizando...'}
                    </span>
                </div>
            ) : currentImage ? (
                <>
                    <img src={currentImage} alt="Uploaded" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                        <p className="text-white text-sm font-bold flex items-center gap-2"><Upload size={16}/> Alterar</p>
                    </div>
                    <button 
                        onClick={handleRemove}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-md z-20"
                        title="Remover"
                    >
                        <X size={14} />
                    </button>
                </>
            ) : (
                <div className="flex flex-col items-center text-slate-400 group-hover:text-ocean-500 transition-colors px-4 text-center">
                    {allowMultiple ? (
                        <>
                            <div className="bg-white p-3 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                <Plus size={24} className="text-ocean-500" />
                            </div>
                            <span className="text-sm font-bold text-ocean-900">Adicionar Fotos</span>
                            <span className="text-xs font-bold text-ocean-500 opacity-70 mt-1">Selecione várias</span>
                        </>
                    ) : (
                        <>
                            <ImageIcon size={32} className="mb-2" />
                            <span className="text-sm font-bold">Toque para enviar</span>
                        </>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};
