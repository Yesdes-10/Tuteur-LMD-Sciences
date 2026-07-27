require('dotenv').config(); // 1. Indispensable pour lire votre secret dans .env sans le publier !
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

// 2. Initialisation sécurisée de l'IA (Plus aucune clé en clair ici !)
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ ERREUR CRITIQUE : GEMINI_API_KEY est introuvable dans le fichier .env !");
}

// Initialisation du SDK officiel avec la clé chargée depuis les variables d'environnement
const ai = new GoogleGenAI({ apiKey: apiKey });

let mainWindow;

/**
 * Création de la fenêtre principale de l'application Tuteur LMD
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Tuteur LMD Sciences",
    webPreferences: {
      nodeIntegration: true, // À adapter selon la configuration de votre projet
      contextIsolation: false // Permet à votre frontend d'utiliser ipcRenderer facilement
    }
  });

  // Chargement de l'interface graphique située dans le dossier www/
  mainWindow.loadFile(path.join(__dirname, 'www/index.html'));

  // Optionnel : Décommentez la ligne ci-dessous si vous souhaitez ouvrir la console de debug au démarrage
  // mainWindow.webContents.openDevTools();
}

/* ==========================================================================
   3. ÉCOUTEUR IPC (Reçoit les questions de api.js et interroge Gemini)
   ========================================================================== */
ipcMain.handle('demander-a-gemini', async (event, messageEtudiant) => {
  try {
    if (!apiKey) {
      throw new Error("La clé API Gemini n'est pas configurée dans le fichier .env du serveur Electron.");
    }

    // Appel à l'API Gemini avec le nouveau SDK @google/genai
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash", // Modèle rapide, stable et idéal pour le tutorat scientifique
      contents: messageEtudiant,
    });
    
    return { success: true, text: response.text };

  } catch (error) {
    console.error("❌ Erreur Gemini dans le processus principal Electron :", error);
    return { success: false, error: error.message || "Erreur de communication avec l'IA." };
  }
});

/* ==========================================================================
   4. GESTION DU CYCLE DE VIE DE L'APPLICATION ELECTRON
   ========================================================================== */
app.whenReady().then(() => {
  createWindow();

  // Sur macOS, recréer une fenêtre quand on clique sur l'icône dans le dock
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quitter l'application quand toutes les fenêtres sont fermées (sauf sur macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});