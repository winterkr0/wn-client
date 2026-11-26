const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { Client } = require('minecraft-launcher-core');
const auth = require('./src/auth');
const config = require('./src/config');
const { ensureJava } = require('./src/java');
const { prepareInstance } = require('./src/install');

let win;
let running = false;

function send(channel, payload) {
  if (win && !win.isDestroyed()) win.webContents.send(channel, payload);
}
const log = (line) => send('log', String(line));
const progress = (label, ratio) => send('progress', { label, ratio });

function createWindow() {
  win = new BrowserWindow({
    width: 1040,
    height: 640,
    minWidth: 900,
    minHeight: 560,
    backgroundColor: '#0d0f14',
    title: config.BRAND.name,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'assets', process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url);
    return { action: 'deny' };
  });
}

ipcMain.handle('app:info', () => ({ brand: config.BRAND, versions: config.SUPPORTED_VERSIONS }));
ipcMain.handle('config:get', () => config.get());
ipcMain.handle('config:set', (_e, patch) => config.set(patch));
ipcMain.handle('auth:restore', () => auth.restore());
ipcMain.handle('auth:login', () => auth.login());
ipcMain.handle('auth:logout', () => auth.logout());

ipcMain.handle('game:launch', async () => {
  if (running) throw new Error('이미 게임이 실행 중이에요.');
  running = true;
  send('state', 'preparing');
  try {
    const cfg = config.get();
    const base = config.baseDir();
    const mc = cfg.version;

    progress('계정 확인 중', 0);
    const authorization = await auth.freshMclc();

    progress('Java 확인 중', 0.05);
    const javaPath = await ensureJava(base, mc, (label, r) => progress(label, 0.05 + r * 0.25));

    progress('Fabric·모드 설치 중', 0.3);
    const { instanceDir, customId } = await prepareInstance(base, mc, log);

    const launcher = new Client();
    launcher.on('debug', (d) => log(d));
    launcher.on('data', (d) => log(d));
    launcher.on('progress', (p) => {
      if (p.total) progress(`게임 파일 받는 중 (${p.type})`, 0.35 + 0.6 * (p.task / p.total));
    });
    launcher.on('close', (code) => {
      running = false;
      log(`[런처] 게임 종료 (코드 ${code})`);
      send('state', 'idle');
      if (cfg.hideOnLaunch && win && !win.isDestroyed()) win.show();
    });

    const opts = {
      authorization,
      root: base,
      javaPath,
      version: { number: mc, type: 'release', custom: customId },
      memory: { max: `${cfg.ramMb}M`, min: '1024M' },
      overrides: { gameDirectory: instanceDir },
    };
    if (cfg.autoJoin && cfg.server) {
      opts.quickPlay = { type: 'multiplayer', identifier: cfg.server };
    }

    const proc = await launcher.launch(opts);
    if (!proc) throw new Error('게임을 실행하지 못했어요. 로그를 확인해 주세요.');
    progress('실행 중', 1);
    send('state', 'running');
    if (cfg.hideOnLaunch) win.hide();
    return true;
  } catch (err) {
    running = false;
    send('state', 'idle');
    log(`[오류] ${err.message}`);
    throw err;
  }
});

ipcMain.handle('open:gamedir', () => {
  shell.openPath(path.join(config.baseDir(), 'instances', config.get().version));
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (!running) app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
