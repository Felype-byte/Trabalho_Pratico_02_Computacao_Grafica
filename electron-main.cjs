const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow () {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false 
        }
    });

    // 🚀 ESTA É A LINHA MÁGICA QUE REMOVE O MENU PADRÃO DO WINDOWS
    win.setMenu(null);

    // Aponta para o index.html dentro da pasta dist
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
}

app.whenReady().then(createWindow);