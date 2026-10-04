import fs from 'node:fs';
import {application} from './production/tests/fixtures/setup.ts';
import {canvasCommands} from './production/src/features/canvas.ts';
const s=application();let call;
s.graph.change('Prepare exact vec2 destination',d=>{call=d.createSubgraph(s.network);});
const resource=s.graph.capture().document.graph.resources.find(r=>r.data.network);
s.graph.change('Shape destination',d=>d.interface(resource.data.network.id,[{key:'value',name:'Value',direction:'input',type:'glsl.vec2',defaultValue:[0,0]},{key:'result',name:'Result',direction:'output',type:'glsl.vec2',defaultValue:[0,0]}]));
s.app.openText(JSON.stringify(s.graph.capture().document));const context=s.app.context();s.app.grant('s06',canvasCommands);const c=context.capture(),wire={nodeId:call,portKey:'value',direction:'input'};
const item=s.app.creationCatalog(context,wire).find(e=>e.ref.typeId==='compose');
const before=s.app.snapshot;
s.app.execute({panelId:'s06',typeId:'s06'},{object:null,scope:c.scope},{commandId:'grape.node.add',args:{ref:item.ref,parameters:item.parameters,position:[100,100],scope:c.scope,revision:before.revision,wire,matchingPort:item.matchingPort}});
const after=s.app.snapshot,created=context.network().nodes.find(n=>n.type.typeId==='compose');
const good=created.state.mode==='vec2'&&created.ports.find(p=>p.direction==='output').type==='glsl.vec2';if(!good)throw Error('PROPOSAL_FAILED');
const edge=context.network().edges.find(e=>e.from.nodeId===created.id);if(!edge || edge.adaptation.operation!=='identity')throw Error('ADAPTATION');
s.app.execute({panelId:'s06',typeId:'s06'},{object:null,scope:context.scope},{commandId:'grape.undo'});if(JSON.stringify(s.app.snapshot.document)!==JSON.stringify(before.document))throw Error('UNDO');
const positive={status:'DISPOSABLE_PROPOSAL_ONLY',good,preview:item.parameters,actual:created.state,ports:created.ports,edge,oneUndo:true};
const {nodeRef}=await import('./production/src/modules/nodes.ts');const negatives=[];
for(const parameters of [{mode:'bogus'},{unknown:'vec2'},{x:1}]){
 const fresh=application(),before=fresh.graph.capture();let events=0,error='';const off=fresh.graph.subscribe(()=>events++);
 try{fresh.graph.change('Rejected configured add',d=>d.add(fresh.network,nodeRef('compose'),[0,0],parameters));}catch(e){error=e.name;}off();
 if(!error||events||JSON.stringify(fresh.graph.capture())!==JSON.stringify(before))throw Error('ATOMICITY');negatives.push({parameters,error,events,unchanged:true});
}
fs.writeFileSync('production/evidence/s06/workspace-entry-01/configured-creation-proposal-result-02.json',JSON.stringify({positive,negatives,productionModelUnmodified:true,productClaim:false},null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({positive,negatives}));