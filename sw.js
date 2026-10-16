const CACHE_NAME = 'trucker-cap-player-offline-v36';
const PREFIX = 'trucker-cap-player-';
// Only executable app resources may block offline installation.
const APP_SHELL = ['./index.html','./soundtouch-node.js','./constants.js','./soundtouch-processor.js','./vendor/tailwind.js','./vendor/pdf.min.mjs','./vendor/pdf.worker.min.mjs'];
const OPTIONAL_ASSETS = ['./manifest.json','./icon.png','./icon-192.png','./icon-512.png','./SOUNDTOUCH-LICENSE.txt'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE_NAME);
  // Bypass the HTTP cache so a deployment cannot silently reuse stale files.
  await cache.addAll(APP_SHELL.map(path=>new Request(new URL(path,self.registration.scope),{cache:'reload'})));
  // A missing icon or license must not disable the entire offline app.
  await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE_NAME).map(key=>caches.delete(key)));
  await self.clients.claim();
  const cache=await caches.open(CACHE_NAME);
  await Promise.allSettled(OPTIONAL_ASSETS.map(async path=>{
    const url=new URL(path,self.registration.scope);
    const abort=new AbortController(),timeout=setTimeout(()=>abort.abort(),5000);
    try{const response=await fetch(new Request(url,{cache:'reload',signal:abort.signal}));if(response.ok)await cache.put(url,response)}catch{}finally{clearTimeout(timeout)}
  }));
})()));
self.addEventListener('message',event=>{
  if(event.data?.type!=='OFFLINE_STATUS'||!event.ports[0])return;
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    const found=await Promise.all(APP_SHELL.map(path=>cache.match(new URL(path,self.registration.scope))));
    event.ports[0].postMessage({ready:found.every(Boolean),version:CACHE_NAME});
  })());
});
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE_NAME);
    if(request.mode==='navigate')return (await cache.match(new URL('./index.html',self.registration.scope)))||fetch(request);
    const cached=await cache.match(request,{ignoreSearch:true});
    if(cached)return cached;
    // Never return HTML as a missing JS, PDF or audio resource.
    return fetch(request);
  })());
});
