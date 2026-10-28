export type Direction = 'up' | 'down' | 'left' | 'right';
export type Mode = 'explore' | 'challenge';
export type Tile = '#' | '.' | 'M' | 'N';
export interface Level { id:string; revision:number; name:string; width:number; height:number; tiles:Tile[]; start:number; nest:number; target:bigint; budget:number }
export interface Snapshot { position:number; covered:bigint; moves:number; direction:Direction }
export interface Run extends Snapshot { history:Snapshot[]; mode:Mode; hintUsed:boolean }
export interface Move { valid:boolean; before:Snapshot; after:Snapshot; path:number[]; fresh:number[]; status:'playing'|'won'|'exhausted' }
export const DIRECTIONS:Direction[]=['up','down','left','right'];
export const DELTAS:Record<Direction,[number,number]>={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
export const bit=(p:number)=>1n<<BigInt(p);
export const count=(mask:bigint)=>{let n=0;while(mask){mask&=mask-1n;n++;}return n;};
export function parseLevel(rows:string[],opts:{id?:string;name?:string;budget?:number}={}):Level{
 const width=rows[0]?.length??0; if(!width||rows.some(r=>r.length!==width))throw Error('Invalid rectangle');
 const chars=rows.join('').split('');if(chars.some(c=>!'#.SMN'.includes(c)))throw Error('Unknown tile');
 if(chars.filter(c=>c==='S').length!==1||chars.filter(c=>c==='N').length!==1)throw Error('Exactly one start and nest required');
 const start=chars.indexOf('S'),nest=chars.indexOf('N');let target=0n;
 const tiles=chars.map((c,i)=>{if(c!=='#')target|=bit(i);return c==='S'?'.':c;}) as Tile[];
 return {id:opts.id??'sample',revision:1,name:opts.name??'午后的小房间',width,height:rows.length,tiles,start,nest,target,budget:opts.budget??24};
}
export const initial=(level:Level,mode:Mode='explore'):Run=>({position:level.start,covered:bit(level.start),moves:0,direction:'right',history:[],mode,hintUsed:false});
export const snapshot=(s:Snapshot):Snapshot=>({position:s.position,covered:s.covered,moves:s.moves,direction:s.direction});
export const status=(level:Level,s:Snapshot,mode:Mode)=>s.position===level.nest&&s.covered===level.target?'won':mode==='challenge'&&s.moves>=level.budget?'exhausted':'playing';
export function move(level:Level,s:Snapshot,direction:Direction,mode:Mode='explore'):Move{
 const before=snapshot(s),path:number[]=[],fresh:number[]=[];
 if(status(level,s,mode)!=='playing')return{valid:false,before,after:before,path,fresh,status:status(level,s,mode)};
 const[dx,dy]=DELTAS[direction];let p=s.position,mask=s.covered;
 while(true){const x=p%level.width+dx,y=Math.floor(p/level.width)+dy;
  if(x<0||x>=level.width||y<0||y>=level.height)break;
  const next=y*level.width+x;if(level.tiles[next]==='#')break;
  p=next;path.push(p);if(!(mask&bit(p)))fresh.push(p);mask|=bit(p);
  if(level.tiles[p]==='M')break;
 }
 const after=path.length?{position:p,covered:mask,moves:s.moves+1,direction}:before;
 return{valid:path.length>0,before,after,path,fresh,status:status(level,after,mode)};
}
export function commit(run:Run,action:Move):Run{return action.valid?{...run,...action.after,history:[...run.history,action.before]}:run;}
export function undo(run:Run):Run{const prior=run.history.at(-1);return prior?{...run,...prior,history:run.history.slice(0,-1)}:run;}
export function solve(level:Level,start:Snapshot,limit=100000,maxDepth=100):{status:'solved'|'unsolvable'|'timeout'|'depth_limit';route:Direction[];visited:number}{
 const nodes:{s:Snapshot;parent:number;direction?:Direction;depth:number}[]=[{s:start,parent:-1,depth:0}];
 const seen=new Set([`${start.position}:${start.covered}`]);let depthLimited=false;
 for(let i=0;i<nodes.length;i++){
  const node=nodes[i];if(status(level,node.s,'explore')==='won'){const route:Direction[]=[];let k=i;while(nodes[k].parent>=0){route.push(nodes[k].direction!);k=nodes[k].parent;}return{status:'solved',route:route.reverse(),visited:nodes.length};}
  if(node.depth>=maxDepth){depthLimited=true;continue;}
  for(const d of DIRECTIONS){const a=move(level,node.s,d);if(!a.valid)continue;const key=`${a.after.position}:${a.after.covered}`;if(seen.has(key))continue;
   if(nodes.length>=limit)return{status:'timeout',route:[],visited:nodes.length};seen.add(key);nodes.push({s:a.after,parent:i,direction:d,depth:node.depth+1});}
 }
 return{status:depthLimited?'depth_limit':'unsolvable',route:[],visited:nodes.length};
}
