# CLOUD-SETUP — Akaunti ya wingu (barua pepe + nenosiri)

Akaunti ni ya hiari: inahifadhi nakala ya data wingu ili uirejeshe ukipoteza simu. Bila akaunti, programu inafanya kazi kama kawaida (data iko kwenye simu, IndexedDB).
Mtumiaji anajisajili kwa barua pepe yake (mf. Gmail), anaweka nenosiri na kulihakiki, anahifadhi akaunti, kisha anaingia. **Hakuna API key wala ID ya kuingiza ndani ya programu.**

Mwenye programu hufanya usanidi huu **mara moja tu**. Data hutumwa kwenye mradi wako wa Firebase (kiwango cha bure kinatosha kwa matumizi madogo), baada ya mtumiaji kuingia.

> Haijajaribiwa na mradi halisi wa Firebase wakati wa kutengeneza ZIP hii. Jaribu kwanza na data ya mfano.

## Hatua
1. console.firebase.google.com → **Add project**.
2. **Build → Authentication → Sign-in method → Email/Password → Enable** → Save.
3. **Build → Firestore Database → Create database**.
4. Firestore → **Rules**, weka hii kisha **Publish**:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```
5. **Project settings** → nakili **Project ID** na **Web API Key**.
6. Fungua faili `web/config.js` na ujaze:
```
window.SADE_CLOUD={key:"API_KEY_YAKO",pid:"PROJECT_ID_YAKO"};
```
7. Pakia `web/` (pamoja na config.js) kwenye GitHub Pages. Imekwisha.

## Mradi uliopo (sadebooks-ce48b)
`web/config.js` tayari imejazwa na mradi wa `sadebooks-ce48b`. Kinachobaki kwenye Firebase console ni: (1) Authentication → Email/Password → Enable; (2) Firestore Database iwe imeundwa; (3) kwenye Rules, **ongeza** kipande cha `match /users/{uid}` ndani ya rules zilizopo (usifute rules za SadeBooks); (4) kama API key ina vikwazo vya tovuti, ongeza anwani ya SADE HOUSE.

## Kwa mtumiaji
Zaidi → Akaunti na wingu → **Na akaunti** → **Jisajili** (barua pepe, nenosiri, rudia nenosiri) → **Hifadhi akaunti** → **Ingia**.
Simu mpya: Ingia kwa barua pepe ileile na kubali kurejesha data. "Umesahau nenosiri?" hutuma barua pepe ya kubadilisha nenosiri.

## Mambo ya kujua
- Config.js ikiwa tupu, skrini ya akaunti inaeleza kuwa wingu halijawekwa.
- Kupakia hutokea yenyewe ukiwa mtandaoni baada ya mabadiliko; skrini ya akaunti inaonyesha "haijapakiwa bado" ikiwa haijapakiwa.
- Simu mbili zikibadilisha data tofauti, ya mwisho kupakiwa ndiyo inabaki.
- Kikomo cha data takriban 900 KB (hakuna picha/viambatisho kwa sasa).
- Nenosiri halihifadhiwi kwenye programu. Barua pepe haihakikiwi kwa kiungo (bado).
- Wingu halifanyi kazi kwenye onyesho la ndani ya Claude.
