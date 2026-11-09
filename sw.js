/* 测试英语突击 · 网络优先缓存策略 */
const CACHE='qa-english-v1';
const CORE=['./index.html','./icon-192.png','./icon-512.png'];

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE).catch(()=>{})).then(()=>{}));
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

function isDoc(req){
  return req.mode==='navigate' || (req.headers.get('accept')||'').includes('text/html');
}

self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET') return;

  if(isDoc(req)){
    e.respondWith(
      fetch(req,{cache:'no-store'})
        .then(res=>{
          const copy=res.clone();
          caches.open(CACHE).then(c=>c.put('./index.html',copy));
          return res;
        })
        .catch(()=>caches.match('./index.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(hit=>{
      if(hit) return hit;
      return fetch(req).then(res=>{
        if(res && res.status===200 && res.type==='basic'){
          const copy=res.clone();
          caches.open(CACHE).then(c=>c.put(req,copy));
        }
        return res;
      });
    })
  );
});
//（注：内容由AI生成）
