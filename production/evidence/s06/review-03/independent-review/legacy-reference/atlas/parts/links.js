/* A bounded diagram: peer selection and line visibility only. No Graph commands. */
(() => {
  const byId=id=>document.getElementById(id);
  const menu=byId('lk-menu'), toggle=byId('lk-menu-toggle'), source=byId('lk-source-arrow');
  const nodes=['lk-source','lk-peer-one','lk-peer-two','lk-wire-peer'].map(byId);
  function showMenu(open){menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));source.setAttribute('aria-expanded',String(open));}
  function choose(ids,label){nodes.forEach(node=>node.classList.toggle('lk-selected',ids.includes(node.id)));showMenu(false);byId('lk-status').textContent=label+'。本圖以選取框表意；不執行真正的 Frame、平移、Graph 或 History 操作。';}
  source.addEventListener('click',()=>choose(['lk-peer-one','lk-peer-two'],'來源箭頭 → Normalize、Length。未納入普通 Wire 對端 Multiply'));
  source.addEventListener('contextmenu',e=>{e.preventDefault();showMenu(true);});
  toggle.addEventListener('click',()=>showMenu(menu.hidden));
  byId('lk-choose-one').addEventListener('click',()=>choose(['lk-peer-one'],'選單 → Normalize'));
  byId('lk-choose-two').addEventListener('click',()=>choose(['lk-peer-two'],'選單 → Length'));
  ['lk-peer-one-arrow','lk-peer-two-arrow'].forEach(id=>byId(id).addEventListener('click',()=>choose(['lk-source'],'輸入箭頭 → Coordinates')));
  byId('lk-visibility').addEventListener('click',e=>{const visible=e.currentTarget.getAttribute('aria-pressed')!=='true';e.currentTarget.setAttribute('aria-pressed',String(visible));byId('lk-link-lines').style.display=visible?'':'none';byId('lk-status').textContent=visible?'Link 線重新顯示。箭頭與連接關係始終保留。':'只隱藏 Link 線；Wire、已接實心接孔及箭頭仍保留，箭頭仍可導航。';});
  byId('lk-reset').addEventListener('click',()=>{nodes.forEach(n=>n.classList.remove('lk-selected'));showMenu(false);byId('lk-link-lines').style.display='';byId('lk-visibility').setAttribute('aria-pressed','true');byId('lk-status').textContent='已重設局部圖解。來源箭頭只選 Normalize、Length，不包含普通 Wire。';});
  byId('lk-board').addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){showMenu(false);source.focus();}});
})();
