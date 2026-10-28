import fs from 'node:fs';
import assert from 'node:assert/strict';
import {parseLevel,initial,solve,move,commit,status,count} from '../tmp/core/rules.js';
const data=JSON.parse(fs.readFileSync('src/levels/rooms.json','utf8'));
const report=[];const seen=new Set();
for(const [i,r] of data.rooms.entries()){
 assert.equal(r.number,i+1);assert.ok(!seen.has(r.id));seen.add(r.id);
 const l=parseLevel(r.rows,{id:r.id,budget:r.challengeBudget});const result=solve(l,initial(l),500000,60);
 assert.equal(result.status,'solved',r.id);assert.equal(result.route.length,r.optimalSteps);assert.ok(r.optimalityProven);assert.ok(r.challengeBudget>=result.route.length);
 for(const mode of ['explore','challenge']){let run=initial(l,mode);for(const d of r.verifiedSolution){const a=move(l,run,d,mode);assert.ok(a.valid);run=commit(run,a);}assert.equal(status(l,run,mode),'won',r.id);}
 report.push({number:r.number,id:r.id,name:r.name,theme:r.theme,targets:count(l.target),optimalSteps:result.route.length,budget:r.challengeBudget,visited:result.visited,route:result.route,proven:true});
}
assert.equal(report.length,20);
function variants(rows){let a=rows.map(x=>[...x]),out=[];for(let i=0;i<4;i++){out.push(a.map(x=>x.join('')).join('\n'),a.map(x=>[...x].reverse().join('')).join('\n'));a=a[0].map((_,x)=>a.map(r=>r[x]).reverse());}return out;}
for(let i=0;i<20;i++)for(let j=0;j<i;j++)assert.ok(!variants(data.rooms[j].rows).includes(data.rooms[i].rows.join('\n')),`duplicate ${i+1}/${j+1}`);
fs.mkdirSync('docs/qa/phase710',{recursive:true});fs.writeFileSync('docs/qa/phase710/level-validation.json',JSON.stringify({levels:report,distinctUnderRotationReflection:true,method:'BFS; shared rules; both modes replayed'},null,2));
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
fs.writeFileSync('docs/关卡预览与验证.html',`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>猫爪印记 · 20关预览</title><style>body{background:#f6ecd9;color:#674d39;font:16px system-ui;margin:32px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}article{padding:20px;background:#fffaf1;border-radius:20px}.grid{display:grid;gap:3px;width:245px}.grid span{aspect-ratio:1;display:grid;place-items:center;background:#e6c69d;border-radius:5px}.grid .wall{background:#aa8f71}.grid .mat{background:#b2c79b}small{line-height:1.8}pre{white-space:pre-wrap}</style><h1>20间暖屋 · 地图预览与验证</h1><p>S 起点 · 垫 进入即停 · 窝 终点 · 深色为阻挡。全部最短解由同一规则 BFS 验证。</p><main>${data.rooms.map((r,i)=>`<article><h2>${r.number}. ${esc(r.name)}</h2><div class="grid" style="grid-template-columns:repeat(${r.rows[0].length},1fr)">${r.rows.join('').split('').map(c=>`<span class="${c==='#'?'wall':c==='M'?'mat':''}">${c==='S'?'猫':c==='M'?'垫':c==='N'?'窝':''}</span>`).join('')}</div><p>${esc(r.intent)}</p><small>最短 ${r.optimalSteps} 步 · 挑战 ${r.challengeBudget} 步 · ${report[i].targets} 目标格</small><details><summary>验证路线</summary><pre>${r.verifiedSolution.map(d=>({up:'↑',down:'↓',left:'←',right:'→'}[d])).join(' ')}</pre></details></article>`).join('')}</main>`);
console.log(JSON.stringify({levels:report.length,allSolved:true,allOptimal:true,distinct:true}));
