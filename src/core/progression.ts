import type {Mode} from './rules.js';
export interface RecordEntry{best:number;bestUnaided:number|null;completed:boolean}
export interface ModeProgress{current:number;unlocked:number;records:Record<string,RecordEntry>}
export interface Progress{version:1;explore:ModeProgress;challenge:ModeProgress}
export const emptyProgress=():Progress=>({version:1,explore:{current:0,unlocked:1,records:{}},challenge:{current:0,unlocked:1,records:{}}});
export function normalizeProgress(raw:unknown,count:number):Progress{
 const p=emptyProgress();if(!raw||typeof raw!=='object'||(raw as {version?:number}).version!==1)return p;
 for(const mode of ['explore','challenge'] as Mode[]){const data=(raw as Record<string,unknown>)[mode] as Partial<ModeProgress>|undefined;if(!data||typeof data!=='object')continue;
 p[mode].unlocked=Math.max(1,Math.min(count,Number.isInteger(data.unlocked)?data.unlocked!:1));
 p[mode].current=Math.max(0,Math.min(p[mode].unlocked-1,Number.isInteger(data.current)?data.current!:0));
 if(data.records&&typeof data.records==='object')for(const[id,r]of Object.entries(data.records)){if(r&&typeof r==='object'&&Number.isInteger(r.best)&&r.best>0)p[mode].records[id]={best:r.best,bestUnaided:Number.isInteger(r.bestUnaided)&&r.bestUnaided!>0?r.bestUnaided:null,completed:r.completed===true};}
 }return p;
}
export const canEnter=(p:Progress,mode:Mode,index:number,count:number)=>Number.isInteger(index)&&index>=0&&index<count&&index<p[mode].unlocked;
export function recordWin(p:Progress,mode:Mode,index:number,id:string,moves:number,hinted:boolean,count:number,preview=false):Progress{
 if(preview)return p;if(!canEnter(p,mode,index,count)||moves<1||!Number.isInteger(moves))throw Error('Invalid completion');
 const old=p[mode].records[id];const record:RecordEntry={completed:true,best:Math.min(old?.best??Infinity,moves),bestUnaided:hinted?(old?.bestUnaided??null):Math.min(old?.bestUnaided??Infinity,moves)};
 return{...p,[mode]:{current:Math.min(count-1,index+1),unlocked:Math.min(count,Math.max(p[mode].unlocked,index+2)),records:{...p[mode].records,[id]:record}}};
}
