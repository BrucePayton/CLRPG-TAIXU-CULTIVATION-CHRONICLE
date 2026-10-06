export const BEAST_SOUNDS={deer:{states:['逃离'],cooldown:8},boar:{states:['示警','蓄势'],cooldown:7},wolf:{states:['追击','蓄势'],cooldown:6}};
// Pure presentation policy: never changes AI, anger, damage or world events.
export class BeastSoundPolicy{
 constructor(){this.reset()}
 reset(){this.states=new Map();this.next=new Map();this.speciesNext=new Map();this.globalNext=0;this.map=null}
 update(w){
  if(this.map!==w.player.mapId){this.reset();this.map=w.player.mapId}
  if(w.paused||w.dead||w.dialogue)return [];
  const result=[];
  for(const e of w.actors){
   const spec=BEAST_SOUNDS[e.kind];if(!spec||e.dead||e.mapId!==this.map)continue;
   const previous=this.states.get(e.id);this.states.set(e.id,e.state);
   const distance=Math.hypot(e.x-w.player.x,e.y-w.player.y);
   if(previous===e.state||!spec.states.includes(e.state)||distance>=180)continue;
   if(w.time<(this.next.get(e.id)||0)||w.time<(this.speciesNext.get(e.kind)||0)||w.time<this.globalNext)continue;
   this.next.set(e.id,w.time+spec.cooldown);this.speciesNext.set(e.kind,w.time+3);this.globalNext=w.time+.8;
   result.push({species:e.kind,actorId:e.id,volume:.7*Math.pow(1-distance/180,1.25)});
  }
  return result;
 }
}
// Separate limited pool: no network dependency, no beeps substituted on failure.
export class BeastVoicePool{
 constructor(makeAudio=url=>new Audio(url)){this.makeAudio=makeAudio;this.voices=new Set();this.samples=new Map();this.enabled=true;this.paused=false}
 preload(){for(const species of Object.keys(BEAST_SOUNDS)){const a=this.makeAudio(`/audio/beasts-v3/${species}.wav`);a.preload='auto';a.load();this.samples.set(species,a)}}
 stop(){for(const a of this.voices){a.pause();a.currentTime=0}this.voices.clear()}
 setState(enabled,paused){this.enabled=enabled;this.paused=paused;if(!enabled||paused)this.stop()}
 play({species,volume}){
  const sample=this.samples.get(species);
  // Drop events until loaded; never play stale warning sounds after buffering.
  if(!this.enabled||this.paused||!sample||sample.readyState<2||this.voices.size>=2||!Number.isFinite(volume)||volume<=0)return false;
  const a=sample.cloneNode();a.volume=Math.max(0,Math.min(.7,volume));a.loop=false;this.voices.add(a);
  const finish=()=>{a.pause();this.voices.delete(a)};
  a.addEventListener('ended',finish,{once:true});a.addEventListener('error',finish,{once:true});
  a.play().catch(finish);return true;
 }
}
