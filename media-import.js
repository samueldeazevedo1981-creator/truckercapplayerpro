/* File picker helpers: do not retain transient cloud File handles in IndexedDB. */
window.TCMediaImport=(()=>{
  const videoExt=/\.(mp4|webm|mov|m4v)$/i;
  const mediaExt=/\.(mp3|wav|m4a|aac|aif|aiff|ogg|opus|flac|mp4|webm|mov|m4v)$/i;
  const mimeFor={mp3:'audio/mpeg',wav:'audio/wav',m4a:'audio/mp4',aac:'audio/aac',aif:'audio/aiff',aiff:'audio/aiff',ogg:'audio/ogg',opus:'audio/ogg',flac:'audio/flac',mp4:'video/mp4',webm:'video/webm',mov:'video/quicktime',m4v:'video/mp4'};
  const isVideo=f=>String(f.type||'').startsWith('video/')||videoExt.test(f.name||'');
  const isMedia=f=>/^(audio|video)\//.test(f.type||'')||mediaExt.test(f.name||'');
  async function readBlob(file){
    if(!file.size){const err=new Error('empty');err.name='EmptyFileError';throw err;}
    const bytes=typeof file.arrayBuffer==='function'?await file.arrayBuffer():await new Promise((resolve,reject)=>{
      const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error||new Error('read'));reader.onabort=()=>{const err=new Error('aborted');err.name='AbortError';reject(err)};reader.readAsArrayBuffer(file);
    });
    if(bytes.byteLength!==file.size){const err=new Error('incomplete');err.name='NotReadableError';throw err;}
    const extension=String(file.name||'').split('.').pop().toLowerCase();
    const type=/^(audio|video)\//.test(file.type||'')?file.type:(mimeFor[extension]||'application/octet-stream');
    return new Blob([bytes],{type});
  }
  function errorMessage(err){
    if(err?.name==='QuotaExceededError')return 'Sem espaço local. Libere espaço no aparelho ou remova faixas e tente novamente.';
    if(err?.name==='EmptyFileError')return 'Arquivo vazio ou ainda não baixado. Baixe no app Arquivos e selecione novamente.';
    if(['NotReadableError','NotFoundError','AbortError'].includes(err?.name))return 'Não foi possível ler o arquivo. Baixe no app Arquivos (No Meu iPhone) e tente novamente.';
    if(['SecurityError','InvalidStateError'].includes(err?.name))return 'Armazenamento indisponível. Reabra o app fora da navegação privada e tente novamente.';
    return 'Não foi possível importar. Confirme que o arquivo está baixado no aparelho e tente um MP3 menor. Se persistir, informe o nome e o tamanho do arquivo.';
  }
  return {isVideo,isMedia,readBlob,errorMessage};
})();
