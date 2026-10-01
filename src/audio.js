const tracks={dialogue:new Audio('/audio/dialogue.mp3'),battle:new Audio('/audio/battle.mp3')};
for(const a of Object.values(tracks)){a.loop=true;a.volume=0}
let enabled=true,current=null,context,timer;
const spell=new Audio('/audio/jade-sword.wav');let ready=false;spell.addEventListener('canplaythrough',()=>ready=true);spell.load();
export function music(name){current=name;clearInterval(timer);if(enabled)tracks[name].play().catch(()=>{});timer=setInterval(()=>{for(const [key,a] of Object.entries(tracks)){let target=enabled&&key===current?.27:0;a.volume+=Math.sign(target-a.volume)*Math.min(.025,Math.abs(target-a.volume));if(a.volume===0&&key!==current)a.pause()}},80)}
export function toggle(){enabled=!enabled;if(current)music(current);return enabled}
export function sfx(kind){if(!enabled)return;context??=new AudioContext();context.resume();if(kind==='cast'&&ready){let a=spell.cloneNode();a.volume=.9;a.play().catch(()=>{});return}
 let now=context.currentTime,f={slash:680,hit:120,parry:1300,cast:800,dash:340,ultimate:230}[kind]||300;
 for(let i=0;i<3;i++){let o=context.createOscillator(),g=context.createGain();o.type=i===0?'triangle':'sine';o.frequency.setValueAtTime(f*(1+i*.51),now);o.frequency.exponentialRampToValueAtTime(f*.3,now+.25);g.gain.setValueAtTime(.035/(i+1),now);g.gain.exponentialRampToValueAtTime(.0001,now+.3+i*.08);o.connect(g).connect(context.destination);o.start(now);o.stop(now+.55)}
 let b=context.createBuffer(1,context.sampleRate*.16,context.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);let n=context.createBufferSource(),g=context.createGain(),filter=context.createBiquadFilter();n.buffer=b;filter.type='bandpass';filter.frequency.value=kind==='hit'?400:2200;g.gain.value=.06;n.connect(filter).connect(g).connect(context.destination);n.start();
}
