
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'primary';
}

interface NotificationContextType {
  notify: (type: NotificationType, message: string, title?: string) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const notify = useCallback((type: NotificationType, message: string, title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>(resolve => {
      setConfirmDialog({ options, resolve });
    });
  }, []);

  const handleConfirm = (value: boolean) => {
    if (confirmDialog) {
      confirmDialog.resolve(value);
      setConfirmDialog(null);
    }
  };

  return (
    <NotificationContext.Provider value={{ notify, confirm }}>
      {children}
      
      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className={`pointer-events-auto min-w-[300px] p-4 rounded-2xl shadow-2xl border flex items-start gap-4 ${
                n.type === 'success' ? 'bg-white border-emerald-100' :
                n.type === 'error' ? 'bg-white border-red-100' :
                n.type === 'warning' ? 'bg-white border-amber-100' :
                'bg-white border-ocean-100'
              }`}
            >
              <div className={`p-2 rounded-xl ${
                n.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                n.type === 'error' ? 'bg-red-50 text-red-600' :
                n.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                'bg-ocean-50 text-ocean-600'
              }`}>
                {n.type === 'success' && <CheckCircle size={20} />}
                {n.type === 'error' && <AlertCircle size={20} />}
                {n.type === 'warning' && <AlertTriangle size={20} />}
                {n.type === 'info' && <Info size={20} />}
              </div>
              <div className="flex-1">
                {n.title && <h4 className="font-black text-sm text-ocean-950 mb-0.5">{n.title}</h4>}
                <p className="text-xs font-bold text-slate-500 leading-relaxed">{n.message}</p>
              </div>
              <button 
                onClick={() => setNotifications(prev => prev.filter(item => item.id !== n.id))}
                className="text-slate-300 hover:text-slate-500 transition-colors"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Confirm Dialog */}
      <AnimatePresence>
        {confirmDialog && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${confirmDialog.options.type === 'danger' ? 'bg-red-50 text-red-600' : 'bg-ocean-50 text-ocean-600'}`}>
                    {confirmDialog.options.type === 'danger' ? <AlertCircle size={24} /> : <Info size={24} />}
                  </div>
                  <h3 className="text-xl font-black text-ocean-950">{confirmDialog.options.title}</h3>
                </div>
                
                <p className="text-slate-500 font-bold leading-relaxed">
                  {confirmDialog.options.message}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleConfirm(false)}
                    className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all"
                  >
                    {confirmDialog.options.cancelText || 'Cancelar'}
                  </button>
                  <button
                    onClick={() => handleConfirm(true)}
                    className={`flex-1 px-6 py-4 text-white font-black rounded-2xl shadow-lg transition-all ${
                      confirmDialog.options.type === 'danger' 
                        ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' 
                        : 'bg-ocean-600 hover:bg-ocean-700 shadow-ocean-600/20'
                    }`}
                  >
                    {confirmDialog.options.confirmText || 'Confirmar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
};
