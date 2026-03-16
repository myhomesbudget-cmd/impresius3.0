"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface MobileProjectSidebarContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const MobileProjectSidebarContext = createContext<MobileProjectSidebarContextType>({
  isOpen: false,
  open: () => {},
  close: () => {},
  toggle: () => {},
});

export function MobileProjectSidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  return (
    <MobileProjectSidebarContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </MobileProjectSidebarContext.Provider>
  );
}

export function useMobileProjectSidebar() {
  return useContext(MobileProjectSidebarContext);
}
