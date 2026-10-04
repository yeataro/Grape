const fs=require('fs'),path=require('path'),cp=require('child_process');
const root='C:/Users/user/source/Grape',base=__dirname;
const ts=require(root+'/production/node_modules/typescript');
const targets={
 'src/model/graph.ts':['Graph.capture','Graph.change','Graph.reconcile','Graph.validate','Graph.publish','Graph.commit'],
 'src/application/editor.ts':['EditorContext.capture','EditorContext.network','EditorApplication.resolve','EditorApplication.parameter'],
 'src/ui/widgets.ts':['WidgetSlot.resolve','WidgetRegistry.resolve'],
 'src/ui/mount.ts':['PresentationSession.refresh'],
 'src/ui/workspace.ts':['Workspace.route'],
 'src/sdk/kernel.ts':['detached'],
 'src/definitions/constant-analysis.ts':['analyzeConstants']
};
let mapping=[];
for(const label of ['before','after']){
 const src=path.join(base,label+'-source'),dest=path.join(base,label+'-instrumented-02');
 if(fs.existsSync(dest))throw Error('exists'); fs.cpSync(src,dest,{recursive:true});
 for(const file of [...Object.keys(targets),'src/features/canvas.ts','src/features/inspector.ts']){
 let text=fs.readFileSync(path.join(dest,file),'utf8');
 if(file==='src/application/editor.ts'){
   const a='const unsubscribeContext = context.subscribe(invalidate);',b='const unsubscribeApplication = this.subscribe(invalidate);';
   if(!text.includes(a)||!text.includes(b))throw Error('subscription anchors');
   text=text.replace(a,'const unsubscribeContext = context.subscribe(() => { globalThis.__perfCount?.("field.notification.context"); invalidate(); });').replace(b,'const unsubscribeApplication = this.subscribe(() => { globalThis.__perfCount?.("field.notification.application"); invalidate(); });');
 }
 const ast=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true), edits=[];
 const visit=n=>{
   let name='';
   if(ts.isMethodDeclaration(n)&&ts.isClassDeclaration(n.parent)) name=n.parent.name?.text+'.'+n.name.getText(ast);
   if(ts.isFunctionDeclaration(n)) name=n.name?.text||'';
   if((targets[file]||[]).includes(name)&&n.body){add(n.body,name,n);}
   if(file==='src/application/editor.ts'&&ts.isArrowFunction(n)&&ts.isBlock(n.body)){
     const body=n.body.getText(ast),p=n.parent;
     if(ts.isVariableDeclaration(p)&&p.name.getText(ast)==='capture'&&body.includes('WidgetSnapshot')===false&&body.includes('PARAMETER_VALUE'))add(n.body,'FieldTarget.capture',n);
     if(ts.isVariableDeclaration(p)&&p.name.getText(ast)==='invalidate'&&body.includes('changes.emit'))add(n.body,'FieldTarget.invalidate',n);
     if(ts.isPropertyAssignment(p)&&p.name.getText(ast)==='update'&&body.includes('GESTURE_EXPIRED'))add(n.body,'gesture.update',n);
   }
   if(file==='src/features/canvas.ts'&&ts.isArrowFunction(n)&&ts.isBlock(n.body)){
     const body=n.body.getText(ast);
     if(ts.isPropertyAssignment(n.parent)&&n.parent.name.getText(ast)==='update'&&body.includes('renderedScope'))add(n.body,'Canvas.update',n);
     if(body.includes('const e = event as PointerEvent;')&&body.includes('drag.gesture.update')&&body.length<2200)add(n.body,'Canvas.pointermove',n);
   }
   ts.forEachChild(n,visit);
 };
 function add(body,name,n){const start=body.getStart(ast)+1,end=body.end-1;edits.push({pos:start,text:`const __perfStop = globalThis.__perfEnter?.(${JSON.stringify(name)}); try {`},{pos:end,text:'} finally { __perfStop?.(); }'});mapping.push({label,file,name,line:ast.getLineAndCharacterOfPosition(n.getStart(ast)).line+1});}
 visit(ast);for(const e of edits.sort((a,b)=>b.pos-a.pos))text=text.slice(0,e.pos)+e.text+text.slice(e.pos);
 fs.writeFileSync(path.join(dest,file),text);
 }
 let main=fs.readFileSync(path.join(dest,'apps/web/main.ts'),'utf8');
 const anchor=main.match(/workspace\.open\(\{\r?\n    id: "inspector",/)?.[0];if(!anchor)throw Error('inspector anchor');
 main=main.replace(anchor,'if (new URLSearchParams(location.search).get("fields") !== "absent") '+anchor);
 main+='\nObject.defineProperty(globalThis,"__diagnosticApplication",{get:()=>application});\n';
 fs.writeFileSync(path.join(dest,'apps/web/main.ts'),main);
}
fs.writeFileSync(path.join(base,'instrumentation-map.json'),JSON.stringify(mapping,null,2)+'\n');console.log(mapping);
