/* SADE HOUSE — login.js
   Akaunti ya hiari (Firebase Authentication + Firestore kupitia REST, bila SDK wala build).
   - Bila akaunti (mgeni): data iko kwenye IndexedDB 'sadehouse' ya simu hii.
   - Kila akaunti: IndexedDB yake 'sadehouse-u-<uid>' kwenye simu na hati yake 'users/<uid>' kwenye Firestore.
     Watumiaji wengi hawaingiliani: data ya mmoja haiwezi kuonekana wala kuandikwa na mwingine.
   Inategemea config.js (window.firebaseConfig) na kazi za index.html: D, def, save, R, toast, M, X, esc, fd. */
(function () {
'use strict';
const SK = 'sh_session', GK = 'sh_guest', MK = 'sh_meta_';
// Config chaguo-msingi (mradi sadegpt-f79d7). config.js ikiwepo, inatangulia. API key ya Firebase si siri; Rules za Firestore ndizo zinazolinda data.
const DEF_CFG = { apiKey: "AIzaSyDCKHDp1VpDTRr4-HGqgE1OFkEwWIDZyqI", authDomain: "sadegpt-f79d7.firebaseapp.com", projectId: "sadegpt-f79d7", storageBucket: "sadegpt-f79d7.firebasestorage.app", messagingSenderId: "474328809093", appId: "1:474328809093:web:f8bde3022a5462499fb3ec", measurementId: "G-BR71PVS79N" };
const cfg = () => (window.firebaseConfig && window.firebaseConfig.apiKey) ? window.firebaseConfig : DEF_CFG;
const ready = () => !!(cfg().apiKey && cfg().projectId);
const jget = k => { try { return JSON.parse(localStorage.getItem(k) || 'null') } catch (e) { return null } };
const jset = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) {} };
const q = s => document.querySelector(s);

let S = jget(SK) || {};                       // kikao: uid, email, rt, t, exp
const saveS = () => jset(SK, S);
const meta = () => (S.uid && jget(MK + S.uid)) || {};   // kwa kila akaunti: at (mara ya mwisho kupakiwa), pend
const setMeta = m => { if (S.uid) jset(MK + S.uid, { ...meta(), ...m }) };
const dbName = () => S.uid ? 'sadehouse-u-' + S.uid : 'sadehouse';

/* ---------- IndexedDB (kwa kubadilisha hifadhi kabla ya kupakia upya) ---------- */
const openDb = n => new Promise((ok, no) => { const r = indexedDB.open(n, 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error) });
async function dbAll(n) {
  const d = await openDb(n);
  return new Promise((ok, no) => { const o = {}, c = d.transaction('kv').objectStore('kv').openCursor(); c.onsuccess = e => { const x = e.target.result; if (x) { o[x.key] = x.value; x.continue() } else { d.close(); ok(o) } }; c.onerror = () => no(c.error) });
}
async function dbPut(n, obj) {
  const d = await openDb(n);
  return new Promise((ok, no) => { const tx = d.transaction('kv', 'readwrite'), s = tx.objectStore('kv'); s.clear(); Object.keys(obj).forEach(k => s.put(obj[k], k)); tx.oncomplete = () => { d.close(); ok() }; tx.onerror = () => no(tx.error) });
}
const dbDel = n => new Promise(ok => { const r = indexedDB.deleteDatabase(n); r.onsuccess = r.onerror = r.onblocked = () => ok() });
// Huambia sw.js ni hifadhi ipi inayotumika (kwa arifa za nyuma ya pazia)
const setActive = () => new Promise(ok => { try { const r = indexedDB.open('sadehouse-meta', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => { try { const d = r.result, tx = d.transaction('kv', 'readwrite'); tx.objectStore('kv').put(dbName(), 'active'); tx.oncomplete = () => { d.close(); ok() }; tx.onerror = () => ok() } catch (e) { ok() } }; r.onerror = () => ok() } catch (e) { ok() } });

const valid = c => c && ['p', 'u', 't', 'y'].every(k => Array.isArray(c[k]));
const hasD = o => ['p', 't', 'y', 'x', 'k'].some(k => Array.isArray(o[k]) && o[k].length);
const clean = o => { const c = { ...o }; delete c.acc; return { ...def(), ...c } };

/* ---------- Firebase Auth + Firestore (REST) ---------- */
const FE = { EMAIL_EXISTS: 'Barua pepe hii tayari ina akaunti.', INVALID_LOGIN_CREDENTIALS: 'Barua pepe au nenosiri si sahihi.', INVALID_PASSWORD: 'Barua pepe au nenosiri si sahihi.', EMAIL_NOT_FOUND: 'Barua pepe hii haina akaunti.', INVALID_EMAIL: 'Barua pepe si sahihi.', OPERATION_NOT_ALLOWED: 'Washa Email/Password kwenye Firebase (Authentication).', WEAK_PASSWORD: 'Nenosiri ni dhaifu (angalau herufi 6).', TOO_MANY_ATTEMPTS_TRY_LATER: 'Majaribio mengi. Jaribu tena baadaye.', USER_DISABLED: 'Akaunti hii imezimwa.' };
async function fa(p, b) {
  const r = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:' + p + '?key=' + cfg().apiKey, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }), j = await r.json();
  if (!r.ok) { const m = (j.error && j.error.message) || 'Hitilafu'; throw new Error(FE[m.split(' ')[0]] || m) }
  return j;
}
async function tok() {
  if (S.t && S.exp > Date.now() + 60000) return S.t;
  const r = await fetch('https://securetoken.googleapis.com/v1/token?key=' + cfg().apiKey, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(S.rt) }), j = await r.json();
  if (!r.ok) throw new Error('Ingia tena kwenye akaunti.');
  S.t = j.id_token; S.rt = j.refresh_token; S.exp = Date.now() + j.expires_in * 1000; saveS(); return S.t;
}
const du = () => 'https://firestore.googleapis.com/v1/projects/' + cfg().projectId + '/databases/(default)/documents/users/' + S.uid;
let ver = 0, noq = 0, cq = 0;
async function push(silent, str) {
  if (!S.uid || !ready()) return;
  const v = ver;
  try {
    const s = str || JSON.stringify(D);
    if (s.length > 900000) throw new Error('Data ni kubwa mno kwa wingu (zaidi ya 900KB).');
    const t = await tok(), at = new Date().toISOString();
    const r = await fetch(du() + '?updateMask.fieldPaths=data&updateMask.fieldPaths=at', { method: 'PATCH', headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: { data: { stringValue: s }, at: { stringValue: at } } }) });
    if (!r.ok) { const j = await r.json(); throw new Error((j.error && j.error.message) || 'Hitilafu') }
    setMeta(v === ver || str ? { at, pend: 0 } : { at });
    if (!silent) toast('Imehifadhiwa wingu');
  } catch (e) { setMeta({ pend: 1 }); if (!silent) throw e }
}
async function pull() {
  const t = await tok(), r = await fetch(du(), { headers: { Authorization: 'Bearer ' + t } });
  if (r.status == 404) return null;
  const j = await r.json(); if (!r.ok) throw new Error((j.error && j.error.message) || 'Hitilafu');
  const f = j.fields || {}, s = f.data && f.data.stringValue;
  return s ? { d: JSON.parse(s), at: (f.at && f.at.stringValue) || '' } : null;
}
// Huitwa na save() ya index.html baada ya kila mabadiliko ya data
window.cloudQ = function () {
  if (!S.uid || Date.now() < noq) return;
  ver++; setMeta({ pend: 1 }); clearTimeout(cq);
  cq = setTimeout(() => navigator.onLine && push(1), 4000);
};
async function run(f, onErr) {
  if (!navigator.onLine) return onErr('Hakuna intaneti. Jaribu ukiwa mtandaoni.');
  try { await f() } catch (e) { const m = String(e.message || e); onErr(/permission/i.test(m) ? 'Hakuna ruhusa ya Firestore. Mwenye programu aweke Rules (angalia CLOUD-SETUP.md).' : 'Imeshindwa: ' + m) }
}

/* ---------- Kuingia: kuandaa hifadhi ya mtumiaji kisha kupakia upya ---------- */
async function finish(j, em) {
  const prev = S;
  S = { uid: j.localId, email: em, rt: j.refreshToken, t: j.idToken, exp: Date.now() + j.expiresIn * 1000 };
  try {
    const c = await pull(), un = dbName(), u = await dbAll(un), mt = meta();
    let seed, g = null;
    if (c && valid(c.d)) {
      seed = (hasD(u) && mt.pend && confirm('Simu hii ina mabadiliko ya akaunti hii ambayo hayajapakiwa wingu.\n\nOK = tumia data ya simu (iandike juu ya ya wingu)\nGhairi = tumia data ya wingu')) ? 'local' : 'cloud';
    } else if (hasD(u)) seed = 'local';
    else {
      g = await dbAll('sadehouse');
      seed = (hasD(g) && confirm('Hamisha data ya simu hii (uliyotumia bila akaunti) kwenye akaunti yako?\n\nOK = hamisha\nGhairi = anza akaunti tupu\n(Data ya "bila akaunti" inabaki kama ilivyo.)')) ? 'guest' : 'empty';
    }
    if (seed == 'cloud') { await dbPut(un, clean(c.d)); setMeta({ at: c.at, pend: 0 }) }
    else if (seed == 'guest') { const o = clean(g); await dbPut(un, o); setMeta({ pend: 1 }); await push(1, JSON.stringify(o)) }
    else if (seed == 'local') { const o = clean(u); await push(1, JSON.stringify(o)) }
    else { await dbPut(un, def()); setMeta({ pend: 0 }) }
    saveS(); localStorage.removeItem(GK); await setActive();
    location.reload();
  } catch (e) { S = prev; throw e }
}

async function out(wipe) {
  if (!S.uid) return;
  if (!confirm(wipe ? 'Utatoka na data ya akaunti hii itafutwa kwenye simu hii (inabaki wingu). Endelea?' : 'Utatoka kwenye akaunti hii. Data yake inabaki kwenye simu hii na wingu. Endelea?')) return;
  if (navigator.onLine && meta().pend) { try { await push(1) } catch (e) {} }
  if (wipe && meta().pend && !confirm('Mabadiliko ya hivi karibuni hayajapakiwa wingu na yatapotea. Futa hata hivyo?')) return;
  const un = dbName(), uid = S.uid;
  S = {}; localStorage.removeItem(SK); jset(GK, 1);
  if (wipe) { try { DB && DB.close() } catch (e) {} await dbDel(un); localStorage.removeItem(MK + uid); localStorage.removeItem(un) }
  await setActive(); location.reload();
}

/* ---------- Skrini ya kuingia (overlay) ---------- */
let mode = 'in';
function css() {
  if (q('#lgcss')) return;
  const s = document.createElement('style'); s.id = 'lgcss';
  s.textContent = '#lg{position:fixed;inset:0;z-index:30;background:var(--bg);color:var(--tx);overflow:auto;display:none}#lg.on{display:block}' +
    '#lgc{max-width:420px;margin:0 auto;padding:calc(26px + env(safe-area-inset-top,0px)) 20px calc(40px + env(safe-area-inset-bottom,0px))}' +
    '#lgc h1{margin:22px 0 6px;font-size:24px;font-weight:800;color:var(--g)}#lgc p{color:var(--mu);margin:0 0 12px}' +
    '#lgc label{display:block;margin:12px 0;font-weight:600;font-size:13px}' +
    '#lgc input[type=email],#lgc input[type=password],#lgc input[type=text]{width:100%;padding:12px;margin-top:4px;border:1px solid var(--ln);border-radius:12px;background:var(--cd);color:var(--tx);font:inherit}' +
    '#lgc .lgb{width:100%;padding:13px;border:0;border-radius:12px;font:inherit;font-weight:700;background:var(--g);color:var(--on);margin-top:6px}#lgc .lgb:disabled{opacity:.6}' +
    '#lgc .lgs{width:100%;padding:12px;border:1px solid var(--ln);border-radius:12px;font:inherit;font-weight:600;background:none;color:var(--tx);margin-top:8px}' +
    '#lgc .lgt{display:flex;gap:6px;background:var(--cd);padding:4px;border-radius:14px;margin-top:6px}#lgc .lgt button{flex:1;padding:10px;border:0;border-radius:11px;font:inherit;font-weight:700;background:none;color:var(--mu)}#lgc .lgt button.on{background:var(--g);color:var(--on)}' +
    '#lgc .lgk{display:flex;gap:8px;align-items:center;font-weight:400}#lgc .lgk input{width:auto;margin:0}#lgc .lge{color:var(--rd);min-height:20px;margin:6px 0 0}#lgc .lgl{background:none;border:0;color:var(--g);font:inherit;font-weight:600;padding:8px 0;text-decoration:underline}';
  document.head.appendChild(s);
}
function draw() {
  const o = q('#lg'), up = mode == 'up', em = esc(jget('sh_last') || '');
  const form = ready() ?
    '<div class=lgt><button class="' + (up ? '' : 'on') + '" onclick="LG.mode(\'in\')">Ingia</button><button class="' + (up ? 'on' : '') + '" onclick="LG.mode(\'up\')">Jisajili</button></div>' +
    '<label>Barua pepe<input id=lge type=email autocomplete=' + (up ? 'email' : 'username') + ' value="' + em + '"></label>' +
    '<label>Nenosiri' + (up ? ' (angalau herufi 6)' : '') + '<input id=lgp class=lgpw type=password autocomplete=' + (up ? 'new-password' : 'current-password') + '></label>' +
    (up ? '<label>Rudia nenosiri<input id=lgp2 class=lgpw type=password autocomplete=new-password></label>' : '') +
    '<label class=lgk><input type=checkbox onchange="LG.spw(this.checked)">Onyesha nenosiri</label>' +
    '<p id=lgerr class=lge></p>' +
    '<button id=lggo class=lgb onclick="' + (up ? 'LG.up()' : 'LG.in()') + '">' + (up ? 'Fungua akaunti' : 'Ingia') + '</button>' +
    (up ? '' : '<button class=lgl onclick="LG.rs()">Umesahau nenosiri?</button>')
    : '<p class=lge>Huduma ya akaunti haijawekwa kwenye programu hii. Endelea bila akaunti.</p>';
  o.innerHTML = '<div id=lgc><div style="display:flex;gap:12px;align-items:center"><img src="icon-192.png" width=48 height=48 alt="" style="border-radius:12px"><div><b style="font-size:18px;letter-spacing:.6px;color:var(--g)">SADE HOUSE</b><br><small style="color:var(--mu)">Usimamizi wa kodi na wapangaji</small></div></div>' +
    '<h1>' + (up ? 'Fungua akaunti' : 'Karibu') + '</h1>' +
    '<p>' + (up ? 'Jisajili kwa barua pepe yako. Data yako ni yako peke yako; haichanganyiki na ya watumiaji wengine.' : 'Ingia ili data yako ihifadhiwe wingu na irejeshwe ukipoteza simu. Kila akaunti ina data yake peke yake.') + '</p>' +
    form + '<button class=lgs onclick="LG.guest()">Endelea bila akaunti</button>' +
    '<p style="margin-top:14px;font-size:12px">Bila akaunti, programu inafanya kazi kama kawaida na data iko kwenye simu hii tu.</p></div>';
}
function show() { css(); let o = q('#lg'); if (!o) { o = document.createElement('div'); o.id = 'lg'; document.body.appendChild(o) } draw(); o.classList.add('on') }
function hide() { const o = q('#lg'); if (o) o.classList.remove('on') }
const err = x => { const e = q('#lgerr'); if (e) e.textContent = x };
function busy(on) { const b = q('#lggo'); if (b) { b.disabled = on; if (on) b.dataset.t = b.textContent, b.textContent = 'Subiri…'; else if (b.dataset.t) b.textContent = b.dataset.t } }
const okE = e => /^\S+@\S+\.\S+$/.test(e);
async function go(f) { err(''); busy(true); await run(f, x => err(x)); busy(false) }

function panel() {
  const m = meta();
  M('<h3 style="margin-top:0">Akaunti</h3><p>Umeingia: <b>' + esc(S.email) + '</b><br>Mara ya mwisho kupakiwa wingu: ' + (m.at ? fd(m.at.slice(0, 10)) + ' ' + m.at.slice(11, 16) + ' (UTC)' : 'haijawahi') + (m.pend ? '<br><span class=neg>Mabadiliko ya hivi karibuni hayajapakiwa bado.</span>' : '') + '</p>' +
    '<p>Data ya akaunti hii ina hifadhi yake kwenye simu hii, kando na watumiaji wengine, na hupakiwa wingu yenyewe ukiwa mtandaoni.</p>' +
    '<div class=bt><button onclick="LG.push()">Pakia sasa</button><button class=s onclick="LG.pullNow()">Pakua kutoka wingu</button></div>' +
    '<div class=bt><button class=d onclick="LG.out(0)">Toka</button><button class=d onclick="LG.out(1)">Toka na ufute data ya simu</button></div>' +
    '<div class=bt><button class=s onclick="X()">Funga</button></div>');
}

/* ---------- API ya nje (inatumiwa na index.html) ---------- */
window.LG = {
  db: dbName,
  label: () => S.uid ? S.email : 'Bila akaunti (data kwenye simu hii)',
  mode(m) { mode = m; draw() },
  spw(c) { document.querySelectorAll('#lgc .lgpw').forEach(e => e.type = c ? 'text' : 'password') },
  guest() { jset(GK, 1); hide() },
  in() {
    const em = q('#lge').value.trim(), pw = q('#lgp').value;
    if (!okE(em) || !pw) return err('Weka barua pepe na nenosiri.');
    go(async () => { const j = await fa('signInWithPassword', { email: em, password: pw, returnSecureToken: true }); jset('sh_last', em); await finish(j, em) });
  },
  up() {
    const em = q('#lge').value.trim(), p1 = q('#lgp').value, p2 = q('#lgp2').value;
    if (!okE(em)) return err('Weka barua pepe sahihi.');
    if (p1.length < 6) return err('Nenosiri liwe na angalau herufi 6.');
    if (p1 !== p2) return err('Nenosiri mbili hazifanani. Zihakiki.');
    go(async () => { const j = await fa('signUp', { email: em, password: p1, returnSecureToken: true }); jset('sh_last', em); await finish(j, em) });
  },
  rs() {
    const em = q('#lge').value.trim();
    if (!okE(em)) return err('Andika barua pepe yako kwanza.');
    go(async () => { await fa('sendOobCode', { requestType: 'PASSWORD_RESET', email: em }); err(''); toast('Barua pepe ya kubadilisha nenosiri imetumwa (angalia pia Spam).') });
  },
  push() { run(async () => { await push(); panel() }, x => toast(x)) },
  pullNow() {
    if (!confirm('Data ya simu itabadilishwa na ya wingu. Endelea?')) return;
    run(async () => {
      const c = await pull(); if (!c || !valid(c.d)) return toast('Hakuna data sahihi wingu');
      noq = Date.now() + 1500; D = clean(c.d); save(); setMeta({ at: c.at, pend: 0 }); R(); panel(); toast('Imerejeshwa kutoka wingu');
    }, x => toast(x));
  },
  out,
  async boot() {
    await setActive();
    addEventListener('online', () => { if (S.uid && meta().pend) push(1) });
    if (S.uid) {
      if (!navigator.onLine) return;
      try {
        if (meta().pend) await push(1);
        else {
          const c = await pull();
          if (c && valid(c.d) && c.at && c.at > (meta().at || '')) { noq = Date.now() + 1500; D = clean(c.d); save(); setMeta({ at: c.at, pend: 0 }); R(); toast('Data imesasishwa kutoka wingu') }
        }
      } catch (e) {}
    } else if (!jget(GK) && ready()) show();
  }
};
window.AC = function () { if (S.uid) panel(); else { mode = 'in'; show() } };
})();
