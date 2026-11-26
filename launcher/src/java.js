// 마인크래프트 버전에 맞는 Java를 모장 공식 런타임에서 자동으로 받아옵니다.
// 1.20.1 → Java 17 (java-runtime-gamma), 1.20.5+ → Java 21 (java-runtime-delta)
const fs = require('fs');
const path = require('path');
const { getJson, download, pool } = require('./net');

const RUNTIME_INDEX =
  'https://launchermeta.mojang.com/v1/products/java-runtime/2ec0cc96c44e5a76b9c8b7c39df7210883d12871/all.json';
const VERSION_MANIFEST = 'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json';

function platformKey() {
  const arm = process.arch === 'arm64';
  if (process.platform === 'win32') return arm ? 'windows-arm64' : process.arch === 'ia32' ? 'windows-x86' : 'windows-x64';
  if (process.platform === 'darwin') return arm ? 'mac-os-arm64' : 'mac-os';
  return 'linux';
}

async function javaComponentFor(mcVersion) {
  const manifest = await getJson(VERSION_MANIFEST);
  const entry = manifest.versions.find((v) => v.id === mcVersion);
  if (!entry) throw new Error(`알 수 없는 버전: ${mcVersion}`);
  const vjson = await getJson(entry.url);
  return vjson.javaVersion?.component || 'java-runtime-gamma';
}

function javaBinary(runtimeDir) {
  if (process.platform === 'win32') return path.join(runtimeDir, 'bin', 'javaw.exe');
  if (process.platform === 'darwin') return path.join(runtimeDir, 'jre.bundle', 'Contents', 'Home', 'bin', 'java');
  return path.join(runtimeDir, 'bin', 'java');
}

async function ensureJava(baseDir, mcVersion, onProgress) {
  const component = await javaComponentFor(mcVersion);
  const runtimeDir = path.join(baseDir, 'runtime', component);
  const bin = javaBinary(runtimeDir);
  const marker = path.join(runtimeDir, '.complete');
  if (fs.existsSync(bin) && fs.existsSync(marker)) return bin;

  const index = await getJson(RUNTIME_INDEX);
  const list = index[platformKey()]?.[component];
  if (!list || !list.length) throw new Error(`이 OS용 ${component} 런타임을 찾지 못했어요.`);
  const files = (await getJson(list[0].manifest.url)).files;

  const entries = Object.entries(files);
  for (const [rel, info] of entries) {
    if (info.type === 'directory') fs.mkdirSync(path.join(runtimeDir, rel), { recursive: true });
  }
  const toDownload = entries.filter(([, info]) => info.type === 'file');
  let done = 0;
  await pool(toDownload, 16, async ([rel, info]) => {
    const dest = path.join(runtimeDir, rel);
    await download(info.downloads.raw.url, dest, info.downloads.raw.sha1);
    if (info.executable && process.platform !== 'win32') fs.chmodSync(dest, 0o755);
    done++;
    if (done % 20 === 0 || done === toDownload.length) onProgress?.(`Java 설치 중 (${done}/${toDownload.length})`, done / toDownload.length);
  });
  for (const [rel, info] of entries) {
    if (info.type === 'link' && process.platform !== 'win32') {
      const p = path.join(runtimeDir, rel);
      if (!fs.existsSync(p)) fs.symlinkSync(info.target, p);
    }
  }
  fs.writeFileSync(marker, component);
  return bin;
}

module.exports = { ensureJava };
