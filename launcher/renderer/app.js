const $ = (id) => document.getElementById(id);
let account = null;
let cfg = null;

function setAccount(acc) {
  account = acc;
  $('accName').textContent = acc ? acc.name : '로그인 필요';
  $('accBtn').textContent = acc ? '로그아웃' : 'Microsoft 로그인';
  $('avatar').classList.toggle('hidden', !acc);
  if (acc) $('avatar').src = `https://mc-heads.net/avatar/${acc.uuid}/40`;
  $('hello').textContent = acc ? `어서 와요, ${acc.name}님` : '어서 와요';
  $('play').disabled = !acc;
  if (!acc) $('status').textContent = '먼저 로그인해 주세요';
}

function appendLog(line) {
  const el = $('log');
  el.textContent += line + '\n';
  if (el.textContent.length > 200000) el.textContent = el.textContent.slice(-150000);
  el.scrollTop = el.scrollHeight;
}

async function save(patch) {
  cfg = await window.wn.setConfig(patch);
  $('serverLine').textContent = cfg.autoJoin ? `${cfg.server} 으로 바로 들어가요` : '마인크래프트 메인 화면으로 시작해요';
}

function spawnPetals() {
  const box = $('petals');
  if (!box) return;
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('span');
    p.className = 'petal';
    p.style.left = `${Math.random() * 110}%`;
    p.style.setProperty('--dur', `${10 + Math.random() * 10}s`);
    p.style.setProperty('--delay', `${-Math.random() * 20}s`);
    p.style.setProperty('--sway', `${2 + Math.random() * 3}s`);
    const k = 0.6 + Math.random() * 0.7;
    p.style.width = `${12 * k}px`;
    p.style.height = `${9 * k}px`;
    box.appendChild(p);
  }
}

async function init() {
  spawnPetals();
  $('avatar').onerror = () => $('avatar').classList.add('hidden');
  const info = await window.wn.info();
  document.title = info.brand.name;
  $('brandName').textContent = info.brand.name;
  cfg = await window.wn.getConfig();

  for (const v of info.versions) {
    const o = document.createElement('option');
    o.value = v; o.textContent = v;
    $('version').appendChild(o);
  }
  $('version').value = cfg.version;
  $('autoJoin').checked = cfg.autoJoin;
  $('hideOnLaunch').checked = cfg.hideOnLaunch;
  $('server').value = cfg.server;
  $('ram').value = cfg.ramMb;
  $('ramLabel').textContent = `${cfg.ramMb} MB`;
  await save({});

  $('version').onchange = (e) => save({ version: e.target.value });
  $('autoJoin').onchange = (e) => save({ autoJoin: e.target.checked });
  $('hideOnLaunch').onchange = (e) => save({ hideOnLaunch: e.target.checked });
  $('server').onchange = (e) => save({ server: e.target.value.trim() });
  $('ram').oninput = (e) => ($('ramLabel').textContent = `${e.target.value} MB`);
  $('ram').onchange = (e) => save({ ramMb: Number(e.target.value) });
  $('openDir').onclick = () => window.wn.openGameDir();

  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.onclick = () => {
      document.querySelectorAll('.nav-item').forEach((b) => b.classList.toggle('active', b === btn));
      document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.id === `tab-${btn.dataset.tab}`));
    };
  });

  $('accBtn').onclick = async () => {
    if (account) { await window.wn.logout(); setAccount(null); return; }
    try {
      $('status').textContent = '로그인 창을 확인해 주세요';
      setAccount(await window.wn.login());
      $('status').textContent = '준비됨';
    } catch (e) {
      $('status').textContent = '로그인 실패: ' + (e.message || e);
    }
  };

  $('play').onclick = async () => {
    $('play').disabled = true;
    try {
      await window.wn.launch();
    } catch (e) {
      $('status').textContent = '실행 실패 — 로그 탭을 확인해 주세요';
      $('play').disabled = !account;
    }
  };

  $('appVersion').textContent = 'v' + (await window.wn.version());
  $('updateBtn').onclick = () => window.wn.installUpdate();
  window.wn.onUpdate((u) => {
    $('update').hidden = false;
    if (u.state === 'downloading') {
      $('updateText').textContent = `새 버전${u.version ? ' v' + u.version : ''} 받는 중… ${u.percent || 0}%`;
    } else if (u.state === 'ready') {
      $('updateText').textContent = `v${u.version} 업데이트 준비 완료`;
      $('updateBtn').hidden = false;
    }
  });

  window.wn.onLog(appendLog);
  window.wn.onProgress(({ label, ratio }) => {
    $('status').textContent = label;
    $('bar').style.width = `${Math.round((ratio || 0) * 100)}%`;
  });
  window.wn.onState((s) => {
    if (s === 'idle') { $('play').disabled = !account; $('play').textContent = '플레이'; $('bar').style.width = '0'; $('status').textContent = '준비됨'; }
    if (s === 'preparing') $('play').textContent = '준비 중…';
    if (s === 'running') $('play').textContent = '실행 중';
  });

  $('status').textContent = '계정 확인 중…';
  setAccount(await window.wn.restore().catch(() => null));
  if (account) $('status').textContent = '준비됨';
}

init();
