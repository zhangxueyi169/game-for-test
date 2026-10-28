import './style.css';
import manifest from '../assets/metadata/production_manifest.json';
export function startLab() {

type Asset = { id:string; name:string; file:string; width:number; height:number; bounds:number[]; qa_status:string };
const items = manifest.assets as Asset[];
const files = import.meta.glob('../assets/production/**/*.png', { eager:true, query:'?url', import:'default' }) as Record<string,string>;
const images = new Map<string, HTMLImageElement>();
const failures = new Set<string>();
const state = { direction:'down', background:'warm', grid:true, anchors:false, pressed:false, nest:true, size:48, page:'lab', selected:'CAT-IDLE-DOWN' };
const catId = () => `CAT-IDLE-${state.direction.toUpperCase()}`;
const urlFor = (a:Asset) => files[`../assets/${a.file}`];
const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=`
<header class="topbar"><a class="brand" href="#lab"><span class="brand-mark">✿</span><span>猫爪印记<small>CAT PAW TRAILS</small></span></a><span class="build-tag">ART BUILD · 01</span></header>
<main>
 <section class="intro"><div><p class="eyebrow">A LITTLE WARMTH, ONE PAW AT A TIME</p><h1>让小猫，住进画面里。</h1><p class="lead">奶油橘白、柔软织物与暖木色。<br>在真实的格子尺寸里，检查每一个小细节。</p></div><div class="edition"><span>制作阶段</span><strong>01 — 03</strong><small>视觉基准 / 工程 / 静态资产</small></div></section>
 <nav class="tabs" aria-label="页面预览"><button data-page="lab" class="active">资产试验台</button><button data-page="home">游戏首页</button><button data-page="game">试玩样板房</button><button data-page="result">进入游戏</button></nav>
 <section class="workspace">
  <div class="preview-panel"><div class="panel-heading"><div><span class="dot"></span><strong id="preview-title">房间里的第一位住客</strong></div><span id="stage-label">静态布局预览</span></div>
   <div class="stage-wrap" id="stage-wrap"><canvas id="stage" width="780" height="900" aria-label="七列正交棋盘资产预览，展示猫、软垫、猫窝与覆盖爪印"></canvas>
    <div id="home-overlay" class="scene-overlay" hidden><p class="eyebrow">一间小屋，一点温暖</p><h2>猫爪印记</h2><p>每一步，都留下可爱的痕迹。</p><div class="home-buttons"><button data-mode="explore">休闲探索<span>慢慢逛，把房间印满爪印</span></button><button data-mode="challenge">限步挑战<span>算好每一步，再回到猫窝</span></button></div></div>
    <div id="result-overlay" class="scene-overlay result" hidden><span class="seal">✿</span><h2>房间印满啦</h2><p>小猫可以安心休息了。</p><button id="back-lab">回到试验台</button><small>结果页样式预览，无真实关卡成绩</small></div>
   </div><div class="stage-footer"><span id="load-state" role="status">正在加载资产…</span><button id="download" class="text-button">保存棋盘预览 ↗</button></div>
  </div>
  <aside class="controls"><p class="eyebrow">THE LITTLE DETAILS</p><h2>把细节看清楚</h2><p class="muted">检查朝向、占地和透明边缘。这里的切换只影响展示，不代表关卡玩法。</p>
   <fieldset><legend>小猫朝向</legend><div class="segmented" id="directions"><button data-direction="up" aria-label="朝上">↑</button><button data-direction="left" aria-label="朝左">←</button><button data-direction="down" class="active" aria-label="朝下">↓</button><button data-direction="right" aria-label="朝右">→</button></div></fieldset>
   <fieldset><legend>检查背景</legend><div class="swatches"><button data-background="warm" class="active" aria-label="暖木背景"><i style="background:#e8c99e"></i>暖木</button><button data-background="dark" aria-label="深色背景"><i style="background:#34423d"></i>深色</button><button data-background="checker" aria-label="透明检查棋盘背景"><i class="checker-swatch"></i>透明检查</button></div></fieldset>
   <div class="switches"><label><span>显示网格</span><input id="grid" type="checkbox" checked></label><label><span>显示占地中心</span><input id="anchors" type="checkbox"></label><label><span>软垫受压状态</span><input id="pressed" type="checkbox"></label><label><span>猫窝前沿遮挡</span><input id="nest" type="checkbox" checked></label></div>
   <div class="tiny-note"><strong>一个共同的坐标系</strong><p>垂直俯视 · 格子中心对齐<br>独立接触阴影 · 无背景残留</p></div>
  </aside>
 </section>
 <section class="size-panel"><div><p class="eyebrow">SMALL, BUT CLEAR</p><h2>缩小以后，也要认得出。</h2><p class="muted">同一只猫，以 32 / 48 / 64 CSS 像素检查轮廓与朝向。</p></div><div id="size-previews"></div></section>
 <section class="library"><div class="section-heading"><div><p class="eyebrow">FIRST COLLECTION</p><h2>第一批 · 静态资产</h2></div><span>${items.length} 项 / 点击单独检查</span></div><div id="asset-grid" class="asset-grid"></div></section>
 <section class="inspection"><div><p class="eyebrow">ASSET INSPECTOR</p><h2 id="asset-name">单项检查</h2><p id="asset-meta" class="muted"></p><p id="asset-status" class="muted"></p></div><canvas id="inspector" width="512" height="512" aria-label="单项资产透明边缘检查"></canvas></section>
 <p class="scope-note" id="scope-note">样板房已接入真实规则、落垫哈欠和声音。点击「试玩样板房」体验；20关尚在后续制作。</p>
</main><footer>暖一点，慢一点。<span>猫爪印记 · Visual foundation v0.1</span></footer>`;

const stage=document.querySelector<HTMLCanvasElement>('#stage')!;
const ctx=stage.getContext('2d')!;
const inspector=document.querySelector<HTMLCanvasElement>('#inspector')!;
const ic=inspector.getContext('2d')!;

function drawImageAt(c:CanvasRenderingContext2D, id:string,x:number,y:number,w:number,h=w, crop=true) {
 const im=images.get(id), asset=items.find(a=>a.id===id);
 if(!im||!asset) { c.save(); c.fillStyle='#8c7664';c.font='10px sans-serif';c.textAlign='center';c.fillText('未加载',x+w/2,y+h/2);c.restore();return; }
 if(crop) { const [bx,by,bw,bh]=asset.bounds;const ratio=Math.min(w/bw,h/bh);const dw=bw*ratio,dh=bh*ratio;c.drawImage(im,bx,by,bw,bh,x+(w-dw)/2,y+(h-dh)/2,dw,dh); }
 else c.drawImage(im,x,y,w,h);
}
function checker(c:CanvasRenderingContext2D,w:number,h:number,scale=16){for(let y=0;y<h;y+=scale)for(let x=0;x<w;x+=scale){c.fillStyle=((x/scale+y/scale)%2)?'#e0dfd9':'#fbfaf5';c.fillRect(x,y,scale,scale);}}
function drawStage(){
 const w=390,h=450;ctx.setTransform(stage.width/w,0,0,stage.height/h,0,0);ctx.clearRect(0,0,w,h);
 ctx.fillStyle=state.background==='dark'?'#34423d':'#f1e3cc';ctx.fillRect(0,0,w,h);
 if(state.background==='checker')checker(ctx,w,h,15);
 ctx.fillStyle=state.background==='dark'?'#f3e7d0':'#78614c';ctx.font='11px sans-serif';ctx.textAlign='center';ctx.fillText('午后的小房间',w/2,27);
 const cell=46,ox=(w-cell*7)/2,oy=57;
 ctx.save();ctx.shadowColor='#684b2c25';ctx.shadowBlur=18;ctx.fillStyle='#c7a77f';ctx.beginPath();ctx.roundRect(ox-8,oy-8,cell*7+16,cell*7+16,14);ctx.fill();ctx.restore();
 for(let y=0;y<7;y++)for(let x=0;x<7;x++){
  const px=ox+x*cell,py=oy+y*cell;
  if(state.background==='warm')drawImageAt(ctx,'TILE-FLOOR',px,py,cell,cell,false);
  else {ctx.fillStyle=state.background==='dark'?'#44544c':'#f4f0e8';ctx.fillRect(px,py,cell,cell);}
  if(state.grid){ctx.strokeStyle=state.background==='dark'?'#bac4b12e':'#9d795c35';ctx.lineWidth=0.7;ctx.strokeRect(px,py,cell,cell);}
 }
 for(const [x,y] of [[1,1],[2,1],[5,1],[1,4],[1,5],[4,4],[5,4]])drawImageAt(ctx,'TILE-WALL',ox+x*cell+2,oy+y*cell+2,cell-4);
 for(const [x,y] of [[0,2],[1,2],[2,2],[3,2],[3,3],[3,4],[3,5]])drawImageAt(ctx,'FX-PAW',ox+x*cell+15,oy+y*cell+15,16);
 drawImageAt(ctx,state.pressed?'PROP-MAT-PRESS':'PROP-MAT',ox+3*cell+2,oy+3*cell+2,cell-4);
 drawImageAt(ctx,'PROP-MAT',ox+5*cell+2,oy+2*cell+2,cell-4);
 const nx=ox+5*cell,ny=oy+5*cell;
 drawImageAt(ctx,'PROP-NEST-BASE',nx+1,ny+1,cell-2,cell-2,false);
 ctx.save();ctx.fillStyle='#4b352929';ctx.beginPath();ctx.ellipse(ox+3.5*cell,oy+3.55*cell,13,10,0,0,Math.PI*2);ctx.fill();ctx.restore();
 drawImageAt(ctx,catId(),ox+3*cell+4,oy+3*cell+4,cell-8);
 drawImageAt(ctx,'CAT-IDLE-DOWN',nx+10,ny+8,cell-20);
 if(state.nest)drawImageAt(ctx,'PROP-NEST-FRONT',nx+1,ny+1,cell-2,cell-2,false);
 if(state.anchors){ctx.strokeStyle='#c15468';ctx.lineWidth=1;for(const[x,y]of[[3,3],[5,5],[5,2]]){const cx=ox+(x+.5)*cell,cy=oy+(y+.5)*cell;ctx.beginPath();ctx.moveTo(cx-8,cy);ctx.lineTo(cx+8,cy);ctx.moveTo(cx,cy-8);ctx.lineTo(cx,cy+8);ctx.stroke();}}
 ctx.fillStyle=state.background==='dark'?'#e8dfce':'#8c735b';ctx.font='10px sans-serif';ctx.fillText('7 × 7  ·  正交俯视  ·  静态素材组合',w/2,420);
}
function drawSizes(){
 const host=document.querySelector('#size-previews')!;host.innerHTML='';
 for(const size of [32,48,64]){const box=document.createElement('div');box.className='size-item';const c=document.createElement('canvas');c.width=size*2;c.height=size*2;c.style.width=size+'px';c.style.height=size+'px';c.setAttribute('aria-label',`${size}像素小猫`);const g=c.getContext('2d')!;drawImageAt(g,catId(),0,0,size*2);box.append(c);const label=document.createElement('span');label.textContent=size+' px';box.append(label);host.append(box);}
}
function drawInspector(){const a=items.find(a=>a.id===state.selected)!;ic.setTransform(1,0,0,1,0,0);ic.clearRect(0,0,512,512);if(state.background==='checker')checker(ic,512,512,24);else{ic.fillStyle=state.background==='dark'?'#34423d':'#eee2cb';ic.fillRect(0,0,512,512);}drawImageAt(ic,a.id,32,32,448,448,false);if(state.anchors){ic.strokeStyle='#c15468';ic.beginPath();ic.moveTo(240,256);ic.lineTo(272,256);ic.moveTo(256,240);ic.lineTo(256,272);ic.stroke();}document.querySelector('#asset-name')!.textContent=a.name;document.querySelector('#asset-meta')!.textContent=`${a.id} · ${a.width} × ${a.height} 母版`;document.querySelector('#asset-status')!.textContent=`${a.qa_status} · 运行展示按清单边界缩放，原图保留。`;}
function render(){drawStage();drawSizes();drawInspector();}
function page(name:string){if(name!=='lab'){location.hash=name==='home'?'home':'play';location.reload();return;}state.page='lab';document.querySelector<HTMLElement>('#home-overlay')!.hidden=true;document.querySelector<HTMLElement>('#result-overlay')!.hidden=true;}
document.querySelectorAll<HTMLButtonElement>('[data-page]').forEach(b=>b.onclick=()=>page(b.dataset.page!));
document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(b=>b.onclick=()=>{page('game');document.querySelector('#stage-label')!.textContent=(b.dataset.mode==='explore'?'休闲探索':'限步挑战')+' · 容器预览';});
document.querySelector<HTMLButtonElement>('#back-lab')!.onclick=()=>page('lab');
document.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach(b=>b.onclick=()=>{state.direction=b.dataset.direction!;state.selected=catId();document.querySelectorAll('[data-direction]').forEach(v=>v.classList.toggle('active',v===b));render();});
document.querySelectorAll<HTMLButtonElement>('[data-background]').forEach(b=>b.onclick=()=>{state.background=b.dataset.background!;document.querySelectorAll('[data-background]').forEach(v=>v.classList.toggle('active',v===b));render();});
for(const id of ['grid','anchors','pressed','nest'] as const)document.querySelector<HTMLInputElement>('#'+id)!.onchange=e=>{state[id]=(e.target as HTMLInputElement).checked;render();};
document.querySelector<HTMLButtonElement>('#download')!.onclick=()=>{const a=document.createElement('a');a.download='cat-paw-art-preview.png';a.href=stage.toDataURL('image/png');a.click();};
const cards=document.querySelector('#asset-grid')!;
for(const a of items){const b=document.createElement('button');b.className='asset-card';const im=document.createElement('img');im.src=urlFor(a)||'';im.alt=a.name;const title=document.createElement('strong');title.textContent=a.name;const sub=document.createElement('small');sub.textContent=a.id;b.append(im,title,sub);b.onclick=()=>{state.selected=a.id;drawInspector();document.querySelector('.inspection')!.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});};cards.append(b);}
async function load(){await Promise.all(items.map(a=>new Promise<void>(resolve=>{const im=new Image();im.onload=()=>{images.set(a.id,im);resolve();};im.onerror=()=>{failures.add(a.id);resolve();};const url=urlFor(a);if(!url){failures.add(a.id);resolve();}else im.src=url;})));document.querySelector('#load-state')!.textContent=failures.size?`${images.size}/${items.length} 已加载 · ${[...failures].join(', ')} 加载失败`:`${items.length} 项素材已加载 · 可切换方向与背景`;render();document.body.dataset.loaded='true';}
page(['home','game','result'].includes(location.hash.slice(1))?location.hash.slice(1):'lab');
window.addEventListener('hashchange',()=>page(['home','game','result'].includes(location.hash.slice(1))?location.hash.slice(1):'lab'));
void load();
}
