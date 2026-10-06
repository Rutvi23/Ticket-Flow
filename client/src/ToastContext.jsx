import { createContext, useContext, useState, useCallback } from 'react';

const Ctx = createContext();
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const show = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);
  return (
    <Ctx.Provider value={show}>
      {children}
      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </Ctx.Provider>
  );
}
