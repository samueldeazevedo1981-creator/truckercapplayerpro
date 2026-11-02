/* Keyboard/HID pedal control: no Bluetooth or MIDI permission required. */
window.TCPedal = {
  init(actions) {
    const $ = id => document.getElementById(id);
    const defaults = () => ({enabled:false,keys:['ArrowLeft','ArrowRight'],actions:['prev','next']});
    const labels = {prev:'Música anterior',next:'Próxima música',toggle:'Play / Pause',play:'Play (continuar)',pause:'Pause',none:'Nenhuma ação'};
    let config = defaults(), learning = null, busy = false;
    const held = new Set();
    try {
      const stored = JSON.parse(localStorage.getItem('tcb_pedal_v1'));
      if(stored && Array.isArray(stored.keys) && stored.keys.length===2 && stored.keys.every(k=>typeof k==='string'&&k.length>0) && stored.keys[0]!==stored.keys[1] && Array.isArray(stored.actions) && stored.actions.length===2 && stored.actions.every(a=>Object.hasOwn(labels,a))) config={enabled:stored.enabled===true,keys:stored.keys,actions:stored.actions};
    } catch {}
    const feedback = message => {$('pedalFeedback').textContent=message;};
    function save() {
      try {localStorage.setItem('tcb_pedal_v1',JSON.stringify(config));feedback('Configuração salva neste aparelho.');}
      catch {feedback('Não foi possível salvar. A configuração vale apenas nesta sessão.');}
    }
    const keyName = key => key===' '?'Espaço':key;
    function render() {
      $('pedalEnabled').checked=config.enabled;
      $('pedalRows').replaceChildren();
      config.keys.forEach((key,i)=>{
        const box=document.createElement('div');
        const title=document.createElement('p');title.textContent=i===0?'PEDAL ESQUERDO':'PEDAL DIREITO';box.append(title);
        const label=document.createElement('label');label.textContent='Ação ';const select=document.createElement('select');select.className='setlist-select';select.setAttribute('aria-label',`Ação do pedal ${i===0?'esquerdo':'direito'}`);
        Object.entries(labels).forEach(([value,text])=>{const option=document.createElement('option');option.value=value;option.textContent=text;select.append(option);});select.value=config.actions[i];
        select.onchange=()=>{config.actions[i]=select.value;$('pedalPreset').value='custom';save();};label.append(select);box.append(label);
        const learn=document.createElement('button');learn.type='button';learn.className='btn btn-ghost';learn.style.marginTop='10px';learn.textContent=`Aprender • ${keyName(key)}`;
        learn.onclick=()=>{learning=i;held.clear();$('pedalCancel').hidden=false;feedback(`Pressione o pedal ${i===0?'esquerdo':'direito'} agora. Escape cancela.`);learn.blur();};box.append(learn);$('pedalRows').append(box);
      });
    }
    function cancel(){learning=null;$('pedalCancel').hidden=true;}
    $('pedalCancel').onclick=()=>{cancel();feedback('Aprendizado cancelado.');};
    $('pedalEnabled').onchange=e=>{config.enabled=e.target.checked;cancel();save();};
    $('pedalPreset').onchange=e=>{const presets={tracks:['prev','next'],mixed:['toggle','next'],transport:['play','pause']};if(presets[e.target.value]){config.actions=[...presets[e.target.value]];cancel();save();render();}};
    window.addEventListener('blur',()=>{held.clear();cancel();});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){held.clear();cancel();}});
    document.addEventListener('keyup',e=>held.delete(e.key),true);
    document.addEventListener('keydown',e=>{
      if(e.isComposing||e.ctrlKey||e.altKey||e.metaKey||['Shift','Control','Alt','Meta'].includes(e.key))return;
      if(learning!==null){
        e.preventDefault();e.stopImmediatePropagation();
        if(e.key==='Escape'){cancel();feedback('Aprendizado cancelado.');return;}
        if(e.repeat)return;
        if(config.keys[1-learning]===e.key){feedback('Essa tecla já está no outro pedal. Escolha outro comando no pedal e tente novamente.');return;}
        config.keys[learning]=e.key;held.add(e.key);cancel();save();render();feedback(`Comando reconhecido: ${keyName(e.key)}. Configuração salva.`);return;
      }
      if(!config.enabled||document.hidden)return;
      const target=e.target;
      if(target?.closest?.('input,textarea,select,button,summary,a,[contenteditable]:not([contenteditable="false"]),[role="textbox"]'))return;
      const index=config.keys.indexOf(e.key);if(index<0||config.actions[index]==='none')return;
      e.preventDefault();e.stopImmediatePropagation();
      if(e.repeat||held.has(e.key))return;
      held.add(e.key);if(busy)return;
      busy=true;feedback(`${index===0?'Esquerdo':'Direito'}: ${labels[config.actions[index]]}`);
      try {Promise.resolve(actions[config.actions[index]]()).catch(()=>feedback('Não foi possível executar a ação. Tente novamente.')).finally(()=>{busy=false;});}
      catch {busy=false;feedback('Não foi possível executar a ação.');}
    },true);
    render();
  }
};
