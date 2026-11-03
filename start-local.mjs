import {createServer} from 'node:http';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';

const root=fileURLToPath(new URL('./dist/',import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json','.glb':'model/gltf-binary','.wasm':'application/wasm','.svg':'image/svg+xml','.pdf':'application/pdf','.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document','.zip':'application/zip','.csv':'text/csv','.txt':'text/plain; charset=utf-8'};
const server=createServer(async(req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1:8000').pathname);
    const path=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(!path.startsWith(resolve(root)+sep)){res.writeHead(403);res.end();return;}
    const info=await stat(path);if(!info.isFile())throw Error('Not a file');
    res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','Content-Length':info.size,'Cache-Control':'no-cache'});
    if(req.method==='HEAD')res.end();else createReadStream(path).on('error',()=>res.destroy()).pipe(res);
  }catch{res.writeHead(404);res.end('File not found. Extract the complete Bone Lab ZIP before starting.');}
});
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?'Port 8000 is in use. Close your earlier Bone Lab server and try again.':error.message);process.exitCode=1;});
server.listen(8000,'127.0.0.1',()=>{
  const url='http://127.0.0.1:8000/';console.log(`Bone Lab is ready at ${url}\nKeep this window open while testing. Press Ctrl+C here to stop.`);
  const command=process.platform==='win32'?'cmd':process.platform==='darwin'?'open':'xdg-open';
  const args=process.platform==='win32'?['/c','start','',url]:[url];
  const child=spawn(command,args,{stdio:'ignore',windowsHide:true});child.on('error',()=>console.log('Open the address above in your browser.'));child.unref();
});
