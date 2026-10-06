import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {BeastSoundPolicy,BeastVoicePool} from '../src/beast-audio.js';
import {BEAST_ART} from '../src/beast-assets.js';
const p=new BeastSoundPolicy(),deer={id:'d',kind:'deer',state:'漫游',x:30,y:0,mapId:'forest'};
const w={player:{x:0,y:0,mapId:'forest'},actors:[deer],time:0};
assert.deepEqual(p.update(w),[]);deer.state='逃离';assert.equal(p.update(w).length,1);
w.time=1;assert.deepEqual(p.update(w),[]);deer.state='漫游';p.update(w);deer.state='逃离';assert.deepEqual(p.update(w),[]);
w.time=9;deer.state='漫游';p.update(w);deer.state='逃离';assert.equal(p.update(w).length,1);
for(const flag of ['dead','paused','dialogue']){p.reset();w[flag]=true;assert.deepEqual(p.update(w),[]);w[flag]=false}
p.reset();deer.dead=true;assert.deepEqual(p.update(w),[]);deer.dead=false;
p.reset();deer.x=181;assert.deepEqual(p.update(w),[]);deer.x=30;
p.reset();w.player.mapId='camp';assert.deepEqual(p.update(w),[]);w.player.mapId='forest';assert.equal(p.update(w).length,1);
for(const [kind,state] of [['boar','示警'],['wolf','追击']]){p.reset();w.actors=[{...deer,id:kind,kind,state}];assert.equal(p.update(w)[0].species,kind)}
p.reset();w.actors=[deer,{...deer,id:'d2'}];assert.equal(p.update(w).length,1);
class FakeAudio{constructor(){this.readyState=4;this.paused=true;this.events={}}load(){}cloneNode(){return new FakeAudio()}addEventListener(k,f){this.events[k]=f}play(){this.paused=false;return Promise.resolve()}pause(){this.paused=true}}
const pool=new BeastVoicePool(()=>new FakeAudio());pool.preload();
const event={species:'wolf',volume:.5};assert(pool.play(event));assert(pool.play(event));assert(!pool.play(event));
const voices=[...pool.voices];pool.setState(false,false);assert.equal(pool.voices.size,0);assert(voices.every(a=>a.paused));assert(!pool.play(event));
pool.setState(true,true);assert(!pool.play(event));pool.setState(true,false);pool.samples.get('wolf').readyState=0;assert(!pool.play(event));
pool.samples.get('wolf').readyState=4;assert(pool.play(event));[...pool.voices][0].events.ended();assert.equal(pool.voices.size,0);
for(const [id,config] of Object.entries(BEAST_ART)){
 const png=await fs.readFile(`public${config.src}`);assert.equal(png.readUInt32BE(20),config.height);assert(config.prepared);
 const result=JSON.parse(await fs.readFile(`docs/production/beasts-v3/audio/${id}-result.json`));
 assert(result.quality.mechanical_passed);assert.equal(result.quality.channels,1);assert.equal(result.quality.duration,2);assert(result.quality.peak_dbfs<-1);
 const wav=await fs.readFile(`public/audio/beasts-v3/${id}.wav`);assert.equal(wav.toString('ascii',0,4),'RIFF');
}
console.log('PASS: beast state transitions, cooldowns, distance/map/death/pause gates, voice cap/mute/end/load guards, assets and audio quality');
