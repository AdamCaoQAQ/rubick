import {globalShortcut, ipcMain, BrowserWindow} from 'electron';
import {stringify} from 'query-string';
import Api from './api';

export default function init(mainWindow) {
  ipcMain.on('changeWindowSize', (event, arg) => {
    mainWindow.setSize(arg.width || 788, arg.height);
  });

  mainWindow.on('blur', () => {
    // mainWindow.hide();
  });

  globalShortcut.register('Alt+R', () => {
    mainWindow.show();
  });

  ipcMain.on('msg-trigger', async (event, arg) => {
    const window = arg.winId ? BrowserWindow.fromId(arg.winId) : mainWindow
    const operators = arg.type.split('.');
    let fn = Api;
    operators.forEach((op) => {
      fn = fn[op];
    });
    const data = fn(arg, window);
    event.sender.send(`msg-back-${arg.type}`, data);
  });

  ipcMain.on('new-window', (event, arg) => {
    const opts = {
      ...arg,
      searchType: 'subWindow',
    }
    const winURL = process.env.NODE_ENV === 'development'
      ? `http://localhost:9080/#/plugin?${stringify(opts)}`
      : `file://${__dirname}/index.html/#/plugin?${stringify(opts)}`
    const win = new BrowserWindow({
      height: 600,
      useContentSize: true,
      width: 788,
      titleBarStyle: 'hiddenInset',
      title: '拉比克',
      webPreferences: {
        webSecurity: false,
        enableRemoteModule: true,
        backgroundThrottling: false,
        webviewTag: true,
        nodeIntegration: true // 在网页中集成Node
      }
    });
    win.loadURL(winURL)
    win.once('ready-to-show', () => win.show());
  })
}


