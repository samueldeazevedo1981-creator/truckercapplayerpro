/* Escapes user text before highlighting; spacing is preserved by the lyrics viewer. */
window.TCLyrics=(()=>{
  const escape=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const chord=/^[A-G](?:#|b|♯|♭)?(?:(?:maj|min|sus|add|dim|aug|omit|m|M|Δ|ø|°|º|\+|-)|\d|[#b♯♭(),])*(?:\/[A-G](?:#|b|♯|♭)?)?$/;
  const token=s=>chord.test(s)||/^(?:N\.?C\.?|[xX]\d+|[%|:()[\]{}\-–]+)$/.test(s);
  const tab=s=>/^\s*(?:[eEBGDAFC](?:#|b)?\s*)?[|:][\d\s\-–|:xXhpbrt~^/\\().<>+]+$/.test(s)&&/[\-–]{2}|\d/.test(s);
  function isMusicLine(s){
    if(tab(s))return true;
    const parts=s.trim().split(/\s+/).filter(Boolean);
    return parts.length>0&&parts.every(token)&&parts.some(t=>chord.test(t));
  }
  function format(text){return text.split('\n').map(line=>{
    if(isMusicLine(line))return '<span class="chord">'+escape(line)+'</span>';
    // ChordPro brackets are explicit, even when the chord occurs in a lyric sentence.
    return line.split(/(\[[^\]\n]+\])/g).map(part=>{
      if(/^\[.*\]$/.test(part)&&chord.test(part.slice(1,-1)))return '<span class="chord">'+escape(part)+'</span>';
      return escape(part);
    }).join('');
  }).join('\n');}
  return {format,isMusicLine};
})();
