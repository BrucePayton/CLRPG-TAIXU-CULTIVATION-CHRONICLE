import {createWorld,stepWorld,action,craft,nearby,regionAt,threats,RECIPES,SPELLS,ROCKS} from './world.js';
import {recover,answerSpar,arrayStatus} from './world.js';
import {MAP_EXITS,REGIONS,sameMap} from './maps.js';
import {compileSpell,spellProjectiles,ELEMENTS,SHAPES,MODIFIERS,drawCraftProjectile} from './spellcraft.js';
import {cameraFor,terrain,drawNode,drawCreature,minimap,DECORATIONS,drawDecoration,arenaForeground} from './world-art.js';
import {MotionEffects} from './motion-effects.js';
import {loadWorldArt} from './world-assets.js';
import {hero,sword,ring,ward} from './art.js';
import {CombatEffects,drawSwordArc,drawEnergyTrail} from './effects.js';
import {drawBossCharge,drawBossBolt,drawFireZone} from './boss-effects.js';
import {RayLighting,collectLights} from './lighting.js';
import {music,sfx,toggle,pauseMusic,musicStatus} from './audio.js';
import {chooseMusic} from './music-policy.js';
import {CAMP_LAMPS,CAMP_SOLIDS} from './camp-layout.js';

const $=s=>document.querySelector(s),canvas=$('#game'),c=canvas.getContext('2d');
c.imageSmoothingEnabled=false;
loadWorldArt();
const w=createWorld(),fx=new CombatEffects(),lighting=new RayLighting(480,270),keys=new Set();
const musicMemory={},motion=new MotionEffects();let bossArcs=[];
// Development-only fixture: inspect actual scene/UI without pretending this is a playthrough.
if(import.meta.env.DEV){
 const query=new URLSearchParams(location.search),exit=MAP_EXITS.find(e=>e.id===query.get('inspectExit'));
 if(exit){Object.assign(w.player,{x:exit.x,y:exit.y,mapId:exit.mapId});w.player.safe={x:exit.x,y:exit.y,mapId:exit.mapId}}
 if(query.get('inspectMap')==='arena'){Object.assign(w.player,{x:1735,y:384,mapId:'arena'});w.player.safe={x:1735,y:384,mapId:'arena'}}
 if(exit||query.get('inspectMap')==='arena')$('.chapter span').textContent='开发验收起点 · 非正常流程';
}
let started=false,largeMap=false,panel=null,last=0,accumulator=0,cam=cameraFor(w.player),mouse={x:320,y:145},noticeUntil=0,track='';
const target=()=>({x:mouse.x+cam.x,y:mouse.y+cam.y+15});
function notice(text){$('#toast').textContent=text;$('#toast').classList.add('show');noticeUntil=performance.now()+4200}
function consume(){for(const e of w.events){if(e.kind==='message')notice(e.text);else if(['mapChange','sparStart','sparEnd'].includes(e.kind)){fx.clear();motion.clear();bossArcs=[];keys.clear();delete musicMemory.lastThreat;cam=cameraFor(w.player)}else if(e.kind==='bossSlash'){bossArcs.push({x:e.x,y:e.y,a:e.a,r:66,life:.3,max:.3,hostile:true});sfx('slash')}else if(['slash','dash'].includes(e.kind))sfx(e.kind);else{fx.emit(e.kind,e.x,e.y,e.a);if(['impact','cast','parry','formation'].includes(e.kind))sfx(e.kind==='impact'?'hit':e.kind==='formation'?'ultimate':e.kind)}}w.events.length=0}
function doAction(name){if(!name||!started||panel||w.paused)return;action(w,name,target());consume();sync()}
function pause(value){w.paused=value;keys.clear();accumulator=0;$('#pauseOverlay').hidden=!value;}
function closePanel(){panel=null;$('#workbench').hidden=true;w.paused=false;keys.clear();accumulator=0}
function openPanel(kind){
 if(!started||w.dead)return;if(panel===kind){closePanel();return}panel=kind;w.paused=true;keys.clear();$('#pauseOverlay').hidden=true;$('#workbench').hidden=false;
 $('#workTitle').textContent=kind==='craft'?'丹炉与傀儡工坊':'自创术式 · 元素融合';
 $('#craftControls').hidden=kind!=='craft';$('#spellControls').hidden=kind!=='spell';updateRecipe();
}
function recipe(){return {elements:[$('#elementA').value,...($('#elementB').value?[$('#elementB').value]:[])],shape:$('#spellShape').value,modifier:$('#spellModifier').value}}
function updateRecipe(){try{const s=compileSpell(recipe());$('#spellSummary').textContent=`${s.name} · 灵力 ${s.cost} · 冷却 ${s.cd.toFixed(1)} 秒 · 单弹 ${s.damage.toFixed(1)} 伤害${s.slow?' · 减速':''}${s.stun?' · 失衡':''}${s.splash?' · 范围波及':''}${s.pierce>1?' · 最多穿透 '+s.pierce+' 目标':''}`;$('#equipSpell').disabled=false}catch(e){$('#spellSummary').textContent=e.message;$('#equipSpell').disabled=true}}
function previewSpell(t){
 if(panel!=='spell')return;const pc=$('#spellPreview').getContext('2d');pc.clearRect(0,0,360,85);pc.fillStyle='#102c32';pc.fillRect(0,0,360,85);
 try{const spell=compileSpell(recipe()),flight=(t/1000%1.6)/1.6;const shots=spellProjectiles(spell,{x:spell.shape==='ring'?180:30,y:58},0);
  for(const p of shots){const start={x:p.x,y:p.y},range=spell.shape==='ring'?55:280;
   p.x+=Math.cos(p.a)*range*flight;p.y+=Math.sin(p.a)*range*flight*.5;
   for(let i=8;i>=0;i--){const d=Math.max(0,range*flight-i*4);p.trail.push({x:start.x+Math.cos(p.a)*d,y:start.y+Math.sin(p.a)*d*.5})}
   drawCraftProjectile(pc,p,t/1000);
  }
 }catch{};
}
function sync(){
 $('#musicStatus').textContent=musicStatus();
 const p=w.player,spell=p.spell===4?w.customSpell:SPELLS[p.spell];
 $('#hpBar').style.width=p.hp/p.maxHp*100+'%';$('#qiBar').style.width=p.qi+'%';
 $('#guardSkill').classList.toggle('ready',p.guard);$('#guardSkill span').textContent=p.guard?'护身已开启':'太极护身';
 $('#flightSkill').classList.toggle('ready',p.flying);$('#flightSkill span').textContent=p.flying?'收剑落地':'御剑飞行';
 const ultimate=arrayStatus(w,'ultimate'),formation=arrayStatus(w,'formation');
 for(const [id,status] of [['ultimate',ultimate],['formationSkill',formation]]){$('#'+id).classList.toggle('ready',status.ready);$('#'+id).title=status.reason;$('#'+id).dataset.available=String(status.ready)}
 $('#arrayStatus').textContent=`E 剑阵 · 道意 ${Math.floor(p.dao)}/100 · ${ultimate.ready?'可施放':p.dao<100?'命中 / 招架积累':'无可锁定目标'} ｜ Z 布阵 · 灵草 ${p.herbs}/1 · 灵力 ${Math.floor(p.qi)}/20 · ${p.formationCd>0?'冷却 '+p.formationCd.toFixed(1)+'s':formation.ready?'可施放':'资源不足'}`;
 $('#ultimate i').style.width=p.dao+'%';$('#formationSkill i').style.width=Math.max(0,1-p.formationCd/12)*100+'%';$('#qCd').style.width=Math.max(0,1-p.qcd/spell.cd)*100+'%';
 $('#spellName').textContent=spell.name;$('#regionName').textContent=regionAt(p).name;
 $('#objective').textContent=w.quest?`探索碑文 ${w.nodes.filter(n=>n.kind==='stone'&&n.taken).length}/3 · ${w.discovered.size}/${REGIONS.length} 地区`:`药师委托 · 灵草 ${p.herbs}/3（R 交付）`;
 const n=nearby(w);$('#worldHint').textContent=w.meditation>0?`合修调息 ${w.meditation.toFixed(1)} 秒`:n?`R · ${n.kind==='exit'?'前往 '+n.to:({herb:'采集灵草',ore:'采集灵砂',stone:'阅读碑文',camp:'营火休整',bed:'卧榻休整',workbench:'丹炉说明 · B 炼制',healer:'药师交谈 / 交付',warden:'与镇剑使原地切磋'})[n.kind]||'观察习性'}`:'沿路标换图 · Tab 地图 · V 自创法术 · B 炼制';
 $('#inventory').textContent=`灵草 ${p.herbs} · 灵砂 ${p.ore} · 回元丹 ${p.potions}[H] · 聚气丹 ${p.spirit}[G]${p.harmony>0?' · 合修增益 '+Math.ceil(p.harmony)+'s':''}${p.puppetOwned?' · 傀儡已制成[X]':''}`;
 $('#deathOverlay').hidden=!w.dead;
 $('#sparDialogue').hidden=!w.dialogue;$('#sparText').textContent=w.dialogue?.text||'';
 const boss=w.actors.find(e=>e.kind==='warden'),active=Boolean(boss.sparring&&sameMap(boss,p));
 $('#bossHud').classList.toggle('world-active',active);$('#bossBar').style.width=boss.hp/boss.maxHp*100+'%';$('#postureBar').style.width=boss.posture+'%';$('#phase').textContent=boss.phase===1?'壹 · 守阵':'贰 · 离火';
}
function draw(){
 const p=w.player;cam=cameraFor(p);c.fillStyle='#102329';c.fillRect(0,0,480,270);c.save();c.translate(-cam.x,-cam.y);c.beginPath();c.rect(cam.map.x,cam.map.y,cam.map.w,cam.map.h);c.clip();c.save();terrain(c,cam,w.time);c.restore();
 for(const z of w.zones)drawFireZone(c,z,w.time);
 for(const f of w.formations){ring(c,f.x,f.y,80,'#9fdbb2',.45);ring(c,f.x,f.y,65+Math.sin(w.time*3)*5,'#e0d295',.4)}
 fx.ground(c);motion.draw(c,hero,w.time);
 for(const e of w.actors.filter(e=>sameMap(e,p)&&!e.dead&&e.windup>0&&(e.kind!=='warden'||e.attackKind==='melee'))){c.save();c.translate(e.x,e.y);c.scale(1,.62);c.fillStyle='#df805344';c.strokeStyle='#fbd294';c.beginPath();c.moveTo(0,0);c.arc(0,0,e.kind==='warden'?74:48,e.aim-1.1,e.aim+1.1);c.closePath();c.fill();c.stroke();c.restore()}
 const actors=[...DECORATIONS.map(o=>({type:'decoration',o})),...[...w.nodes,...MAP_EXITS].filter(n=>!n.taken).map(n=>({type:'node',o:n})),...w.actors.map(o=>({type:'creature',o})),{type:'hero',o:p}].filter(a=>sameMap(a.o,p)).sort((a,b)=>a.o.y-b.o.y);
 for(const {type,o} of actors){if(o.x<cam.x-80||o.x>cam.x+560||o.y<cam.y-30||o.y>cam.y+350)continue;
  if(type==='decoration')drawDecoration(c,o,p);else if(type==='node')drawNode(c,o,w.time,p);else if(type==='creature')drawCreature(c,o,w.time);else{c.fillStyle='#14292d70';c.beginPath();c.ellipse(p.x,p.y,15,5,0,0,7);c.fill();hero(c,p,w.time)}
 }
 ward(c,p,w.time);
 for(const a of bossArcs)drawSwordArc(c,a);
 if(p.slash){const s=p.slash;if(s.age>=s.startup&&s.age<s.startup+s.active)drawSwordArc(c,{x:p.x,y:p.y-p.altitude,a:s.angle,r:s.reach-8,life:s.startup+s.active-s.age,max:s.active,flip:s.flip,heavy:p.chain===2})}
 if(w.puppet){const a=w.puppet;c.fillStyle='#9a8964';c.fillRect(a.x-6,a.y-20,12,18);c.fillStyle='#b3efd2';c.fillRect(a.x-3,a.y-17,6,4);ring(c,a.x,a.y,13,'#acbd81',.5)}
 if(w.meditation>0||p.harmony>0)ring(c,p.x,p.y,25+Math.sin(w.time*3)*3,'#d6b5ea',.5);
 for(const e of w.actors)if(e.kind==='warden'&&sameMap(e,p))drawBossCharge(c,e,w.time);
 for(const z of w.zones)drawFireZone(c,z,w.time,true);
 for(const s of w.shots){if(s.recipe)drawCraftProjectile(c,s,w.time);else if(s.friendly){const color={jade:'#a6f7d0',frost:'#a4dfff',flame:'#ffb176',thunder:'#d7b5ff'}[s.spell]||'#a6f7d0';drawEnergyTrail(c,s,color);sword(c,s.x,s.y-18,s.a,.65,color)}else drawBossBolt(c,s,w.time)}
 for(const s of w.swords){drawEnergyTrail(c,s,'#baffd2',22);sword(c,s.x,s.y-22,s.a,.8)}fx.front(c);if(cam.map.id==='arena')arenaForeground(c);c.restore();
 const boss=w.actors.find(e=>e.kind==='warden'&&sameMap(e,p))||{dead:true};
 const lights=collectLights(p,boss,w.shots,w.swords,w.zones,fx.items,w.time).filter(l=>l.priority>0).map(l=>({...l,x:l.x-cam.x,y:l.y-cam.y})).filter(l=>l.x>-l.radius&&l.x<480+l.radius&&l.y>-l.radius&&l.y<270+l.radius);
 if(cam.map.id==='arena')for(const [x,y] of [[68,122],[412,122],[54,222],[426,222]])lights.push({x,y:y-38,radius:38,color:[135,220,193],power:.28+Math.sin(w.time*2+x)*.025,priority:0});
 if(cam.map.id==='camp')for(const l of CAMP_LAMPS)lights.push({x:l.x-cam.x,y:l.y-22-cam.y,radius:37,color:[245,199,122],power:.22,priority:0});
 for(const s of w.shots.filter(s=>s.recipe))for(const id of s.recipe.elements){const hex=ELEMENTS[id].color;lights.push({x:s.x-cam.x,y:s.y-18-cam.y,radius:38,power:.35,color:[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16))})}
 const occluders=ROCKS.map(r=>[[r.x-r.r-cam.x,r.y-cam.y],[r.x-cam.x,r.y-30-cam.y],[r.x+r.r-cam.x,r.y-cam.y]]);
 if(cam.map.id==='camp')for(const r of CAMP_SOLIDS)occluders.push([[r.x-cam.x,r.y-cam.y],[r.x+r.w-cam.x,r.y-cam.y],[r.x+r.w-cam.x,r.y+r.h-cam.y],[r.x-cam.x,r.y+r.h-cam.y]]);
 c.save();if(cam.map.id==='camp')c.globalAlpha=.42;
 lighting.draw(c,lights.slice(0,16),cam.map.id==='arena'?undefined:occluders);c.restore();
 c.fillStyle='#102329';if(cam.map.w<480){const pad=(480-cam.map.w)/2;c.fillRect(0,0,pad,270);c.fillRect(480-pad,0,pad,270)}
 minimap(c,w,largeMap);
 if(w.transition>0){c.save();c.globalAlpha=Math.min(1,w.transition/.4);c.fillStyle='#102329';c.fillRect(0,0,480,270);c.globalAlpha=1;c.fillStyle='#e4d6a9';c.font='18px serif';c.textAlign='center';c.fillText(cam.map.name,240,138);c.restore()}
}
function loop(t){
 const dt=Math.min(.1,(t-last)/1000||0);last=t;
 if(started&&!w.paused&&!w.dead&&!w.dialogue){accumulator+=dt;while(accumulator>=1/60){stepWorld(w,1/60,{x:Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft')),y:Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp')),target:target()});fx.update(1/60);motion.update(w.player,1/60);for(const a of bossArcs)a.life-=1/60;bossArcs=bossArcs.filter(a=>a.life>0);accumulator-=1/60}consume();
  const next=chooseMusic({region:regionAt(w.player).name,threat:threats(w),meditating:w.meditation>0,dead:w.dead,time:w.time},musicMemory);if(track!==next){track=next;music(next)}
 }
 pauseMusic(w.paused||w.dead);if(t>noticeUntil)$('#toast').classList.remove('show');sync();draw();previewSpell(t);requestAnimationFrame(loop);
}
$('#startButton').onclick=()=>{started=true;$('#startScreen').classList.add('hidden');notice(`${regionAt(w.player).name} · 靠近人物或路标按 R 交互，遭遇就在本图发生`);track=chooseMusic({region:regionAt(w.player).name,time:w.time},musicMemory);music(track)};
for(const button of document.querySelectorAll('.skills [data-action]'))button.addEventListener('click',()=>doAction(button.dataset.action));
$('#recoverButton').onclick=()=>{recover(w);fx.clear();motion.clear();keys.clear();consume();sync()};
$('#sparAccept').onclick=()=>{answerSpar(w,true);keys.clear();consume();sync()};$('#sparDecline').onclick=()=>{answerSpar(w,false);keys.clear();sync()};
$('#resumeButton').onclick=()=>pause(false);$('#closeWorkbench').onclick=closePanel;
$('#soundToggle').onclick=()=>{$('#soundToggle').textContent=toggle()?'声 ◐':'声 ○'};
$('#lightingToggle').textContent=lighting.label;$('#lightingToggle').onclick=()=>{$('#lightingToggle').textContent=lighting.cycle()};
for(const [id,options] of [['elementA',ELEMENTS],['elementB',ELEMENTS],['spellShape',SHAPES],['spellModifier',MODIFIERS]]){
 const select=$('#'+id);if(id==='elementB'){const o=document.createElement('option');o.value='';o.textContent='不融合';select.append(o)}
 for(const [value,item] of Object.entries(options)){const o=document.createElement('option');o.value=value;o.textContent=item.name;select.append(o)}select.onchange=updateRecipe;
}$('#elementB').value='frost';
$('#equipSpell').onclick=()=>{try{w.customSpell=compileSpell(recipe());w.player.spell=4;closePanel();notice('已装备自创术式 · Q 施放，5 重新选用')}catch(e){notice(e.message)}};
for(const r of RECIPES){const button=document.createElement('button');button.textContent=`${r.name} · 灵草 ${r.herbs} / 灵砂 ${r.ore} · ${r.desc}`;button.onclick=()=>{w.paused=false;craft(w,r.id);w.paused=true;consume();sync()};$('#craftControls').append(button)}
canvas.addEventListener('mousemove',e=>{const r=canvas.getBoundingClientRect();mouse={x:(e.clientX-r.left)*480/r.width,y:(e.clientY-r.top)*270/r.height}});
canvas.addEventListener('mousedown',e=>doAction(e.button===0?'slash':'guard'));canvas.addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('keydown',e=>{
 if(e.target?.closest?.('.skills')&&['Space','Enter'].includes(e.code))return;
 if(['INPUT','SELECT','BUTTON'].includes(e.target?.tagName)&&panel&&e.code!=='Escape')return;
 if(['Space','Tab','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
 if(!started||e.repeat)return;
 if(w.dialogue){if(e.code==='Escape')answerSpar(w,false);else if(e.code==='Enter')answerSpar(w,true);keys.clear();consume();return}
 if(e.code==='Escape'){if(panel)closePanel();else pause(!w.paused);return}
 if(e.code==='KeyV'){openPanel('spell');return}if(e.code==='KeyB'){openPanel('craft');return}
 if(w.paused||w.dead)return;keys.add(e.code);if(e.code==='Tab'){largeMap=!largeMap;return}
 if(/^Digit[1-5]$/.test(e.code)){w.player.spell=Number(e.code.slice(-1))-1;return}
 doAction(({KeyJ:'slash',KeyK:'guard',KeyQ:'cast',KeyE:'ultimate',KeyF:'flight',Space:'dash',KeyR:'interact',KeyH:'potion',KeyG:'spirit',KeyZ:'formation',KeyX:'puppet',KeyC:'cultivate'})[e.code]);
});
addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',()=>{if(started&&!panel&&!w.dead)pause(true);keys.clear()});
requestAnimationFrame(loop);
