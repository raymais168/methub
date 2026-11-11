const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 850,
    title: "PNG NWS Weather Forecast Dashboard",
    autoHideMenuBar: true
  });

  // Loads your home/dashboard file
  win.loadFile('index.html');
}

app.whenReady().then(createWindow);