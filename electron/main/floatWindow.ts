/*
 * @Author: qilin
 * @Date: 2025-04-08 13:47:26
 * @LastEditors: qilin
 * @LastEditTime: 2025-04-09 09:45:37
 * @description: 乘风破浪
 */
import { BrowserWindow } from 'electron';
import path, { resolve } from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

let floatWindow: BrowserWindow | null = null;
const floatHtml = path.join(RENDERER_DIST, 'float.html')

export function createFloatWindow() {
  floatWindow = new BrowserWindow({
    x: 100,
    y: 100,
    width: 400,
    height: 200,
    // frame: false,
    movable: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    transparent: true,
    webPreferences: {
      // devTools: false,
      nodeIntegration: true,
      contextIsolation: false,
      // preload,
    },
  });

  floatWindow.setIgnoreMouseEvents(false);

  if (VITE_DEV_SERVER_URL) { // #298
    // floatWindow.loadURL(VITE_DEV_SERVER_URL)
    floatWindow.loadURL(`${VITE_DEV_SERVER_URL}#/float`)
    // floatWindow.loadFile(path.join(__dirname, 'float.html'))
  } else {
    floatWindow.loadFile(floatHtml)
  }

  floatWindow.on('closed', () => {
    floatWindow = null;
  });

  return floatWindow;
}
