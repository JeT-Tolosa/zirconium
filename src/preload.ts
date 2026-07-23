// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

// On expose une API sécurisée dans le contexte de la page (window.electronAPI)
contextBridge.exposeInMainWorld('electronAPI', {
  selectFile: (): Promise<string> => ipcRenderer.invoke('dialog:openFile'),
  // On ajoute nos deux nouvelles méthodes
  saveJson: (fileNameOrPath: string, data: unknown): Promise<boolean> =>
    ipcRenderer.invoke('file:saveJson', fileNameOrPath, data),

  readJson: (fileNameOrPath: string): Promise<unknown> =>
    ipcRenderer.invoke('file:readJson', fileNameOrPath),
});

// Déclaration de type globale pour le typage TypeScript strict du côté Renderer
declare global {
  interface Window {
    electronAPI: {
      selectFile: () => Promise<string>;
      saveJson: (fileNameOrPath: string, data: unknown) => Promise<boolean>;
      readJson: (fileNameOrPath: string) => Promise<unknown>; // 'any' ou 'unknown' selon votre rigueur de typage au retour    };
    };
  }
}
