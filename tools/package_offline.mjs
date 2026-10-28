import {readFileSync,readdirSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
const dir=resolve('tmp/offline-build/assets');
const names=readdirSync(dir);const entry=names.find(n=>n.startsWith('index-')&&n.endsWith('.js'));
if(!entry)throw Error('Offline JS missing');
let js=readFileSync(resolve(dir,entry),'utf8');
for(const name of names.filter(n=>n.startsWith('hint.worker')&&n.endsWith('.js'))){
 const source=readFileSync(resolve(dir,name),'utf8');
 const expression=`URL.createObjectURL(new Blob([${JSON.stringify(source)}],{type:"text/javascript"}))`;
 // Vite can emit either a quoted relative path or a path inside new URL.
 for(const prefix of ['./','./assets/','/assets/','assets/',''])js=js.split(JSON.stringify(prefix+name)).join(expression);
}
if(/(?:\.\/|\/assets\/)hint\.worker[^"']*\.js/.test(js))throw Error('Unresolved worker URL');
// Worker is an IIFE bundle. Classic Blob workers also work under file:// origins.
js=js.replaceAll('{type:"module"}','{type:"classic"}');
const css=names.filter(n=>n.endsWith('.css')).map(n=>readFileSync(resolve(dir,n),'utf8')).join('\n');
const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#fbf5e9"><title>猫爪印记 · 午后小房间（离线版）</title><style>${css}</style></head><body><div id="app"></div><script type="module">${js.replaceAll('</script','<\\/script')}</script></body></html>`;
mkdirSync('output',{recursive:true});const file=resolve('output/猫爪印记_午后小房间_双击打开.html');writeFileSync(file,html);
console.log(JSON.stringify({file,bytes:Buffer.byteLength(html),assets_embedded:true}));
