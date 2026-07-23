import path from 'node:path';
import started from 'electron-squirrel-startup';
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { promises as fs } from 'node:fs';

// Déclaration de la variable globale pour Vite (gérée par le bundler)
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

let mainWindow: BrowserWindow | null = null;

// Gérer la création/suppression des raccourcis sous Windows à l'installation/désinstallation
if (started) {
  app.quit();
}

/**
 * Enregistrement de tous les gestionnaires IPC (Inter-Process Communication)
 * Très important : Doit être appelé AVANT de charger l'interface (Vite / HTML)
 */
const registerIpcHandlers = (): void => {
  // 1. Gestionnaire d'écriture JSON
  ipcMain.handle(
    'file:saveJson',
    async (_event, fileNameOrPath: string, data: unknown): Promise<boolean> => {
      try {
        // Si c'est juste un nom de fichier, on le met dans le dossier "userData" de l'app.
        // Si c'est un chemin absolu (choisi via dialog), on le garde tel quel.
        const targetPath = path.isAbsolute(fileNameOrPath)
          ? fileNameOrPath
          : path.join(app.getPath('userData'), fileNameOrPath);

        const jsonString = JSON.stringify(data, null, 2);
        await fs.writeFile(targetPath, jsonString, 'utf-8');

        return true;
      } catch (error) {
        console.error("Échec de l'écriture du fichier JSON :", error);
        throw error; // Renvoie l'erreur au Renderer pour gestion
      }
    },
  );

  // 2. Gestionnaire de lecture JSON
  ipcMain.handle(
    'file:readJson',
    async (_event, fileNameOrPath: string): Promise<unknown> => {
      try {
        const targetPath = path.isAbsolute(fileNameOrPath)
          ? fileNameOrPath
          : path.join(app.getPath('userData'), fileNameOrPath);

        const rawData = await fs.readFile(targetPath, 'utf-8');
        return JSON.parse(rawData);
      } catch (error) {
        console.error('Échec de la lecture du fichier JSON :', error);
        throw error;
      }
    },
  );
  ipcMain.handle('dialog:openFile', async (): Promise<string | null> => {
    if (!mainWindow) {
      return null;
    }

    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Choisir un fichier',
      properties: ['openFile'],
      filters: [
        { name: 'Tous les fichiers', extensions: ['*'] },
        { name: 'JSON', extensions: ['json', 'JSON'] },
      ],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  });
};

/**
 * Création de la fenêtre principale
 */
const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1200,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // Recommandé pour la sécurité
      nodeIntegration: false,
    },
  });

  // Chargement de l'URL de dev (Vite) ou du fichier de build
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Ouvrir les outils de développement
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// --- Cycle de vie unique de l'application ---

app.whenReady().then(() => {
  // 1. On enregistre les handlers IPC en premier
  registerIpcHandlers();

  // 2. On crée la fenêtre ensuite
  createWindow();

  app.on('activate', () => {
    // Spécifique macOS : recréer la fenêtre au clic sur le dock si elle était fermée
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quitter quand toutes les fenêtres sont fermées (sauf macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
