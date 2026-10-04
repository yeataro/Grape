import { createServer } from '../production/node_modules/vite/dist/node/index.js';
const server=await createServer({root:new URL('../production/',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1'),server:{host:'127.0.0.1',port:4206,strictPort:true,watch:{ignored:['**/evidence/**']}},clearScreen:false});
await server.listen();server.printUrls();
process.on('SIGINT',async()=>{await server.close();process.exit(0)});
