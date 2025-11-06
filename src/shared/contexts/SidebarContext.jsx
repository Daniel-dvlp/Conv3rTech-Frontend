import { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  // Estado inicial: intentar recuperar de localStorage, sino usar valores por defecto
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem('sidebar-expanded');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [isLocked, setIsLocked] = useState(() => {
    const saved = localStorage.getItem('sidebar-locked');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Guardar en localStorage cuando cambien los estados
  useEffect(() => {
    localStorage.setItem('sidebar-expanded', JSON.stringify(isExpanded));
  }, [isExpanded]);

  useEffect(() => {
    localStorage.setItem('sidebar-locked', JSON.stringify(isLocked));
  }, [isLocked]);

  const toggleExpanded = () => setIsExpanded(prev => !prev);
  const toggleLocked = () => setIsLocked(prev => !prev);

  const value = {
    isExpanded,
    isLocked,
    setIsExpanded,
    setIsLocked,
    toggleExpanded,
    toggleLocked
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

export default SidebarContext;