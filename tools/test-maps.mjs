import assert from 'node:assert/strict';
import {createWorld,stepWorld,action,interact,transferMap,answerSpar,hitEnemy,blocked} from '../src/world.js';
import {REGIONS,MAP_EXITS,regionAt,insideMap} from '../src/maps.js';
import {MotionEffects} from '../src/motion-effects.js';
const advance=(w,t,input={})=>{for(let i=0;i<Math.ceil(t*60);i++)stepWorld(w,1/60,input)};
const locate=(p,o)=>Object.assign(p,{x:o.x,y:o.y,mapId:o.mapId||regionAt(o).id});
const w=createWorld(),p=w.player;
assert.equal(REGIONS.length,6);assert.equal(new Set(MAP_EXITS.map(e=>e.id)).size,10);
for(const e of MAP_EXITS){assert.ok(insideMap(e));assert.ok(insideMap(e.spawn));assert.equal(blocked(e.spawn.x,e.spawn.y),false);assert.ok(MAP_EXITS.some(back=>back.mapId===e.destinationId&&back.destinationId===e.mapId))}
w.nodes[0].taken=true;w.quest=true;p.herbs=7;p.guard=true;p.flying=true;p.qi=83;
const enemy=w.actors.find(e=>e.kind==='boar');enemy.hp=51;const defeated=w.actors.find(e=>e.kind==='wolf');defeated.dead=true;
for(let i=0;i<20;i++)for(const exit of MAP_EXITS){
 locate(p,exit);const qi=p.qi;w.shots=[{life:3}];w.swords=[{life:3}];w.zones=[{life:3}];w.formations=[{life:3}];
 assert.equal(transferMap(w,exit),true);assert.equal(p.mapId,exit.destinationId);assert.equal(p.qi,qi);assert.equal(w.shots.length+w.swords.length+w.zones.length+w.formations.length,0);
 const x=p.x;assert.equal(transferMap(w,exit),false);advance(w,.6);assert.equal(p.x,x);assert.equal(enemy.hp,51);assert.equal(defeated.dead,true);assert.equal(w.nodes[0].taken,true);assert.equal(w.quest,true);assert.equal(p.herbs,7);assert.equal(p.guard,true);
}
// The edge is a wall, even while flying/dashing; only a real nearby exit transfers.
locate(p,{x:407,y:600,mapId:'camp'});p.qi=100;advance(w,1,{x:1});assert.equal(p.mapId,'camp');assert.ok(p.x<=408);
assert.equal(transferMap(w,MAP_EXITS[6]),false);assert.equal(transferMap(w,{...MAP_EXITS[0]}),false);
// Off-map NPCs freeze. Projectiles cannot cross to another map.
const iso=createWorld();locate(iso.player,{x:408,y:400,mapId:'camp'});const deer=iso.actors[0];Object.assign(deer,{x:433,y:400});const hp=deer.hp;
iso.shots.push({x:408,y:400,a:0,v:350,life:1,friendly:true,damage:99,trail:[]});advance(iso,.5);assert.equal(deer.hp,hp);assert.equal(deer.x,433);assert.equal(iso.shots.length,0);
// No combat on arena entry; explicit dialogue, decline, repeatable nonlethal spar.
const spar=createWorld(),boss=spar.actors.find(e=>e.kind==='warden');locate(spar.player,{x:boss.x-30,y:boss.y,mapId:'arena'});
advance(spar,1);assert.equal(spar.shots.length,0);assert.equal(boss.sparring,undefined);
interact(spar);assert.ok(spar.dialogue);const time=spar.time;advance(spar,1);assert.equal(spar.time,time);action(spar,'cast',boss);assert.equal(spar.shots.length,0);
assert.equal(answerSpar(spar,false),false);assert.equal(boss.hp,480);interact(spar);assert.equal(answerSpar(spar,true),true);
hitEnemy(spar,boss,10000);assert.equal(boss.dead,false);assert.equal(boss.hp,1);assert.equal(boss.sparring,false);assert.equal(spar.player.potions,3);
interact(spar);answerSpar(spar,true);assert.equal(boss.hp,480);hitEnemy(spar,boss,10000);assert.equal(spar.player.potions,3);
interact(spar);answerSpar(spar,true);spar.player.hp=1;spar.player.inv=0;
spar.shots.push({x:spar.player.x,y:spar.player.y,a:0,v:0,life:1,friendly:false,owner:boss.id,trail:[]});stepWorld(spar,1/60);
assert.equal(spar.dead,false);assert.equal(spar.player.hp,1);assert.equal(boss.sparring,false);
// The old dash and flight effects use bounded snapshots, not references to player.
const motion=new MotionEffects();motion.update({...p,dash:.1,flying:true,moving:true,altitude:20},1/60);
assert.equal(motion.ghosts.length,1);assert.equal(motion.sparks.length,1);assert.equal(motion.ghosts[0].life,.23);
let depth=0,draws=0;const canvas={save(){depth++},restore(){depth--},fillRect(...values){assert.ok(values.every(Number.isFinite));draws++}};
motion.draw(canvas,(_c,g,t,alpha)=>{assert.equal(g.altitude,20);assert.ok(alpha>0&&alpha<1);draws++},1);assert.equal(depth,0);assert.equal(draws,2);
for(let i=0;i<120;i++)motion.update({...p,dash:1,flying:true,moving:true},1/60);assert.ok(motion.ghosts.length<=16&&motion.sparks.length<=32);
for(let i=0;i<60;i++)motion.update({...p,dash:0,flying:false,moving:false},1/60);assert.equal(motion.ghosts.length+motion.sparks.length,0);
console.log('PASS: six maps, ten paired exits, 20 full return cycles, persistent facts, boundary/attack isolation, dialogue, nonlethal spar/reward idempotence and old motion effects');
