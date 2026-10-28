import manifest from '../../assets/metadata/production_manifest.json';
import extra from '../../assets/metadata/animation_runtime.json';
const files=import.meta.glob('../../assets/production/**/*.png',{eager:true,query:'?url',import:'default'}) as Record<string,string>;
export type Frame={x:number;y:number;w:number;h:number;duration:number};
export class Art{
 images=new Map<string,HTMLImageElement>();failed:string[]=[];
 entries=[...manifest.assets,...extra.assets] as {id:string;file:string;bounds:number[];frames?:Frame[]}[];
 async load(){await Promise.all(this.entries.map(a=>new Promise<void>(resolve=>{const im=new Image();im.onload=()=>{this.images.set(a.id,im);resolve();};im.onerror=()=>{this.failed.push(a.id);resolve();};const url=files['../../assets/'+a.file];if(url)im.src=url;else{this.failed.push(a.id);resolve();}})));}
 url(id:string){const a=this.entries.find(x=>x.id===id);return a?files['../../assets/'+a.file]:'';}
 draw(c:CanvasRenderingContext2D,id:string,x:number,y:number,w:number,h=w,full=false,frame?:number){const im=this.images.get(id),a=this.entries.find(a=>a.id===id);if(!im||!a){c.fillStyle='#bda47f';c.beginPath();c.roundRect(x+w*.15,y+h*.15,w*.7,h*.7,8);c.fill();return;}
 let [sx,sy,sw,sh]=a.bounds;if(full){sx=0;sy=0;sw=im.width;sh=im.height;}if(frame!==undefined&&a.frames){const f=a.frames[Math.max(0,Math.min(frame,a.frames.length-1))];sx=f.x;sy=f.y;sw=f.w;sh=f.h;}
 const r=Math.min(w/sw,h/sh),dw=sw*r,dh=sh*r;c.drawImage(im,sx,sy,sw,sh,x+(w-dw)/2,y+(h-dh)/2,dw,dh);}
}
