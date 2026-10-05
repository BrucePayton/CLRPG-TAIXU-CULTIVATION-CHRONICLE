import {MUSIC_TRACKS} from './music-policy.js';
let enabled=true,current=null,context,timer,paused=false,active=null;
const voices=[],unavailable=new Set();
const spell=new Audio('/audio/jade-sword.wav');let ready=false;spell.addEventListener('canplaythrough',()=>ready=true);spell.load();
function startVoice(key){
 if(unavailable.has(key))return;
 const info=MUSIC_TRACKS[key],audio=new Audio(info.url);audio.volume=0;audio.loop=true;
 const voice={key,audio};voices.push(voice);active=voice;
 audio.addEventListener('error',()=>{unavailable.add(key);audio.pause()},{once:true});
 audio.play().catch(()=>{});
}
function tick(){
 if(enabled&&!paused&&active&&!unavailable.has(active.key)){
  const a=active.audio;
  if(Number.isFinite(a.duration)&&a.duration>4&&a.currentTime>a.duration-1.3)startVoice(active.key);
 }
 for(let i=voices.length-1;i>=0;i--){
  const v=voices[i],target=enabled&&!paused&&v===active&&!unavailable.has(v.key)?MUSIC_TRACKS[v.key].volume:0;
  v.audio.volume+=Math.sign(target-v.audio.volume)*Math.min(.014,Math.abs(target-v.audio.volume));
  if(v.audio.volume<.001&&target===0){v.audio.pause();if(v!==active)voices.splice(i,1)}
 }
}
export function music(name){
 if(!MUSIC_TRACKS[name])return;
 const changed=current!==name;current=name;
 if(enabled&&!paused&&!unavailable.has(name)){if(changed||!active||active.key!==name)startVoice(name);else if(active.audio.paused)active.audio.play().catch(()=>{})}
 timer??=setInterval(tick,80);
}
export function pauseMusic(value){if(paused===value)return;paused=value;if(!paused&&current)music(current)}
export function musicStatus(){return !enabled?'音乐已静音':paused?'音乐暂停':current?(unavailable.has(current)?'本地音乐未安装':MUSIC_TRACKS[current].title):'音乐待播放'}
export function toggle(){enabled=!enabled;if(current)music(current);return enabled}
export function sfx(kind){if(!enabled)return;context??=new AudioContext();context.resume();if(kind==='cast'&&ready){let a=spell.cloneNode();a.volume=.9;a.play().catch(()=>{});return}
 let now=context.currentTime,f={slash:680,hit:120,parry:1300,cast:800,dash:340,ultimate:230}[kind]||300;
 for(let i=0;i<3;i++){let o=context.createOscillator(),g=context.createGain();o.type=i===0?'triangle':'sine';o.frequency.setValueAtTime(f*(1+i*.51),now);o.frequency.exponentialRampToValueAtTime(f*.3,now+.25);g.gain.setValueAtTime(.035/(i+1),now);g.gain.exponentialRampToValueAtTime(.0001,now+.3+i*.08);o.connect(g).connect(context.destination);o.start(now);o.stop(now+.55)}
 let b=context.createBuffer(1,context.sampleRate*.16,context.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);let n=context.createBufferSource(),g=context.createGain(),filter=context.createBiquadFilter();n.buffer=b;filter.type='bandpass';filter.frequency.value=kind==='hit'?400:2200;g.gain.value=.06;n.connect(filter).connect(g).connect(context.destination);n.start();
}
