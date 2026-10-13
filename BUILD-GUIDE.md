# BUILD-GUIDE — SADE HOUSE

> APK **haijajengwa wala kujaribiwa** kwenye mazingira ya kutengeneza ZIP hii. Hatua hapa ni za kujaribu.

## A. Toleo la kivinjari (PWA) — linapendekezwa sasa
1. Tengeneza repo ya GitHub, pakia yaliyomo ya `web/` kwenye mzizi.
2. Settings → Pages → Branch: main → Save.
3. Fungua `https://JINA.github.io/REPO/` kwa Chrome ya Android → menyu → Add to Home screen.
4. Ukibadilisha `index.html`, ongeza namba ya `C='sadehouse-v1'` ndani ya `sw.js` ikiwa unataka simu zichukue toleo jipya mara moja.

## B. APK kwa GitHub Actions (hakuna kompyuta)
1. Pakia **mradi mzima** (ikiwemo `.github/`) kwenye repo ya GitHub.
2. Actions → "Build APK" → Run workflow.
3. Ikimaliza, pakua `SADE-HOUSE-debug-apk` kutoka Artifacts, toa ZIP, sakinisha `app-debug.apk` (ruhusu "install unknown apps").

## C. APK kwa Android Studio
Mahitaji: Node 20, JDK 17, Android Studio.
```
npm install
npx cap add android
npx cap sync android
npx cap open android      # Build > Build APK(s)
```
Matoleo: Capacitor 6.x.

## Mipaka ya APK (muhimu)
Aikoni ya APK inatengenezwa kutoka `assets/` kwa `@capacitor/assets` (haijajaribiwa).
Ndani ya WebView ya Android, **Chapisha/Hifadhi PDF** na **kupakua faili** (nakala ya data, CSV) huenda visifanye kazi hadi plugins za asili (Filesystem/Share/Print) ziongezwe — hiyo ni kazi ya Phase 4. Hadi hapo, tumia toleo la PWA (A) kwa PDF na nakala za data.
APK ya debug haijasainiwa kwa ajili ya Play Store.

## Arifa
Toleo la kivinjari/PWA hutoa arifa unapofungua programu (mara moja kwa siku kwa kila hali) na, kwenye Chrome ya Android ikiwa imewekwa kwenye skrini ya mwanzo, jaribio la kuangalia nyuma ya pazia (Periodic Background Sync; muda hautegemewi na Chrome inaweza isiruhusu). Arifa za uhakika kwa saa maalum zinahitaji Capacitor Local Notifications (Phase 4). Zimejaribiwa kwa mantiki tu, si kwenye simu.
