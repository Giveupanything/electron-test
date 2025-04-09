import { useRef } from 'react';
import { createContext, useContext } from 'use-context-selector';
import { FileEntity } from '../types';
import { create, useStore as useZustandStore } from 'zustand';

type Shape = {
    files: FileEntity[]
    setFiles: (files: FileEntity[]) => void
}

export const createFileStore = (
  value: FileEntity[] = [],
  onChange?: (files: FileEntity[]) => void
) => {
  return create<Shape>(set => ({
    files: [...value],
    setFiles: (files) => {
      set({ files });
      onChange?.(files);
    }
  }));
};

type FileStore = ReturnType<typeof createFileStore>

const FileContext = createContext<FileStore | null>(null);

export function useStore<T>(selector: (state: Shape) => T): T {
  const store = useContext(FileContext);
  if(!store) throw new Error('Missing FileContext.Provider in the tree');

  return useZustandStore(store, selector);
}

export const useFileStore = () => {
  return useContext(FileContext)!;
};

export function FileContextProvider({ children }: Common.Children) {

  const storeRef = useRef<FileStore>();

  if(!storeRef.current) storeRef.current = createFileStore();

  return <FileContext.Provider
    value={storeRef.current}
  >
    {children}
  </FileContext.Provider>;
}

export const useFileContext = () => useContext(FileContext);

export default FileContext;
