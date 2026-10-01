import {W,H,GROUND,scene,foreground,hero,enemy,sword,ring,poly} from './art.js';
import {music,toggle,sfx} from './audio.js';
import {CombatEffects,drawSwordArc,drawEnergyTrail} from './effects.js';
import {RayLighting,collectLights} from './lighting.js';
import {createSlash,stepSlash} from './combat.js';
const fx=new CombatEffects();let finisher=null;
const BALANCE={flightDrain:3,wardCastCost:12,wardHitCost:4,wardDamageMultiplier:.25};
const lighting=new RayLighting(W,H,()=>document.createElement('canvas'));
const $=s=>document.querySelector(s),canvas=$('#game'),ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
let state='menu',last=0,time=0,elapsed=0,shake=0,hitstop=0,dialogueIndex=0;
const keys=new Set(),pointer={x:340,y:160},player={},boss={};
let particles=[],arcs=[],shots=[],zones=[],ghosts=[],rings=[],swords=[],ending=0;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),distance=(a,b)=>Math.hypot(a.x-b.x,(a.y-b.y)/GROUND);
const angle=(a,b)=>Math.atan2((b.y-a.y)/GROUND,b.x-a.x);
const lines=[['赤霄镇剑使','落星台下，封着三百年前的劫火。你手中那柄玉剑，可承得住这份因果？'],['沈砚','师门将青珩交给我，不是要我避开因果。今日借前辈剑阵，问一问我的道。'],['赤霄镇剑使','好。看清符火落处，以玉剑化其锋。按 F 御剑可越地火，但腾空亦耗灵力，须防追魂符。'],['沈砚','青珩有灵，照我本心。前辈，请！']];
function reset(){Object.assign(player,{x:167,y:196,hp:100,qi:100,dao:0,face:-.4,attack:0,cool:0,parry:0,guard:false,guardHit:0,dash:0,dashCd:0,inv:0,qcd:0,combo:0,maxCombo:0,comboT:0,chain:0,step:0,moving:false,flying:false,altitude:0,slash:null});Object.assign(boss,{x:327,y:144,hp:480,maxHp:480,phase:1,posture:0,stun:0,cd:1.2,windup:0,dead:false,face:2.6});particles=[];arcs=[];shots=[];zones=[];ghosts=[];rings=[];swords=[];elapsed=0;ending=0;hitstop=0;shake=0;state='dialogue';dialogueIndex=0;$('#startScreen').classList.add('hidden');$('#resultScreen').classList.add('hidden');$('#bossHud').classList.remove('visible');music('dialogue');showDialogue();sync()}
function showDialogue(){fx.clear();finisher=null;let line=lines[dialogueIndex];$('#dialogue').hidden=false;$('#speaker').textContent=line[0];$('#dialogueText').textContent=line[1];$('#dialogueNext').textContent=dialogueIndex===lines.length-1?'执剑 · 开战':'继续  ↵';$('#dialogueCount').textContent=`${dialogueIndex+1} / ${lines.length}`}
function advance(){if(state!=='dialogue')return;if(++dialogueIndex<lines.length)showDialogue();else{state='play';$('#dialogue').hidden=true;$('#bossHud').classList.add('visible');music('battle');toast('青珩出鞘 · 问道赤霄')}}
function toast(s){$('#toast').textContent=s;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),1700)}
function burst(x,y,color,n=16,power=70){for(let i=0;i<n;i++){let a=Math.random()*Math.PI*2,v=power*(.2+Math.random()*.8);particles.push({x,y,z:4,vx:Math.cos(a)*v,vy:Math.sin(a)*v*GROUND,vz:25+Math.random()*45,life:.4+Math.random()*.3,color})}}
function shock(x,y,color,r=8){rings.push({x,y,color,r,life:.5,max:.5})}
function constrain(o){let dx=(o.x-240)/193,dy=(o.y-171)/70,r=Math.hypot(dx,dy);if(r>1){o.x=240+dx/r*193;o.y=171+dy/r*70}}
function hitBoss(n,p){if(boss.dead||state!=='play')return;fx.emit('impact',boss.x,boss.y-24,angle(player,boss),n>=28?1.5:1);boss.hp=Math.max(0,boss.hp-n*(boss.stun>0?1.5:1));boss.posture+=p;player.combo++;player.maxCombo=Math.max(player.maxCombo,player.combo);player.comboT=2;player.dao=clamp(player.dao+6,0,100);player.qi=clamp(player.qi+3,0,100);shake=n>=28?3:1.5;hitstop=n>=28?.065:.035;burst(boss.x,boss.y-18,'#e2e6a5',8);sfx('hit');if(boss.posture>=100){boss.posture=0;boss.stun=2.2;boss.windup=0;toast('道心破绽 · 乘势追击');shock(boss.x,boss.y,'#f1cd7c')}
 if(boss.hp<=0){boss.dead=true;shots=[];zones=[];ending=.9;burst(boss.x,boss.y-24,'#f3ce7b',50,120)}else if(boss.hp<240&&boss.phase===1){boss.phase=2;boss.cd=1.4;toast('赤霄法相 · 离火焚天');shock(boss.x,boss.y,'#f49e68',30)}}
function damage(n){if(player.inv>0||boss.dead)return;if(player.parry>0){player.parry=0;player.guardHit=.3;fx.emit('parry',player.x,player.y-22-player.altitude,player.face);player.dao=clamp(player.dao+22,0,100);boss.posture+=30;boss.stun=.75;shock(player.x,player.y,'#e5f8bf');burst(player.x,player.y-22,'#fbefb0',12,110);sfx('parry');toast('玉剑化锋');if(boss.posture>=100){boss.posture=0;boss.stun=2.2}return}if(player.guard){if(player.qi>=BALANCE.wardHitCost){player.qi-=BALANCE.wardHitCost;n*=BALANCE.wardDamageMultiplier;player.guardHit=.3;shock(player.x,player.y,'#76cab5')}else{player.guard=false;player.parry=0;toast('灵力不足 · 护身法术消散')}}
 player.slash=null;player.attack=0;player.hp=Math.max(0,player.hp-n);player.inv=.65;player.combo=0;shake=4;burst(player.x,player.y-16,'#c96c61');sfx('hit');if(player.hp<=0)finish(false)}
function attack(){
 if(state!=='play'||player.cool>0||player.dash>0)return;
 player.chain=player.comboT>0?(player.chain+1)%3:0;
 player.slash=createSlash(player.chain,angle(player,pointer));
 player.face=player.slash.angle;
 player.attack=player.cool=player.slash.startup+player.slash.active+player.slash.recovery;
}
function updateSlash(dt){
 const s=player.slash;if(!s)return;
 const result=stepSlash(s,dt,player,boss,GROUND);
 if(result.started)sfx('slash');
 if(result.hit)hitBoss(s.damage,s.posture);
 if(result.done)player.slash=null;
}
function parry(){
 if(state!=='play')return;
 if(player.guard){player.guard=false;player.parry=0;toast('太极护身 · 已解除');sync();return}
 if(player.qi<BALANCE.wardCastCost){toast('灵力不足 · 护身需 12 灵力');return}
 player.qi-=BALANCE.wardCastCost;player.slash=null;player.attack=0;player.parry=.19;player.guard=true;player.guardHit=.3;
 fx.emit('cast',player.x,player.y-22-player.altitude,player.face,.7);sfx('parry');toast('太极护身 · 持续生效 · K 解除');sync()
}
function dash(){if(state!=='play'||player.dashCd>0||player.qi<14)return;player.slash=null;player.attack=0;player.qi-=14;player.dash=.19;player.dashCd=.65;player.inv=.24;player.dashA=movementAngle()??player.face;sfx('dash')}
function flight(){if(state!=='play')return;if(!player.flying&&player.qi<15){toast('灵力不足 · 暂不可御剑');return}player.flying=!player.flying;shock(player.x,player.y,'#b6f1d3');sfx('dash');toast(player.flying?'御剑凌空 · F 收剑落地':'收剑落地 · 灵力渐复')}
function cast(){if(state!=='play'||player.qcd>0||player.qi<26)return;player.qi-=26;player.qcd=2;player.face=angle(player,pointer);fx.emit('cast',player.x+Math.cos(player.face)*14,player.y-18,player.face);shock(player.x,player.y,'#9ce7cf');for(let i=-1;i<=1;i++)shots.push({x:player.x,y:player.y,a:player.face+i*.13,v:230,life:1.7,friendly:true,trail:[]});sfx('cast')}
function ultimate(){if(state!=='play'||player.dao<100||boss.dead)return;player.dao=0;player.inv=1.5;boss.stun=1.1;fx.emit('formation',boss.x,boss.y);finisher={x:boss.x,y:boss.y,wait:4};shock(player.x,player.y,'#d5f6bb',35);toast('青珩剑阵 · 万剑归宗');for(let i=0;i<18;i++){let a=i*Math.PI/9;swords.push({x:boss.x+Math.cos(a)*110,y:boss.y+Math.sin(a)*70,a:a+Math.PI,delay:.5+i*.045,life:2,trail:[]})}sfx('ultimate')}
function movementAngle(){let x=Number(keys.has('KeyD'))-Number(keys.has('KeyA')),y=Number(keys.has('KeyS'))-Number(keys.has('KeyW'));return x||y?Math.atan2(y,x):null}
function finish(win){state=win?'win':'lose';$('#bossHud').classList.remove('visible');$('#resultKicker').textContent=win?'赤霄镇剑使：此剑有主，此道可期。':'赤霄镇剑使：收敛心神，再来。';$('#resultTitle').textContent=win?'道心通明':'胜败亦是修行';$('#timeStat').textContent=`${Math.floor(elapsed/60)}:${String(Math.floor(elapsed%60)).padStart(2,'0')}`;$('#comboStat').textContent=player.maxCombo;$('#resultScreen').classList.remove('hidden');music('dialogue')}
function update(dt){time+=dt;fx.update(dt);if(state!=='play')return;if(finisher){finisher.wait-=dt;if((finisher.wait<=0||swords.length===0)&&!ending){fx.emit('finale',boss.x,boss.y-22);shake=3;sfx('ultimate');finisher=null}}if(ending){if(finisher){fx.emit('finale',boss.x,boss.y-22);finisher=null}ending-=dt;shake=Math.max(0,shake-dt*18);if(ending<=0)finish(true);return}if(hitstop>0){hitstop-=dt;return}elapsed+=dt;
 for(let k of ['attack','cool','parry','guardHit','dash','dashCd','inv','qcd','comboT'])player[k]=Math.max(0,player[k]-dt);for(let k of ['stun','cd'])boss[k]=Math.max(0,boss[k]-dt);if(player.comboT===0)player.combo=0;
 player.altitude+=((player.flying?20+Math.sin(time*4)*1.5:0)-player.altitude)*Math.min(1,dt*7);
 let a=movementAngle(),speed=(player.flying?140:86)*(player.slash?.35:1);player.moving=a!==null;if(player.dash>0){a=player.dashA;speed=300;ghosts.push({...player,life:.23})}if(a!==null){player.x+=Math.cos(a)*speed*dt;player.y+=Math.sin(a)*speed*dt*GROUND;player.step+=speed*dt*.09}constrain(player);player.face=player.slash?player.slash.angle:angle(player,pointer);updateSlash(dt);player.qi=clamp(player.qi+dt*(player.flying?-BALANCE.flightDrain:7),0,100);if(player.flying){if(player.moving)particles.push({x:player.x-10,y:player.y,z:player.altitude,vx:-Math.cos(a)*15,vy:-Math.sin(a)*10,vz:0,life:.35,color:'#95e9d0'});if(player.qi===0){player.flying=false;toast('灵力耗尽 · 自动落地')}}
 if(!boss.dead&&boss.stun<=0){boss.face=angle(boss,player);if(boss.windup>0){boss.windup-=dt;if(boss.windup<=0){arcs.push({x:boss.x,y:boss.y,a:boss.aim,r:66,life:.3,max:.3,hostile:true});let delta=Math.atan2(Math.sin(angle(boss,player)-boss.aim),Math.cos(angle(boss,player)-boss.aim));if(distance(player,boss)<74&&Math.abs(delta)<1.25)damage(20);sfx('slash')}}else if(boss.cd===0){boss.cd=boss.phase===2?1.25:1.7;if(distance(player,boss)<80){boss.windup=.65;boss.aim=boss.face}else{for(let i=-1;i<=1;i++)shots.push({x:boss.x,y:boss.y,a:boss.face+i*.24,v:boss.phase===2?115:95,life:4,friendly:false,trail:[]})}if(boss.phase===2)for(let i=-1;i<=1;i++)zones.push({x:player.x+i*33,y:player.y,life:1.15,hit:false})}else if(distance(player,boss)>62){boss.x+=Math.cos(boss.face)*25*dt;boss.y+=Math.sin(boss.face)*25*dt*GROUND;constrain(boss)}}
 for(let p of shots){p.trail.push({x:p.x,y:p.y});if(p.trail.length>9)p.trail.shift();p.x+=Math.cos(p.a)*p.v*dt;p.y+=Math.sin(p.a)*p.v*dt*GROUND;p.life-=dt;let target=p.friendly?boss:player;if(p.life>0&&distance(p,target)<16){p.life=0;if(p.friendly)hitBoss(14,8);else damage(13);burst(p.x,p.y-15,p.friendly?'#b7ffdb':'#eea369')}}shots=shots.filter(p=>p.life>0);
 for(let z of zones){z.life-=dt;if(z.life<.3&&!z.hit){z.hit=true;burst(z.x,z.y,'#efa865',22,85);if(distance(player,z)<25&&player.altitude<12)damage(19)}}zones=zones.filter(z=>z.life>0);
 for(let s of swords){s.delay-=dt;if(s.delay>0)continue;s.trail.push({x:s.x,y:s.y});if(s.trail.length>12)s.trail.shift();s.a=angle(s,boss);s.x+=Math.cos(s.a)*300*dt;s.y+=Math.sin(s.a)*300*dt*GROUND;s.life-=dt;if(distance(s,boss)<18){s.life=0;hitBoss(6,2)}}swords=swords.filter(s=>s.life>0&&!boss.dead);
 for(let p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vz-=150*dt;p.life-=dt}particles=particles.filter(p=>p.life>0);for(let a of arcs)a.life-=dt;arcs=arcs.filter(a=>a.life>0);for(let r of rings){r.life-=dt;r.r+=dt*75}rings=rings.filter(r=>r.life>0);for(let g of ghosts)g.life-=dt;ghosts=ghosts.filter(g=>g.life>0);shake=Math.max(0,shake-dt*18);sync()}
function sync(){$('#guardSkill').classList.toggle('ready',player.guard);$('#guardSkill span').textContent=player.guard?'护身已开启':'太极护身';$('#hpBar').style.width=player.hp+'%';$('#qiBar').style.width=player.qi+'%';$('#bossBar').style.width=boss.hp/boss.maxHp*100+'%';$('#postureBar').style.width=boss.posture+'%';$('#phase').textContent=boss.phase===1?'壹 · 守阵':'贰 · 离火';$('#combo strong').textContent=player.combo;$('#combo').classList.toggle('show',player.combo>1);$('#ultimate').classList.toggle('ready',player.dao>=100);$('#ultimate i').style.width=player.dao+'%';$('#qCd').style.width=(1-player.qcd/2)*100+'%';$('#flightSkill').classList.toggle('ready',player.flying);$('#flightSkill span').textContent=player.flying?'收剑落地':'御剑飞行';$('#objective').textContent=state==='dialogue'?'与镇剑使对话':player.flying?'御剑凌空 · 灵力持续消耗':boss.phase===1?'玉剑化锋 · 破其道心':'避开符火 · 破除法相'}
function trail(p,color){drawEnergyTrail(ctx,p,color,p.delay===undefined?18:22)}
function draw(){ctx.save();ctx.translate(Math.round((Math.random()-.5)*shake),Math.round((Math.random()-.5)*shake));scene(ctx,time);
 for(let z of zones){ring(ctx,z.x,z.y,25,'#ffbd76');ring(ctx,z.x,z.y,25*(1-z.life/1.15),'#ff7159',.8);if(z.hit){ctx.fillStyle='#ffcc8533';ctx.fillRect(z.x-10,z.y-80,20,80);ctx.fillStyle='#fff0b6';ctx.fillRect(z.x-1,z.y-80,2,80)}}
 if(boss.windup>0){ctx.save();ctx.translate(boss.x,boss.y);ctx.scale(1,GROUND);ctx.fillStyle='#ff795b44';ctx.strokeStyle='#ffc082';ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,73,boss.aim-1.2,boss.aim+1.2);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}
 fx.ground(ctx);rings.forEach(r=>ring(ctx,r.x,r.y,r.r,r.color,r.life/r.max));ghosts.forEach(g=>hero(ctx,g,time,g.life*.9));
 for(let o of [player,boss].sort((a,b)=>a.y-b.y)){if(o.dead)continue;ctx.fillStyle='#0b202c70';ctx.beginPath();ctx.ellipse(o.x,o.y,16,6,0,0,7);ctx.fill();o===player?hero(ctx,o,time):enemy(ctx,o,time)}
 if(player.guard){
  const x=player.x,y=player.y-24-player.altitude,pulse=.5+.5*Math.sin(time*2.5);
  ctx.save();ctx.fillStyle=player.guardHit>0?'#b9ffe52b':'#79d8c310';ctx.strokeStyle=player.guardHit>0?'#eeffcf':'#92dfc4';ctx.globalAlpha=.65+pulse*.2;
  ctx.beginPath();ctx.ellipse(x,y,23,29,0,0,Math.PI*2);ctx.fill();ctx.stroke();
  for(let i=0;i<4;i++){let a=time*.65+i*Math.PI/2;ctx.fillStyle='#daf4bf';ctx.fillRect(x+Math.cos(a)*23-1,y+Math.sin(a)*29-1,2,2)}
  ctx.restore();ring(ctx,player.x,player.y-player.altitude,25,'#91dfbc',.5);
 }
 for(let a of arcs)drawSwordArc(ctx,{...a,heavy:!a.hostile&&a.r>50});
 if(player.slash){const s=player.slash;if(s.age>=s.startup&&s.age<s.startup+s.active)drawSwordArc(ctx,{x:player.x,y:player.y-player.altitude,a:s.angle,r:s.reach-8,life:s.startup+s.active-s.age,max:s.active,flip:s.flip,heavy:player.chain===2})}
 for(let p of shots){trail(p,p.friendly?'#acffe0':'#f3a165');if(p.friendly)sword(ctx,p.x,p.y-18,p.a,.65);else{ctx.save();ctx.translate(p.x,p.y-18);ctx.rotate(time*5);poly(ctx,[[-6,0],[0,-6],[6,0],[0,6]],'#e99d62');ctx.fillStyle='#fff2b8';ctx.fillRect(-2,-2,4,4);ctx.restore()}}
 for(let s of swords){trail(s,'#c9ffe0');ctx.save();ctx.globalAlpha=s.delay>0?.4+.3*Math.sin(time*14+s.delay):1;sword(ctx,s.x,s.y-22,s.a,.85);ctx.restore()}particles.forEach(p=>{ctx.globalAlpha=Math.min(1,p.life*3);ctx.fillStyle=p.color;ctx.fillRect(Math.round(p.x),Math.round(p.y-p.z),2,2)});ctx.globalAlpha=1;fx.front(ctx);foreground(ctx);lighting.draw(ctx,collectLights(player,boss,shots,swords,zones,fx.items,time));ctx.restore()}
function loop(t){let dt=Math.min(.033,(t-last)/1000||0);last=t;update(dt);draw();requestAnimationFrame(loop)}
addEventListener('keydown',e=>{if(['Space','Enter'].includes(e.code))e.preventDefault();if(state==='dialogue'&&['Space','Enter'].includes(e.code)){if(!e.repeat)advance();return}keys.add(e.code);if(e.repeat)return;({KeyJ:attack,KeyK:parry,Space:dash,KeyQ:cast,KeyE:ultimate,KeyF:flight})[e.code]?.()});addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',()=>keys.clear());
canvas.addEventListener('mousemove',e=>{let r=canvas.getBoundingClientRect();pointer.x=(e.clientX-r.left)*W/r.width;pointer.y=(e.clientY-r.top)*H/r.height+15});canvas.addEventListener('mousedown',e=>e.button===0?attack():parry());canvas.addEventListener('contextmenu',e=>e.preventDefault());
$('#lightingToggle').textContent=lighting.label;$('#lightingToggle').onclick=()=>{$('#lightingToggle').textContent=lighting.cycle()};
$('#startButton').onclick=reset;$('#restartButton').onclick=reset;$('#dialogueNext').onclick=advance;$('#soundToggle').onclick=()=>{$('#soundToggle').textContent=toggle()?'声 ◐':'声 ○'};
Object.assign(player,{x:160,y:197,face:-.4,step:0,altitude:0});Object.assign(boss,{x:327,y:146,phase:1});requestAnimationFrame(loop);
