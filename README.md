# SADE HOUSE — Usimamizi wa kodi na wapangaji (Tanzania)

Programu ya Kiswahili inayofanya kazi bila intaneti (baada ya kufunguliwa mara ya kwanza). Data huhifadhiwa kwenye simu yako (IndexedDB). Akaunti ya wingu ni ya hiari (angalia `CLOUD-SETUP.md`).

## Kilichomo
- Mali na vyumba, wapangaji, malipo ya kodi (kamili/sehemu/ya mbele), risiti
- Mikataba ya pango (rasimu ya Kiswahili, PDF kupitia Chapisha)
- Matumizi, ripoti ya kila mwezi (PDF/CSV), vikumbusho vya deni na mikataba inayoisha
- Hifadhi ya IndexedDB (inafanya kazi bila intaneti) na akaunti ya wingu ya hiari (barua pepe + nenosiri) ili kurejesha data ukipoteza simu
- Arifa za kodi inayokaribia/iliyochelewa na mikataba inayoisha (Zaidi → Vikumbusho na arifa)
- Nakala ya data (kupakua / kurejesha), hali ya mwanga na giza

## Folda
- `web/` — programu yenyewe (index.html, config.js, manifest, sw.js, aikoni za picha ya nyumba)
- `assets/` — picha za aikoni ya APK (zinatumika na workflow)
- `capacitor.config.json`, `package.json`, `.github/workflows/build-apk.yml` — kutengeneza APK
- `CLOUD-SETUP.md` — kuweka akaunti ya wingu (Firebase, mara moja na mwenye programu)
- `BUILD-GUIDE.md` — hatua za kina

## Kuanza haraka (bila APK)
Weka yaliyomo ya `web/` kwenye GitHub Pages, fungua kiungo kwa Chrome ya Android, kisha **Add to Home screen**.

## Nakala ya data
Zaidi → Hifadhi nakala → Pakua. Kurejesha: Zaidi → Rejesha nakala. Ukifuta programu au kupoteza simu bila nakala, data hupotea. Nakala haijasimbwa.

## Mipaka ya sasa (toleo hili)
Akaunti ya wingu haijajaribiwa na mradi halisi wa Firebase. Hakuna PIN/biometric, Kiingereza, vikumbusho vya kiotomatiki, picha/viambatisho, wala kuhariri mali/vyumba/wapangaji waliopo. APK haijajengwa wala kujaribiwa hapa.
