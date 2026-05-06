import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface PlainEnglishCtx {
  plain: boolean;
  setPlain: (v: boolean) => void;
  toggle: () => void;
}

const Ctx = createContext<PlainEnglishCtx>({
  plain: false,
  setPlain: () => {},
  toggle: () => {},
});

const STORAGE_KEY = 'knowledge:plainEnglish';

export function PlainEnglishProvider({ children }: { children: ReactNode }) {
  const [plain, setPlain] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, plain ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [plain]);

  return (
    <Ctx.Provider value={{ plain, setPlain, toggle: () => setPlain((v) => !v) }}>
      {children}
    </Ctx.Provider>
  );
}

export function usePlainEnglish() {
  return useContext(Ctx);
}
