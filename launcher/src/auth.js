// 마이크로소프트 계정 로그인 (msmc v5). 갱신 토큰은 OS 암호화(safeStorage)로 저장합니다.
const fs = require('fs');
const path = require('path');
const { app, safeStorage } = require('electron');
const { Auth } = require('msmc');

const authManager = new Auth('select_account');
let current = null; // { name, uuid, mclc }

function storeFile() {
  return path.join(app.getPath('userData'), 'account.bin');
}

function save(refresh) {
  const data = safeStorage.isEncryptionAvailable()
    ? safeStorage.encryptString(refresh)
    : Buffer.from(refresh, 'utf8');
  fs.writeFileSync(storeFile(), data);
}

function load() {
  try {
    const buf = fs.readFileSync(storeFile());
    return safeStorage.isEncryptionAvailable() ? safeStorage.decryptString(buf) : buf.toString('utf8');
  } catch {
    return null;
  }
}

async function finish(xbox) {
  const mc = await xbox.getMinecraft();
  save(xbox.save());
  current = { name: mc.profile.name, uuid: mc.profile.id, mclc: mc.mclc() };
  return { name: current.name, uuid: current.uuid };
}

async function login() {
  const xbox = await authManager.launch('electron', { width: 520, height: 680, title: 'Microsoft 로그인' });
  return finish(xbox);
}

async function restore() {
  const saved = load();
  if (!saved) return null;
  try {
    return await finish(await authManager.refresh(saved));
  } catch {
    return null; // 토큰 만료 → 다시 로그인 필요
  }
}

// 실행 직전마다 토큰을 새로 받아 만료 문제를 피합니다.
async function freshMclc() {
  const ok = await restore();
  if (!ok || !current) throw new Error('로그인이 필요해요.');
  return current.mclc;
}

function logout() {
  current = null;
  fs.rmSync(storeFile(), { force: true });
}

module.exports = { login, restore, logout, freshMclc };
