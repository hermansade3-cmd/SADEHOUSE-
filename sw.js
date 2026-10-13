const C='sadehouse-v3',A=['./','index.html','manifest.webmanifest','icon-192.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(A))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=C).map(x=>caches.delete(x))))));
self.addEventListener('fetch',e=>{if(e.request.method!='GET')return;e.respondWith(fetch(e.request).then(r=>{const p=r.clone();caches.open(C).then(c=>c.put(e.request,p));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))))});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window'}).then(l=>l.length?l[0].focus():clients.openWindow('./')))});
self.addEventListener('periodicsync',e=>{if(e.tag=='rent-check')e.waitUntil(bg())});
async function bg(){try{const db=await new Promise((ok,no)=>{const r=indexedDB.open('sadehouse',1);r.onsuccess=()=>ok(r.result);r.onerror=()=>no()}),o={};await new Promise(ok=>{const c=db.transaction('kv').objectStore('kv').openCursor();c.onsuccess=e=>{const x=e.target.result;if(x){o[x.key]=x.value;x.continue()}else ok()}});
const D={t:[],y:[],k:[],nt:{},...o};if(!D.nt.on)return;const td=new Date(Date.now()+10800000).toISOString().slice(0,10),m=NMSG(DUE(D,td),D);if(m)await self.registration.showNotification(m.title,{body:m.body,tag:'sh-due',icon:'icon-192.png',badge:'icon-192.png'})}catch(e){}}
function DUE(D,td){const P=s=>s.split('-').map(Number),dn=s=>{const a=P(s);return Date.UTC(a[0],a[1]-1,a[2])/864e5},mx=(s,e)=>{const a=P(s),b=P(e||td);return Math.max(0,(b[0]-a[0])*12+(b[1]-a[1])+1)},nt=D.nt||{},N=nt.days!=null?nt.days:3,d0=nt.dd||5,o={soon:[],late:[],end:[]};
D.t.filter(t=>t.s=='a').forEach(t=>{const k=D.k.filter(k=>k.tid==t.id).pop(),dd=Math.min(28,(k&&k.f.due)||d0),pd=D.y.filter(y=>y.t==t.id&&!y.v).reduce((x,y)=>x+y.a,0),b=mx(t.start,t.end)*t.rent-pd,c=P(td);
if(b>0){if(c[2]>dd||b>t.rent)o.late.push({t,b,days:0});else if(dd-c[2]<=N)o.soon.push({t,b,days:dd-c[2]})}
else{const r=t.rent+b;if(r>0){const df=dn(new Date(Date.UTC(c[0],c[1],dd)).toISOString().slice(0,10))-dn(td);if(df<=N)o.soon.push({t,b:r,days:df})}}});
D.k.forEach(k=>{const t=D.t.find(t=>t.id==k.tid);if(t&&t.s=='a'&&k.f.e>=td){const df=dn(k.f.e)-dn(td);if(df<=30)o.end.push({t,k,days:df})}});return o}
function NMSG(o,D){const a=o.late.length,b=o.soon.length,c=o.end.length;if(!a&&!b&&!c)return null;const nm=D.nt&&D.nt.hide===0,L=[];
if(a)L.push('Kodi imechelewa: '+(nm?o.late.map(x=>x.t.n).join(', '):a));
if(b)L.push('Kodi inakaribia: '+(nm?o.soon.map(x=>x.t.n+(x.days?' (siku '+x.days+')':' (leo)')).join(', '):b));
if(c)L.push('Mikataba inayoisha: '+(nm?o.end.map(x=>x.t.n+' (siku '+x.days+')').join(', '):c));
return{title:'SADE HOUSE — Kumbusho',body:L.join('\n')}}
