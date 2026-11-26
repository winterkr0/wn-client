const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UA = 'WNClient-Launcher/1.0.0 (wnsv.kr)';

async function getJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`요청 실패 ${res.status}: ${url}`);
  return res.json();
}

function sha1Of(file) {
  return crypto.createHash('sha1').update(fs.readFileSync(file)).digest('hex');
}

// sha1이 같으면 건너뜀
async function download(url, dest, sha1) {
  if (fs.existsSync(dest) && (!sha1 || sha1Of(dest) === sha1)) return false;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`다운로드 실패 ${res.status}: ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  return true;
}

// 동시 다운로드 제한
async function pool(items, limit, worker) {
  let i = 0;
  const run = async () => {
    while (i < items.length) {
      const idx = i++;
      await worker(items[idx], idx);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
}

module.exports = { getJson, download, pool, UA };
