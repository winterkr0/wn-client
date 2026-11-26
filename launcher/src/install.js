// Fabric 로더 프로필 + 모드(Fabric API, 최적화 모드, WN Client 모드)를 버전별 인스턴스에 설치합니다.
const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const { getJson, download } = require('./net');

// Modrinth에서 버전에 맞춰 자동으로 받아오는 모드
const MODRINTH_MODS = [
  { slug: 'fabric-api', required: true },
  { slug: 'sodium' },        // 렌더링 최적화
  { slug: 'lithium' },       // 게임 로직 최적화
  { slug: 'ferrite-core' },  // 메모리 최적화
  { slug: 'entityculling' }, // 보이지 않는 엔티티 렌더 생략
  { slug: 'immediatelyfast' },
];

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

async function modrinthFile(slug, mc) {
  const q = `loaders=${encodeURIComponent('["fabric"]')}&game_versions=${encodeURIComponent(JSON.stringify([mc]))}`;
  const versions = await getJson(`https://api.modrinth.com/v2/project/${slug}/version?${q}`);
  const pick = versions.find((v) => v.version_type === 'release') || versions[0];
  if (!pick) return null;
  const f = pick.files.find((x) => x.primary) || pick.files[0];
  return { url: f.url, name: f.filename, sha1: f.hashes?.sha1 };
}

function bundledModsDir() {
  return app.isPackaged ? path.join(process.resourcesPath, 'mods') : path.join(__dirname, '..', 'mods');
}

async function installMods(instanceDir, mc, log) {
  const modsDir = path.join(instanceDir, 'mods');
  fs.mkdirSync(modsDir, { recursive: true });
  const manifestFile = path.join(modsDir, '.wn-managed.json');
  let previous = [];
  try { previous = JSON.parse(fs.readFileSync(manifestFile, 'utf8')); } catch {}
  const installed = [];

  for (const mod of MODRINTH_MODS) {
    const f = await modrinthFile(mod.slug, mc).catch(() => null);
    if (!f) {
      if (mod.required) throw new Error(`${mod.slug}의 ${mc} 버전을 찾지 못했어요.`);
      log(`[모드] ${mod.slug}: ${mc} 버전 없음, 건너뜀`);
      continue;
    }
    if (await download(f.url, path.join(modsDir, f.name), f.sha1)) log(`[모드] ${f.name} 설치`);
    installed.push(f.name);
  }

  // 직접 빌드한 WN Client 모드 (launcher/mods/wnclient-<버전>.jar)
  const own = path.join(bundledModsDir(), `wnclient-${mc}.jar`);
  if (fs.existsSync(own)) {
    fs.copyFileSync(own, path.join(modsDir, path.basename(own)));
    installed.push(path.basename(own));
  } else {
    log(`[경고] ${path.basename(own)} 파일이 없어요. 인게임 HUD 없이 실행됩니다.`);
  }

  // 이전에 런처가 넣었지만 이제 필요 없는 파일 정리 (사용자가 직접 넣은 모드는 건드리지 않음)
  for (const name of previous) {
    if (!installed.includes(name)) fs.rmSync(path.join(modsDir, name), { force: true });
  }
  fs.writeFileSync(manifestFile, JSON.stringify(installed, null, 2));
}

async function prepareInstance(baseDir, mc, log) {
  const instanceDir = path.join(baseDir, 'instances', mc);
  fs.mkdirSync(instanceDir, { recursive: true });
  log(`[설치] Fabric 로더 확인 중 (${mc})`);
  const customId = await installFabricProfile(baseDir, mc);
  log('[설치] 모드 확인 중');
  await installMods(instanceDir, mc, log);
  return { instanceDir, customId };
}

module.exports = { prepareInstance };
