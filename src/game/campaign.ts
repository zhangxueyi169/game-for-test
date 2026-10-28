import data from '../levels/rooms.json';
import {parseLevel,type Direction} from '../core/rules.js';
export interface RoomSpec{number:number;id:string;revision:number;name:string;theme:string;rows:string[];intent:string;tutorial:string;challengeBudget:number;optimalSteps:number|null;optimalityProven:boolean;verifiedSolution:string[]}
export const ROOMS=data.rooms as RoomSpec[];
export const makeLevel=(room:RoomSpec)=>({...parseLevel(room.rows,{id:room.id,name:room.name,budget:room.challengeBudget}),revision:room.revision});
export const themeAssets:Record<string,string>={base:'ROOM-BASE',living:'ROOM-LIVING',study:'ROOM-STUDY',bedroom:'ROOM-BED',greenhouse:'ROOM-GREEN',attic:'ROOM-ATTIC'};
export const directionText:Record<Direction,string>={up:'上',down:'下',left:'左',right:'右'};
