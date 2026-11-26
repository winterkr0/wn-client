const fs = require('fs');
const path = require('path');
const { app } = require('electron');

// 브랜딩/서버 기본값 — 여기만 바꾸면 됩니다.
const BRAND = {
  name: 'Cobalt Client',
  server: 'wnsv.kr',
};

// 선택 가능한 버전 (1.20.1 ~ 1.21.11). 인게임 모드를 빌드한 버전과 같아야 합니다.
const SUPPORTED_VERSIONS = [
  '1.21.11', '1.21.10', '1.21.8', '1.21.5', '1.21.4', '1.21.1',
  '1.20.6', '1.20.4', '1.20.1',
];

const DEFAULTS = {
  version: '1.21.1',
  ramMb: 4096,
  server: BRAND.server,
  autoJoin: true,
  hideOnLaunch: true,
};

function baseDir() {
  // 게임 파일(에셋, 라이브러리, 자바, 인스턴스)이 저장되는 곳
  return path.join(app.getPath('appData'), '.wnclient');
}

function file() {
  return path.join(app.getPath('userData'), 'settings.json');
}

function get() {
  try {
    return { ...DEFAULTS, ...JSON.parse(fs.readFileSync(file(), 'utf8')) };
  } catch {
    return { ...DEFAULTS };
  }
}

function set(patch) {
  const next = { ...get(), ...patch };
  if (!SUPPORTED_VERSIONS.includes(next.version)) next.version = DEFAULTS.version;
  next.ramMb = Math.max(1024, Math.min(32768, Number(next.ramMb) || DEFAULTS.ramMb));
  fs.mkdirSync(path.dirname(file()), { recursive: true });
  fs.writeFileSync(file(), JSON.stringify(next, null, 2));
  return next;
}

module.exports = { BRAND, SUPPORTED_VERSIONS, get, set, baseDir };
