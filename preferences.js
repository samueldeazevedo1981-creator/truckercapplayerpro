/* Small, synchronous per-song settings; audio files remain in IndexedDB. */
window.TCPreferences=(()=>{
  const prefix='tcb_settings_v40_';
  const ranges={scrollSpeed:[.25,1.8],fontSize:[18,38],scrollBias:[-10000000,10000000],top:[0,10000000],left:[0,10000000],pdfZoom:[.5,2],volume:[0,1],pitchTones:[-4,2]};
  function clean(value){
    const result={};if(!value||typeof value!=='object'||Array.isArray(value))return result;
    for(const [key,[min,max]]of Object.entries(ranges))if(typeof value[key]==='number'&&Number.isFinite(value[key]))result[key]=Math.max(min,Math.min(max,value[key]));
    for(const key of ['autoScroll','autoPlay'])if(typeof value[key]==='boolean')result[key]=value[key];
    for(const key of ['selectedId','tab'])if(typeof value[key]==='string')result[key]=value[key];
    return result;
  }
  function read(kind,id){try{return clean(JSON.parse(localStorage.getItem(prefix+kind+'_'+id)||'{}'));}catch{return {};}}
  function write(kind,id,value){if(!id)return false;try{localStorage.setItem(prefix+kind+'_'+id,JSON.stringify(clean({...read(kind,id),...value})));return true;}catch{return false;}}
  return {read,write};
})();
