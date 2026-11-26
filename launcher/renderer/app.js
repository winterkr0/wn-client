const $ = (id) => document.getElementById(id);
let account = null;
let cfg = null;

function setAccount(acc) {
  account = acc;
  $('accName').textContent = acc ? acc.name : '로그인 필요';
  $('accBtn').textContent = acc ? '로그아웃' : 'Microsoft 로그인';
  $('avatar').src = acc ? `https://mc-heads.net/avatar/${acc.uuid}/40` : '';
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
  $('serverLine').textContent = cfg.autoJoin ? `${cfg.server} 바로 접속` : '메인 화면으로 실행';
}

async function init() {
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
