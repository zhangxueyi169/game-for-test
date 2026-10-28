import {solve, type Level,type Snapshot} from '../core/rules.js';
self.onmessage=(e:MessageEvent<{id:number;level:Level;state:Snapshot;depth:number}>)=>{const d=e.data;self.postMessage({id:d.id,...solve(d.level,d.state,100000,d.depth)});};
