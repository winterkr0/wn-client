// Fabric 로더만 설치하고, WN Client 본체는 mods 폴더가 아니라 클라이언트 전용 폴더에서 직접 불러옵니다.
// → 인스턴스의 mods 폴더는 비어 있고, 모든 기능은 WN Client 안에 들어 있습니다.
const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const { getJson } = require('./net');

async function installFabricProfile(baseDir, mc) {
  const loaders = await getJson(`https://meta.fabricmc.net/v2/versions/loader/${mc}`);
  const stable = loaders.find((l) => l.loader.stable) || loaders[0];
  if (!stable) throw new Error(`${mc}용 Fabric 로더가 없어요.`);
  const loader = stable.loader.version;
  const id = `fabric-loader-${loader}-${mc}`;
  const dir = path.join(baseDir, 'versions', id);
  const file = path.join(dir, `${id}.json`);
  if (!fs.existsSync(file)) {
    const profile = await getJson(`https://meta.fabricmc.net/v2/versions/loader/${mc}/${loader}/profile/json`);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(profile, null, 2));
  }
  return id;
}

function bundledClientDir() {
  return app.isPackaged ? path.join(process.resourcesPath, 'mods') : path.join(__dirname, '..', 'mods');
}

// WN Client 본체 jar를 클라이언트 폴더에 두고 경로를 돌려줍니다.
function installClientCore(baseDir, mc) {
  const name = `wnclient-${mc}.jar`;
  const src = path.join(bundledClientDir(), name);
  if (!fs.existsSync(src)) throw new Error(`WN Client ${mc} 파일이 없어요. 런처를 다시 설치해 주세요.`);
  const dest = path.join(baseDir, 'client', name);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  return dest;
}

// 예전 버전 런처가 mods 폴더에 넣었던 파일(Sodium 등)을 치웁니다. 사용자가 직접 넣은 모드는 건드리지 않습니다.
function cleanupOldManagedMods(instanceDir) {
  const modsDir = path.join(instanceDir, 'mods');
  const manifestFile = path.join(modsDir, '.wn-managed.json');
  if (!fs.existsSync(manifestFile)) return;
  try {
    for (const name of JSON.parse(fs.readFileSync(manifestFile, 'utf8'))) {
      fs.rmSync(path.join(modsDir, name), { force: true });
    }
  } catch {}
  fs.rmSync(manifestFile, { force: true });
}

async function prepareInstance(baseDir, mc, log) {
  const instanceDir = path.join(baseDir, 'instances', mc);
  fs.mkdirSync(path.join(instanceDir, 'mods'), { recursive: true });
  cleanupOldManagedMods(instanceDir);
  log(`[설치] Fabric 로더 확인 중 (${mc})`);
  const customId = await installFabricProfile(baseDir, mc);
  const clientJar = installClientCore(baseDir, mc);
  log(`[설치] WN Client ${mc} 준비 완료`);
  return { instanceDir, customId, clientJar };
}

module.exports = { prepareInstance };
