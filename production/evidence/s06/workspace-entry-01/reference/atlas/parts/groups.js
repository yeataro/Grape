/* Group Frame atlas demo only. No Graph, TD, storage, clipboard or network. */
(() => {
  'use strict';
  const init = () => {
    const root = document.getElementById('groups');
    if (!root || root.dataset.gfInitialized) return;
    root.dataset.gfInitialized = 'true';
    const $ = selector => root.querySelector(selector), svg = $('[data-gf-scene]');
    const NS = 'http://www.w3.org/2000/svg';
    const make = (tag, attrs, text) => {
      const node = document.createElementNS(NS, tag);
      for (const [key, value] of Object.entries(attrs || {})) node.setAttribute(key, value);
      if (text !== undefined) node.textContent = text;
      return node;
    };
    const colors = [['Slate','#7f8797'],['Gray','#9a9390'],['Red','#aa7a79'],['Orange','#bb8c69'],['Sand','#b6a270'],['Olive','#94a574'],['Green','#75a28a'],['Teal','#72a6a5'],['Blue','#759bb5'],['Navy','#485f8d'],['Violet','#9285ad'],['Rose','#ad83a2']];
    const basis = () => ({frame:true,name:'Lighting controls',color:'#7f8797',members:['a','b'],nodes:{a:{x:96,y:160,collapsed:false},b:{x:508,y:160,collapsed:false},c:{x:288,y:242,collapsed:false}}});
    const specs = {a:{name:'Float A',width:158,height:112,role:'#384d73',value:'0.75'},b:{name:'Multiply',width:212,height:164,role:'#43345c'},c:{name:'Float C',width:150,height:90,role:'#384d73',value:'0.15'}};
    let state = basis(), selected = new Set(), history = [], drag = null, naming = false;
    const readonly = () => $('[data-gf-readonly]').checked;
    const height = id => state.nodes[id].collapsed ? 36 : specs[id].height;
    const bounds = () => {
      if (!state.frame || !state.members.length) return null;
      const x = Math.min(...state.members.map(id => state.nodes[id].x)), y = Math.min(...state.members.map(id => state.nodes[id].y));
      return {x:x-24,y:y-52,width:Math.max(...state.members.map(id=>state.nodes[id].x+specs[id].width))-x+48,height:Math.max(...state.members.map(id=>state.nodes[id].y+height(id)))-y+76};
    };
    const message = text => { $('[data-gf-message]').textContent = text; };
    const commit = (change, text) => {
      if (readonly()) return false;
      const before = JSON.stringify(state); change();
      if (JSON.stringify(state) !== before) history.push(before);
      render(); if (text) message(text); return true;
    };
    const ui = new Map();
    for (const [id, spec] of Object.entries(specs)) {
      const node = make('g',{class:'gf-node','data-gf-node':id,tabindex:'0',role:'button','aria-label':spec.name+'; click to select; modifier-click to add'});
      const surface=make('rect',{class:'gf-node-surface',width:spec.width,rx:9});
      const head=make('path',{fill:spec.role});
      const title=make('text',{class:'gf-node-title',x:13,y:24},spec.name);
      const body=make('g',{}), input=make('circle',{class:'gf-port gf-port-connected',cx:0,r:5}),output=make('circle',{class:'gf-port'+(id==='a'?' gf-port-connected':''),cx:spec.width,r:5});
      if(id==='b') {
        body.append(make('text',{class:'gf-node-label',x:17,y:69},'a'),make('text',{class:'gf-node-type',x:38,y:69},'float'));
        body.append(make('circle',{class:'gf-port',cx:0,cy:104,r:5}),make('text',{class:'gf-node-label',x:17,y:108},'b'),make('text',{class:'gf-node-type',x:38,y:108},'float'));
        body.append(make('rect',{class:'gf-node-field',x:78,y:91,width:118,height:26,rx:4}),make('text',{class:'gf-node-value',x:87,y:109},'2'));
        body.append(make('text',{class:'gf-node-label',x:130,y:144},'out'),make('text',{class:'gf-node-type',x:157,y:144},'float'));
      } else {
        body.append(make('text',{class:'gf-node-label',x:spec.width-80,y:57},'out'),make('text',{class:'gf-node-type',x:spec.width-51,y:57},'float'));
        body.append(make('rect',{class:'gf-node-field',x:13,y:67,width:spec.width-26,height:25,rx:4}),make('text',{class:'gf-node-value',x:22,y:84},spec.value));
        if(id==='c')body.lastChild.previousSibling.setAttribute('height','18');
      }
      node.append(surface,head,title,body); if(id==='b')node.append(input);node.append(output);
      node.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey){selected.has(id)?selected.delete(id):selected.add(id);}else selected=new Set([id]);render();message('選取只改本頁的選取狀態；不改成員關係。');});
      node.addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key)){event.preventDefault();node.dispatchEvent(new MouseEvent('click',{ctrlKey:event.ctrlKey,metaKey:event.metaKey,shiftKey:event.shiftKey}));}});
      $('[data-gf-nodes]').append(node); ui.set(id,{node,surface,head,title,body,input,output});
    }
    function render() {
      const b=bounds(), frame=$('[data-gf-frame]');frame.style.display=b?'':'none';
      svg.style.setProperty('--gf-frame',state.color);
      if(b){
        frame.setAttribute('transform',`translate(${b.x} ${b.y})`);
        $('[data-gf-frame-body]').setAttribute('width',b.width);$('[data-gf-frame-body]').setAttribute('height',b.height);
        $('[data-gf-head-bg]').setAttribute('d',`M10 0H${b.width-10}Q${b.width} 0 ${b.width} 10V28H0V10Q0 0 10 0Z`);
        const title=$('[data-gf-name]');title.textContent=state.name.length>Math.floor((b.width-104)/7)?state.name.slice(0,Math.max(1,Math.floor((b.width-116)/7)))+'…':state.name;title.style.display=naming?'none':'';
        $('[data-gf-name-foreign]').setAttribute('width',Math.max(40,b.width-100));$('[data-gf-name-foreign]').toggleAttribute('hidden',!naming);
        [['color',64],['rename',41],['remove',18]].forEach(([key,offset])=>{$('[data-gf-'+key+']').setAttribute('transform',`translate(${b.width-offset} 14)`);$('[data-gf-'+key+']').setAttribute('aria-disabled',String(readonly()));});
        $('[data-gf-corner]').setAttribute('transform',`translate(${b.width-4} ${b.height-4})`);$('[data-gf-corner]').style.display=$('[data-gf-corner-setting]').checked?'':'none';
        frame.classList.toggle('gf-frame-selected',state.members.every(id=>selected.has(id)));
      }
      for(const [id,part]of ui){
        const spec=specs[id],n=state.nodes[id],h=height(id);part.node.setAttribute('transform',`translate(${n.x} ${n.y})`);part.node.setAttribute('aria-pressed',String(selected.has(id)));part.node.dataset.member=String(state.frame&&state.members.includes(id));
        part.surface.setAttribute('height',h);part.head.setAttribute('d',`M9 0H${spec.width-9}Q${spec.width} 0 ${spec.width} 9V36H0V9Q0 0 9 0Z`);
        part.body.style.display=n.collapsed?'none':'';part.input.setAttribute('cy',n.collapsed?18:65);part.output.setAttribute('cy',n.collapsed?18:id==='b'?140:53);
      }
      const a=state.nodes.a,bn=state.nodes.b,ay=a.y+(a.collapsed?18:53),by=bn.y+(bn.collapsed?18:65),ax=a.x+specs.a.width,bx=bn.x;
      $('[data-gf-wire]').setAttribute('d',`M${ax} ${ay}C${ax+80} ${ay} ${bx-80} ${by} ${bx} ${by}`);
      const destination=state.frame&&state.members.some(id=>selected.has(id)),incoming=[...selected].some(id=>!state.members.includes(id));
      $('[data-gf-join]').disabled=readonly()||!destination||!incoming;
      $('[data-gf-detach]').disabled=readonly()||!destination;
      $('[data-gf-create]').disabled=readonly()||state.frame||selected.size<2;
      $('[data-gf-select-frame]').disabled=$('[data-gf-include-c]').disabled=!state.frame;
      $('[data-gf-move]').disabled=$('[data-gf-collapse]').disabled=readonly()||!state.frame;
      $('[data-gf-move-a]').disabled=readonly();$('[data-gf-undo]').disabled=readonly()||!history.length;
      $('[data-gf-collapse]').textContent=state.members.length&&state.members.every(id=>state.nodes[id].collapsed)?'Expand member nodes':'Collapse member nodes';
      $('[data-gf-state]').textContent=`Frame members: ${state.frame?state.members.map(id=>specs[id].name).join(' + '):'none'} · Selected: ${[...selected].map(id=>specs[id].name).join(' + ')||'none'} · Demo edits: ${history.length}`;
      for(const button of root.querySelectorAll('[data-gf-swatch]'))button.setAttribute('aria-pressed',String(button.dataset.gfSwatch===state.color));
    }
    const selectFrame=event=>{
      if(!state.frame)return;
      const toggle=event&&(event.shiftKey||event.ctrlKey||event.metaKey),remove=toggle&&state.members.every(id=>selected.has(id));
      if(!toggle)selected.clear();for(const id of state.members){remove?selected.delete(id):selected.add(id);}render();
    };
    const limitedMove=(ids,dx,dy)=>{
      // Presentation fence keeps the offline example in its finite artboard.
      // It is not a Legacy Canvas restriction or snapping implementation.
      const left=Math.min(...ids.map(id=>state.nodes[id].x)),right=Math.max(...ids.map(id=>state.nodes[id].x+specs[id].width)),top=Math.min(...ids.map(id=>state.nodes[id].y)),bottom=Math.max(...ids.map(id=>state.nodes[id].y+height(id)));
      dx=Math.max(40-left,Math.min(dx,800-right));dy=Math.max(70-top,Math.min(dy,375-bottom));
      for(const id of ids){state.nodes[id].x+=dx;state.nodes[id].y+=dy;}
    };
    $('[data-gf-select-frame]').onclick=()=>{selectFrame();message('全部成員已選取。位於框內的非成員不會因此被選入。');};
    $('[data-gf-include-c]').onclick=()=>{selected=new Set([...state.members,'c']);render();message('已選取目的框的成員與 Float C；Join selected 現在可用。');};
    $('[data-gf-join]').onclick=()=>commit(()=>{state.members=[...new Set([...state.members,...selected])];},'加入明確成員；沒有移動節點，也沒有改線。');
    $('[data-gf-detach]').onclick=()=>commit(()=>{state.members=state.members.filter(id=>!selected.has(id));if(!state.members.length)state.frame=false;},'只移出選中成員；節點、位置與連線保留。空框會消失。');
    $('[data-gf-create]').onclick=()=>{commit(()=>{state.frame=true;state.members=[...selected];state.name='Group 1';state.color='#7f8797';},'建立視覺 Frame，接著可命名。');beginRename();};
    $('[data-gf-move]').onclick=()=>commit(()=>limitedMove(state.members,32,18),'只有明確成員一起移動；其他節點留在原地。');
    $('[data-gf-move-a]').onclick=()=>commit(()=>limitedMove(['a'],0,-24),'個別移動 Float A；若仍是成員，框範圍跟著重算。');
    $('[data-gf-collapse]').onclick=()=>commit(()=>{const collapse=!state.members.every(id=>state.nodes[id].collapsed);state.members.forEach(id=>state.nodes[id].collapsed=collapse);},'收合／展開的是成員節點；Frame 保持同一份成員關係，範圍依可見卡片更新。');
    $('[data-gf-undo]').onclick=()=>{if(!readonly()&&history.length){state=JSON.parse(history.pop());render();message('還原上一次本頁示範編輯。這不是產品 History 或 Host Undo。');}};
    const closePalette=()=>{$('[data-gf-palette]').hidden=true;};
    $('[data-gf-reset]').onclick=()=>{cancelDrag();naming=false;state=basis();selected.clear();history=[];$('[data-gf-readonly]').checked=false;$('[data-gf-corner-setting]').checked=true;closePalette();render();message('Float C 位於框內，但不在成員名單。可從原始狀態重新試操作。');};
    $('[data-gf-readonly]').onchange=()=>{cancelDrag();naming=false;closePalette();render();message(readonly()?'唯讀範例：仍可選取與查看；更名、改色、移動和 membership 編輯停止。':'恢復本頁可編輯狀態。');};
    $('[data-gf-corner-setting]').onchange=()=>{render();message('只改角落選取入口的顯示；標題列仍可選取全部成員。');};
    const keyAction=(node,action)=>{node.addEventListener('click',action);node.addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key)){event.preventDefault();action(event);}});};
    keyAction($('[data-gf-corner]'),selectFrame);
    keyAction($('[data-gf-remove]'),()=>{closePalette();commit(()=>{state.frame=false;state.members=[];},'只移除 Frame。三個節點與既有連線全部保留。');});
    function beginRename(){if(readonly()||!state.frame)return;naming=true;render();const entry=$('[data-gf-name-input]');entry.value=state.name;entry.focus();entry.select();}
    keyAction($('[data-gf-rename]'),beginRename);
    function endRename(cancel){if(!naming)return;naming=false;const next=$('[data-gf-name-input]').value.trim();if(!cancel&&next&&next.length<=80&&!/[\x00-\x1f\x7f]/.test(next))commit(()=>state.name=next,'Frame 名稱已提交。');else{render();message(cancel?'取消更名；原名稱保留。':'名稱無效；本頁保留原名稱。');}}
    $('[data-gf-name-input]').addEventListener('blur',()=>endRename(false));
    $('[data-gf-name-input]').addEventListener('pointerdown',event=>event.stopPropagation());
    $('[data-gf-name-input]').addEventListener('keydown',event=>{event.stopPropagation();if(event.key==='Escape'){event.preventDefault();endRename(true);$('[data-gf-heading]').focus();}else if(event.key==='Enter'&&!event.isComposing){event.preventDefault();endRename(false);$('[data-gf-heading]').focus();}});
    keyAction($('[data-gf-color]'),()=>{if(readonly())return;$('[data-gf-palette]').hidden=!$('[data-gf-palette]').hidden;});
    colors.forEach(([name,color])=>{const button=document.createElement('button');button.type='button';button.dataset.gfSwatch=color;button.setAttribute('aria-label',name+' '+color);button.title=name;button.style.setProperty('--swatch',color);button.append(document.createElement('span'));button.onclick=()=>{commit(()=>state.color=color,'只改 Frame 色彩；成員的節點／型別色保持原狀。');closePalette();$('[data-gf-color]').focus();};$('[data-gf-swatches]').append(button);});
    document.addEventListener('pointerdown',event=>{if(!$('[data-gf-palette]').contains(event.target)&&!$('[data-gf-color]').contains(event.target))closePalette();});
    const heading=$('[data-gf-heading]');
    heading.addEventListener('dblclick',beginRename);
    heading.addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key)){event.preventDefault();selectFrame(event);}if(event.key==='F2'){event.preventDefault();beginRename();}});
    const point=event=>{const p=svg.createSVGPoint();p.x=event.clientX;p.y=event.clientY;return p.matrixTransform(svg.getScreenCTM().inverse());};
    heading.addEventListener('pointerdown',event=>{
      if(event.button!==0||naming)return;event.preventDefault();selectFrame(event);
      if(readonly()||event.ctrlKey||event.metaKey||event.shiftKey)return;
      closePalette();drag={id:event.pointerId,start:point(event),before:JSON.stringify(state),moved:false};heading.setPointerCapture(event.pointerId);
    });
    heading.addEventListener('pointermove',event=>{
      if(!drag||drag.id!==event.pointerId)return;const p=point(event),dx=p.x-drag.start.x,dy=p.y-drag.start.y;
      if(!drag.moved&&Math.hypot(dx,dy)<3)return;drag.moved=true;state=JSON.parse(drag.before);limitedMove(state.members,Math.round(dx),Math.round(dy));render();message('拖曳預覽中；放開提交一次本頁編輯，Escape 可取消。');
    });
    const stopDrag=cancel=>{
      if(!drag)return;const session=drag;drag=null;
      if(cancel)state=JSON.parse(session.before);else if(JSON.stringify(state)!==session.before)history.push(session.before);
      if(heading.hasPointerCapture(session.id))heading.releasePointerCapture(session.id);
      render();if(session.moved)message(cancel?'拖曳已取消；所有成員回到起點。':'群組移動完成；本頁 Undo 一次可還原。');
    };
    function cancelDrag(){stopDrag(true);}
    heading.addEventListener('pointerup',()=>stopDrag(false));heading.addEventListener('pointercancel',cancelDrag);heading.addEventListener('lostpointercapture',cancelDrag);
    window.addEventListener('blur',cancelDrag);window.addEventListener('resize',cancelDrag);
    window.addEventListener('keydown',event=>{if(event.key==='Escape'&&(drag||!$('[data-gf-palette]').hidden)){event.preventDefault();cancelDrag();closePalette();}});
    render();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
