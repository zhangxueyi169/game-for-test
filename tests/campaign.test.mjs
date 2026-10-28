import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {parseLevel,initial,solve,move,commit,status} from '../tmp/core/rules.js';
const rooms=JSON.parse(fs.readFileSync('src/levels/rooms.json','utf8')).rooms;
test('20 authored rooms solve optimally and within both mode budgets',()=>{assert.equal(rooms.length,20);for(const r of rooms){const l=parseLevel(r.rows,{budget:r.challengeBudget});const proof=solve(l,initial(l));assert.equal(proof.status,'solved',r.id);assert.equal(proof.route.length,r.optimalSteps);for(const mode of ['explore','challenge']){let run=initial(l,mode);for(const d of r.verifiedSolution)run=commit(run,move(l,run,d,mode));assert.equal(status(l,run,mode),'won',r.id);}}});
test('depth bound is not reported as globally unsolvable',()=>{const l=parseLevel(rooms[14].rows);assert.equal(solve(l,initial(l),100000,1).status,'depth_limit');});
