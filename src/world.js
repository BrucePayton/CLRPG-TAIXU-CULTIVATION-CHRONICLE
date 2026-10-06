import {createSlash,stepSlash} from './combat.js';
import {compileSpell,spellProjectiles} from './spellcraft.js';

import {REGIONS,regionAt,sameMap,insideMap,MAP_EXITS} from './maps.js';
import {CAMP_BOUNDS,CAMP_POND,campSolidAt} from './camp-layout.js';
import {LODGE_ROOM,lodgeSolidAt} from './lodge.js';
export {REGIONS,regionAt} from './maps.js';
export const WORLD={width:2480,height:900,ground:.62};
export const ROCKS=[{x:530,y:180,r:26},{x:640,y:570,r:32},{x:785,y:280,r:24},{x:1150,y:590,r:30},{x:1250,y:240,r:25}];
export const SPELLS=[{id:'jade',name:'青珩飞剑',cost:26,cd:2,damage:14},{id:'frost',name:'凝霜诀',cost:20,cd:2.4,damage:12},{id:'flame',name:'离火诀',cost:30,cd:3,damage:24},{id:'thunder',name:'引雷诀',cost:34,cd:3.6,damage:32}];
export const RECIPES=[{id:'potion',name:'回元丹',herbs:2,ore:0,desc:'恢复 40 气血（H）'},{id:'spirit',name:'聚气丹',herbs:1,ore:1,desc:'恢复 55 灵力（G）'},{id:'puppet',name:'木灵傀儡',herbs:2,ore:2,desc:'解锁傀儡召唤（X），不消耗成品'}];
export const dist=(a,b)=>Math.hypot(a.x-b.x,(a.y-b.y)/WORLD.ground);
export const aim=(a,b)=>Math.atan2((b.y-a.y)/WORLD.ground,b.x-a.x);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function blocked(x,y,flying=false,mapId=regionAt({x,y}).id){
 if(mapId==='lodge')return !insideMap({x,y},LODGE_ROOM)||lodgeSolidAt(x,y,7);
 if(mapId==='camp')return !insideMap({x,y},CAMP_BOUNDS)||campSolidAt(x,y,7)||(!flying&&Math.hypot((x-CAMP_POND.x)/(CAMP_POND.rx+5),(y-CAMP_POND.y)/(CAMP_POND.ry+5))<1);
 if(x<20||x>WORLD.width-20||y<55||y>WORLD.height-20)return true;
 if(mapId==='arena'&&Math.hypot((x-1680)/200,(y-411)/74)>1)return true;
 if(!flying&&x>918&&x<984&&!((y>355&&y<425)||(y>695&&y<755)))return true;
 return ROCKS.some(r=>Math.hypot(x-r.x,(y-r.y)/.62)<r.r+9);
}
export function lineOfSight(a,b){
 if(!sameMap(a,b))return false;
 const length=Math.hypot(b.x-a.x,b.y-a.y),steps=Math.max(1,Math.ceil(length/8));
 for(let i=1;i<steps;i++){const t=i/steps,x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;if(regionAt(a).id==='camp'?campSolidAt(x,y):regionAt(a).id==='lodge'?lodgeSolidAt(x,y):ROCKS.some(r=>Math.hypot(x-r.x,(y-r.y)/.62)<r.r))return false}
 return true;
}
function move(o,a,speed,dt,flying=false){
 const dx=Math.cos(a)*speed*dt,dy=Math.sin(a)*speed*dt*.62;
 const map=regionAt(o);
 if(insideMap({x:o.x+dx,y:o.y},map)&&!blocked(o.x+dx,o.y,flying,map.id))o.x+=dx;
 if(insideMap({x:o.x,y:o.y+dy},map)&&!blocked(o.x,o.y+dy,flying,map.id))o.y+=dy;
}
function actor(id,kind,x,y){
 const hp={deer:45,boar:90,wolf:65,warden:480}[kind];
 return {id,kind,x,y,mapId:regionAt({x}).id,home:{x,y},hp,maxHp:hp,face:0,phase:1,posture:0,stun:0,cd:1,windup:0,state:'漫游',anger:0,alert:0,dead:false,step:0};
}
export function createWorld(){
 const player={x:205,y:405,safe:{x:205,y:405},hp:100,maxHp:100,qi:100,dao:0,face:0,step:0,altitude:0,flying:false,guard:false,guardHit:0,parry:0,inv:0,cool:0,qcd:0,dash:0,dashCd:0,slash:null,chain:0,chainTime:0,herbs:0,ore:0,potions:2,spirit:0,spell:0,puppetOwned:false,puppetCd:0,formationCd:0,harmony:0,power:1};
 player.mapId='camp';
 return {player,customSpell:compileSpell({elements:['jade','frost']}),time:0,transition:0,dialogue:null,paused:false,dead:false,events:[],shots:[],zones:[],swords:[],formations:[],puppet:null,meditation:0,quest:false,boon:false,
  actors:[actor('deer1','deer',485,370),actor('deer2','deer',610,730),actor('boar1','boar',650,215),actor('boar2','boar',740,650),actor('wolf1','wolf',790,450),actor('wolf2','wolf',1180,730),actor('warden','warden',1767,384)],
  nodes:[...[[350,340],[500,460],[550,650],[680,340],[825,735],[1060,415],[1120,640],[1350,680]].map(([x,y],i)=>({id:'herb'+i,kind:'herb',x,y,taken:false})),
   ...[[720,130],[1040,685],[1330,330]].map(([x,y],i)=>({id:'stone'+i,kind:'stone',x,y,taken:false})),
   ...[[350,620],[565,485],[830,250],[1110,330],[1190,640],[1370,520]].map(([x,y],i)=>({id:'ore'+i,kind:'ore',x,y,taken:false})),
   {id:'healer',kind:'healer',x:260,y:360},{id:'camp',kind:'camp',x:180,y:390},
   {id:'lodge-bed',kind:'bed',x:2098,y:151},{id:'lodge-workbench',kind:'workbench',x:2348,y:153}].map(n=>({...n,mapId:regionAt(n).id})),
  discovered:new Set(['听雨驿']),observed:new Set(),defeated:0};
}
function cue(w,kind,x,y,a=0){w.events.push({kind,x,y,a});if(w.events.length>100)w.events.shift()}
function tell(w,text){w.events.push({kind:'message',text})}
export function threats(w){return w.actors.some(e=>sameMap(e,w.player)&&!e.dead&&['追击','蓄势'].includes(e.state)&&dist(e,w.player)<240)}
export function transferMap(w,exit){
 if(w.paused||w.dead||w.dialogue||w.transition>0||!MAP_EXITS.includes(exit)||!sameMap(exit,w.player)||dist(exit,w.player)>55)return false;
 Object.assign(w.player,exit.spawn,{safe:{...exit.spawn},dash:0,slash:null,moving:false});
 if(exit.destinationId==='lodge')Object.assign(w.player,{flying:false,altitude:0});
 w.shots=[];w.swords=[];w.zones=[];w.formations=[];w.meditation=0;
 if(w.puppet)Object.assign(w.puppet,{x:w.player.x-15,y:w.player.y,mapId:w.player.mapId});
 for(const e of w.actors){e.anger=0;e.alert=0;e.windup=0;e.sparring=false;if(!e.dead)e.state='归巢'}
 w.transition=.55;w.discovered.add(exit.to);cue(w,'mapChange',w.player.x,w.player.y);tell(w,`进入 ${exit.to} · R 使用路标返回`);return true;
}
export function nearby(w){
 return [...MAP_EXITS,...w.nodes.filter(n=>!n.taken),...w.actors.filter(e=>!e.dead)]
  .filter(n=>dist(n,w.player)<55&&lineOfSight(n,w.player)).sort((a,b)=>dist(a,w.player)-dist(b,w.player))[0];
}
export function answerSpar(w,accept){
 if(!w.dialogue||w.paused||w.dead)return false;
 const e=w.actors.find(e=>e.id===w.dialogue.actorId);w.dialogue=null;
 if(!accept||!e||!sameMap(e,w.player))return false;
 Object.assign(e,{hp:e.maxHp,phase:1,posture:0,stun:0,windup:0,cd:1.2,anger:60,sparring:true,state:'追击'});
 w.shots=[];w.swords=[];w.zones=[];w.player.inv=1;cue(w,'sparStart',e.x,e.y);tell(w,'点到即止 · 离开落星台即可结束切磋');return true;
}
function finishSpar(w,won){
 const e=w.actors.find(e=>e.kind==='warden');if(!e?.sparring)return;
 Object.assign(e,{hp:Math.max(1,e.hp),sparring:false,anger:0,windup:0,state:'论道',stun:0});
 w.player.slash=null;w.player.inv=2;w.shots=[];w.swords=[];w.zones=[];w.formations=[];
 if(won){e.defeated=true;if(!w.wardenReward){w.wardenReward=true;w.player.potions++;tell(w,'镇剑使：剑心已明。赠回元丹一枚；日后仍可来此论剑。')}else tell(w,'切磋结束 · 招式已有进境，本次不重复发放奖励')}
 else tell(w,'镇剑使收招：胜负之外，尚有所得。气血保留 1，可离台休整。');
 cue(w,'sparEnd',e.x,e.y);
}
export function interact(w){
 if(w.paused||w.dead||w.transition>0||w.dialogue)return;const p=w.player,n=nearby(w);if(!n){tell(w,'靠近灵草、石碑、营火或人物，按 R 交互');return}
 if(n.kind==='exit'){transferMap(w,n);return}
 if(n.kind==='bed'){p.hp=p.maxHp;p.qi=100;tell(w,'药庐休整 · 气血与灵力恢复');return}
 if(n.kind==='workbench'){tell(w,'药庐丹炉 · 按 B 打开炼制，配方消耗行囊中的材料');return}
 if(n.kind==='herb'){n.taken=true;p.herbs++;tell(w,`采得灵草 · 行囊 ${p.herbs} 株`);return}
 if(n.kind==='ore'){n.taken=true;p.ore+=2;tell(w,'采得灵砂 ×2 · 可用于炼丹与傀儡');return}
 if(n.kind==='stone'){
  n.taken=true;const count=w.nodes.filter(n=>n.kind==='stone'&&n.taken).length;
  tell(w,`记录残星碑文 ${count}/3`);
  if(count===3&&!w.boon){w.boon=true;p.maxHp+=20;p.hp=Math.min(p.maxHp,p.hp+20);tell(w,'三碑共鸣 · 气血上限 +20（本次世界永久）')}return;
 }
 if(n.kind==='camp'||n.kind==='healer'){
  if(threats(w)){tell(w,'附近仍有敌意，无法休整或配药');return}
  if(n.kind==='camp'){p.hp=p.maxHp;p.qi=100;tell(w,'营火休整 · 气血与灵力恢复');return}
  if(!w.quest&&p.herbs>=3){p.herbs-=3;w.quest=true;p.power+=.2;p.potions+=2;tell(w,'药师：谢你采药。赠丹药 ×2，剑诀伤害 +20%');return}
  if(w.quest&&p.herbs>=2){p.herbs-=2;p.potions++;tell(w,'配成回元丹 ×1（消耗灵草 ×2）');return}
  tell(w,w.quest?'药师：按 B 配药，按 C 与我合修调息。我愿助你梳理灵息。':'药师：请带回三株灵草。不必猎杀山中生灵。');return;
 }
 if(n.kind==='warden'){
  if(n.state==='追击'||n.windup>0){tell(w,'镇剑使正在交锋，可离开其驻地脱身');return}
  w.dialogue={actorId:n.id,text:n.defeated?'赤霄镇剑使：上次交手，已有所得。可愿再练？重赛不会重复赠送心得。':'赤霄镇剑使：玉剑有锋，心当有定。可愿在此切磋？点到即止，离台便罢手。'};return;
 }
 w.observed.add(n.kind);
 tell(w,{deer:'苔角鹿：胆小食草，靠近便逃；无需追杀。',boar:'岩背豕：守护巢地，先示警，持续侵入才攻击。',wolf:'暮影狼：会追踪近处目标，重伤撤退；可借岩石挡住视线。'}[n.kind]);
}
export function action(w,key,target){
 if(w.paused||w.dead||w.dialogue||w.transition>0)return;const p=w.player;
 if(w.meditation>0&&key!=='cultivate'){w.meditation=0;tell(w,'合修中断 · 未获得增益')}
 if(key==='interact'){interact(w);return}
 if(key==='potion'){if(p.potions&&p.hp<p.maxHp){p.potions--;p.hp=Math.min(p.maxHp,p.hp+40);cue(w,'cast',p.x,p.y-20)}return}
 if(key==='spirit'){if(p.spirit&&p.qi<100){p.spirit--;p.qi=Math.min(100,p.qi+55);cue(w,'cast',p.x,p.y-20)}return}
 if(key==='cultivate'){
  const npc=w.nodes.find(n=>n.kind==='healer');
  if(!w.quest||dist(p,npc)>65||threats(w)||p.flying){tell(w,'完成药师委托后，在其身旁落地合修（需安全环境）');return}
  if(w.meditation>0)return;w.meditation=3;tell(w,'双方自愿合修 · 静息三秒，移动或施法会中断');return;
 }
 if(key==='formation'){
  const status=arrayStatus(w,'formation');if(!status.ready){tell(w,status.reason);return}
  p.herbs--;p.qi-=20;p.formationCd=12;w.formations.push({x:p.x,y:p.y,mapId:p.mapId,life:8,tick:0});cue(w,'formation',p.x,p.y);tell(w,'木灵阵已布下 · 持续 8 秒，减速并伤害阵内交战敌人');return;
 }
 if(key==='puppet'){
  if(!p.puppetOwned||p.qi<18||p.puppetCd>0){tell(w,'先在营地制作木灵傀儡；召唤需灵力 18，冷却 25 秒');return}
  p.qi-=18;p.puppetCd=25;w.puppet={x:p.x-20,y:p.y,life:20,cd:0};tell(w,'木灵傀儡 · 护卫二十秒，只攻击正在交战的对手');return;
 }
 if(w.meditation>0){w.meditation=0;tell(w,'合修中断 · 未获得增益')}
 if(key==='flight'){
  if(p.mapId==='lodge'){tell(w,'药庐室内不可御剑，出门后再起飞');return}
  if(!p.flying&&p.qi<15){tell(w,'御剑至少需要 15 灵力');return}
  if(p.flying&&blocked(p.x,p.y,false)){tell(w,'下方是深水，先飞至岸边或桥面再落地');return}
  p.flying=!p.flying;cue(w,'cast',p.x,p.y);return;
 }
 if(key==='guard'){
  if(p.guard){p.guard=false;p.parry=0;return}
  if(p.qi<12){tell(w,'护身需要 12 灵力');return}
  p.qi-=12;p.guard=true;p.parry=.19;p.guardHit=.3;p.slash=null;cue(w,'cast',p.x,p.y-20);return;
 }
 const a=target?aim(p,target):p.face;
 if(key==='slash'&&p.cool<=0&&p.dash<=0){p.chain=p.chainTime>0?(p.chain+1)%3:0;p.chainTime=1.2;p.slash={...createSlash(p.chain,a),hits:new Set()};p.cool=p.slash.startup+p.slash.active+p.slash.recovery;p.face=a;return}
 if(key==='dash'&&p.qi>=14&&p.dashCd<=0){p.qi-=14;p.dash=.19;p.dashCd=.65;p.inv=.24;p.dashA=a;p.slash=null;cue(w,'dash',p.x,p.y);return}
 if(key==='cast'&&p.qcd<=0){const spell=p.spell===4?w.customSpell:SPELLS[p.spell];if(p.qi<spell.cost){tell(w,'灵力不足');return}p.qi-=spell.cost;p.qcd=spell.cd;
  if(p.spell===4){w.shots.push(...spellProjectiles(spell,p,a));cue(w,'cast',p.x,p.y-18);return}
  for(const offset of spell.id==='jade'?[-.13,0,.13]:[0])w.shots.push({x:p.x,y:p.y,a:a+offset,v:spell.id==='thunder'?350:230,life:1.7,friendly:true,spell:spell.id,damage:spell.damage,trail:[]});cue(w,'cast',p.x,p.y-18);return}
 if(key==='ultimate'){
  const status=arrayStatus(w,'ultimate');if(!status.ready){tell(w,status.reason);return}
  const target=status.target;
  p.dao=0;p.inv=1.5;target.stun=1.1;cue(w,'formation',target.x,target.y);
  tell(w,'青珩剑阵 · 万剑归宗');
  for(let i=0;i<18;i++){const a=i*Math.PI/9;w.swords.push({x:target.x+Math.cos(a)*100,y:target.y+Math.sin(a)*62,a,target:target.id,delay:.5+i*.045,life:2,trail:[]})}
 }
}
export function arrayStatus(w,key){
 const p=w.player;
 if(key==='formation'){
  if(p.formationCd>0)return {ready:false,reason:`布阵冷却 · 剩余 ${p.formationCd.toFixed(1)} 秒`};
  if(p.herbs<1)return {ready:false,reason:`布阵缺少灵草 · 当前 ${p.herbs}/1，靠近灵草按 R 采集`};
  if(p.qi<20)return {ready:false,reason:`布阵灵力不足 · 当前 ${Math.floor(p.qi)}/20`};
  return {ready:true,reason:'布阵可用 · 灵草 1 / 灵力 20 · 持续 8 秒'};
 }
 if(p.dao<100)return {ready:false,reason:`剑阵道意不足 · ${Math.floor(p.dao)}/100，命中敌人或成功招架积累`};
 const target=w.actors.filter(e=>!e.dead&&e.kind!=='deer'&&(e.kind!=='warden'||e.sparring)&&sameMap(p,e)&&dist(e,p)<250&&lineOfSight(p,e)).sort((a,b)=>dist(a,p)-dist(b,p))[0];
 return target?{ready:true,reason:'剑阵可用 · 消耗 100 道意',target}:{ready:false,reason:'剑阵范围内没有可锁定的对手（镇剑使需先同意切磋）'};
}
export function craft(w,id){
 if(w.paused||w.dead)return false;const p=w.player,r=RECIPES.find(r=>r.id===id);
 if(!r||!w.nodes.some(n=>['healer','camp','workbench'].includes(n.kind)&&sameMap(n,p)&&dist(n,p)<70)||threats(w)||p.flying){tell(w,'需在安全营火、药师或室内丹炉旁落地制作');return false}
 if(p.herbs<r.herbs||p.ore<r.ore||(id==='puppet'&&p.puppetOwned)){tell(w,'材料不足，或已拥有傀儡');return false}
 p.herbs-=r.herbs;p.ore-=r.ore;if(id==='puppet')p.puppetOwned=true;else if(id==='potion')p.potions++;else p.spirit++;
 tell(w,`制作完成 · ${r.name}`);return true;
}
export function hitEnemy(w,e,n,posture=0){
 if(e.dead||!sameMap(e,w.player))return;const p=w.player;
 if(e.kind==='warden'&&!e.sparring)return;
 e.hp=Math.max(0,e.hp-n*p.power*(e.stun>0?1.5:1));e.anger=12;e.posture+=posture;
 p.dao=Math.min(100,p.dao+6);p.qi=Math.min(100,p.qi+3);cue(w,'impact',e.x,e.y-20,aim(p,e));
 if(e.posture>=100){e.posture=0;e.stun=2.2;e.windup=0}
 if(!e.hp){if(e.kind==='warden'){finishSpar(w,true);return}e.dead=true;e.windup=0;w.defeated++;cue(w,'bossImpact',e.x,e.y-15);tell(w,'遭遇结束 · 探索继续');}
 else if(e.kind==='warden'&&e.hp<e.maxHp/2&&e.phase===1){e.phase=2;cue(w,'bossPhase',e.x,e.y-30)}
}
function hurt(w,n,e){
 const p=w.player;if(p.inv>0||w.dead)return;
 if(p.parry>0){p.parry=0;p.dao=Math.min(100,p.dao+22);if(e){e.stun=.75;e.windup=0}cue(w,'parry',p.x,p.y-22-p.altitude);return}
 if(p.guard){if(p.qi>=4){p.qi-=4;n*=.25;p.guardHit=.3}else{p.guard=false;tell(w,'灵力不足 · 护身消散')}}
 p.hp=Math.max(0,p.hp-n);p.inv=.65;p.slash=null;cue(w,'bossImpact',p.x,p.y-20);
 if(!p.hp){if(w.actors.some(e=>e.kind==='warden'&&e.sparring&&sameMap(e,p))){p.hp=1;finishSpar(w,false);return}w.dead=true;tell(w,'身受重伤 · 返回营火可继续本次探索，世界不会重置')}
}
export function recover(w){
 const p=w.player;Object.assign(p,{x:205,y:405,mapId:'camp',safe:{x:205,y:405,mapId:'camp'},hp:p.maxHp,qi:100,inv:2,flying:false,altitude:0,slash:null,dash:0,guard:false,parry:0});
 w.dead=false;w.transition=0;w.shots=[];w.zones=[];w.swords=[];w.formations=[];w.puppet=null;w.meditation=0;
 for(const e of w.actors){e.anger=0;e.alert=0;e.windup=0;e.state='归巢'}
 tell(w,'已返回营火 · 采集、碑文和对手状态均保留');
}
function creature(w,e,dt){
 if(e.dead||!sameMap(e,w.player))return;
 if(e.kind==='warden'&&!e.sparring){e.state=e.defeated?'论道':'候客';return}
 const p=w.player,d=dist(e,p),home=dist(e,e.home),visible=d<220&&lineOfSight(e,p),safe=p.mapId==='camp';
 e.cd=Math.max(0,e.cd-dt);e.stun=Math.max(0,e.stun-dt);e.slow=Math.max(0,(e.slow||0)-dt);e.anger=Math.max(0,e.anger-dt);e.step+=dt*3;
 if(e.sparring)e.anger=60;
 if(e.stun>0){e.state='失衡';return}
 if(e.windup>0){
  e.state='蓄势';e.windup-=dt;
  if(e.windup<=0){
   if(e.kind==='warden'){
    cue(w,'bossCast',e.x+23,e.y-66);
    if(e.attackKind==='melee'){cue(w,'bossSlash',e.x,e.y,e.aim);if(d<74&&lineOfSight(e,p)&&Math.abs(Math.atan2(Math.sin(aim(e,p)-e.aim),Math.cos(aim(e,p)-e.aim)))<1.1)hurt(w,20,e)}
    else for(let i=-1;i<=1;i++)w.shots.push({x:e.x,y:e.y,a:e.aim+i*.24,v:110,life:3,friendly:false,owner:e.id,trail:[]});
    if(e.phase===2&&e.sparring)for(let i=-1;i<=1;i++)w.zones.push({x:p.x+i*33,y:p.y,life:1.15,hit:false,owner:e.id});
   }else{cue(w,'bossCast',e.x,e.y-15);if(d<48&&lineOfSight(e,p)&&Math.abs(Math.atan2(Math.sin(aim(e,p)-e.aim),Math.cos(aim(e,p)-e.aim)))<1.1)hurt(w,e.kind==='boar'?18:12,e)}
  }return;
 }
 if(e.kind==='deer'||(e.kind==='wolf'&&e.hp<e.maxHp*.25)){
  if(visible&&d<135){e.state='逃离';move(e,aim(p,e),e.kind==='deer'?92:95,dt);return}
 }else if(!safe&&home<220){
  if(e.kind==='boar'&&dist(p,e.home)<120&&visible){e.alert+=dt;e.state='示警';if(e.alert>1.1)e.anger=3}
  else e.alert=Math.max(0,e.alert-dt);
  if(e.kind==='wolf'&&d<150&&visible)e.anger=4;
  if(e.anger>0&&visible){
   e.face=aim(e,p);e.state='追击';
   if(d<(e.kind==='warden'?190:40)&&e.cd<=0){e.aim=e.face;e.attackKind=e.kind==='warden'&&d<80?'melee':'ranged';e.windup=e.kind==='warden'?(e.attackKind==='melee'?.65:.85):e.kind==='boar'?.7:.5;e.cd=e.kind==='warden'?2.3:1.7;e.state='蓄势'}
   else if(d>(e.kind==='warden'?110:32))move(e,e.face,(e.kind==='wolf'?70:45)*(e.slow>0?.45:1),dt);
   return;
  }
 }
 if(home>70||safe&&e.anger>0){e.state='归巢';e.anger=0;e.face=aim(e,e.home);move(e,e.face,48,dt);return}
 if(e.state==='示警'&&e.alert>0)return;
 e.state='漫游';const waypoint={x:e.home.x+Math.cos(w.time*.12+e.home.x)*35,y:e.home.y+Math.sin(w.time*.12+e.home.x)*20};
 e.face=aim(e,waypoint);if(dist(e,waypoint)>8)move(e,e.face,12,dt);
}
export function stepWorld(w,dt,input={}){
 if(w.paused||w.dead||w.dialogue)return;w.time+=dt;const p=w.player;
 if(w.transition>0){w.transition=Math.max(0,w.transition-dt);return}
 for(const key of ['cool','qcd','parry','guardHit','inv','dash','dashCd','chainTime','formationCd','puppetCd','harmony'])p[key]=Math.max(0,p[key]-dt);
 let dx=input.x||0,dy=input.y||0;p.moving=!!(dx||dy);let a=Math.atan2(dy,dx);
 if(input.target&&!p.slash)p.face=aim(p,input.target);
 if(p.dash>0){a=p.dashA;p.moving=true}
 if(p.moving){const speed=p.dash>0?300:(p.flying?140:86)*(p.slash?.35:1),before={x:p.x,y:p.y};move(p,a,speed,dt,p.flying);const travelled=dist(before,p);p.moving=travelled>1e-5;p.step+=travelled*.09}
 p.altitude+=((p.flying?20+Math.sin(w.time*4)*1.5:0)-p.altitude)*Math.min(1,dt*7);
 if(!blocked(p.x,p.y,false))p.safe={x:p.x,y:p.y,mapId:p.mapId};
 p.qi=clamp(p.qi+dt*(p.flying?-3:7+(p.harmony>0?2:0)),0,100);
 if(w.meditation>0){
  if(p.moving||threats(w)||p.flying){w.meditation=0;tell(w,'合修中断 · 未获得增益')}
  else{w.meditation=Math.max(0,w.meditation-dt);if(w.meditation===0){p.harmony=60;p.qi=100;p.hp=Math.min(p.maxHp,p.hp+20);tell(w,'合修完成 · 灵力充盈，气血 +20，地面回灵增强 60 秒')}}
 }
 if(p.flying&&p.qi===0){p.flying=false;if(blocked(p.x,p.y,false)){p.x=p.safe.x;p.y=p.safe.y}tell(w,'灵力耗尽 · 回到最近可落脚处')}
 w.discovered.add(regionAt(p).name);
 if(p.slash){const s=p.slash;let done=false,started=false;
  for(const e of w.actors.filter(e=>!e.dead&&sameMap(e,p))){
   const probe={...s,hit:s.hits.has(e.id)};const r=stepSlash(probe,dt,p,e);done=r.done;started||=r.started;
   if(r.hit&&lineOfSight(p,e)){s.hits.add(e.id);hitEnemy(w,e,s.damage,s.posture)}
  }
  if(started)cue(w,'slash',p.x,p.y);s.started||=started;s.age+=dt;
  if(done||s.age>=s.startup+s.active+s.recovery)p.slash=null;
 }
 for(const e of w.actors)creature(w,e,dt);
 for(const s of w.shots){
  s.mapId??=p.mapId;const old={x:s.x,y:s.y,mapId:s.mapId};s.trail.push(old);if(s.trail.length>9)s.trail.shift();s.x+=Math.cos(s.a)*s.v*dt;s.y+=Math.sin(s.a)*s.v*dt*.62;s.life-=dt;
  if(!sameMap(s,p)||!insideMap(s,regionAt(p))||!lineOfSight(old,s)){s.life=0;continue}
  const candidates=s.friendly?w.actors.filter(e=>!e.dead&&sameMap(e,p)):[p];
  for(const target of candidates)if(s.life>0&&dist(s,target)<16&&!s.hits?.has(target.id)){
   if(s.recipe){
    s.hits.add(target.id);s.remaining--;if(s.remaining<=0)s.life=0;hitEnemy(w,target,s.damage,8);
    target.slow=Math.max(target.slow||0,s.recipe.slow);target.stun=Math.max(target.stun,s.recipe.stun);
    cue(w,s.recipe.elements.includes('flame')?'bossFire':'parry',target.x,target.y-18);
    if(s.recipe.splash>0)for(const other of w.actors)if(other!==target&&!other.dead&&dist(other,target)<s.recipe.splash&&lineOfSight(other,target))hitEnemy(w,other,s.damage*.4,2);
   }else{s.life=0;if(s.friendly){hitEnemy(w,target,s.damage||14,8);if(s.spell==='frost')target.slow=3;if(s.spell==='thunder')target.stun=.65;if(s.spell==='flame'){cue(w,'bossFire',target.x,target.y);for(const other of w.actors)if(other!==target&&!other.dead&&dist(other,target)<42&&lineOfSight(other,target))hitEnemy(w,other,12,4)}}else hurt(w,13,w.actors.find(e=>e.id===s.owner));}break;
  }
 }
 w.shots=w.shots.filter(s=>s.life>0);
 for(const z of w.zones){z.life-=dt;if(z.life<.3&&!z.hit){z.hit=true;cue(w,'bossFire',z.x,z.y);if(p.altitude<12&&dist(p,z)<25)hurt(w,19,w.actors.find(e=>e.id===z.owner))}}
 w.zones=w.zones.filter(z=>z.life>0);
 const lastSword=w.swords[0];
 for(const s of w.swords){
  const target=w.actors.find(e=>e.id===s.target);if(!target||target.dead){s.life=0;continue}
  s.delay-=dt;if(s.delay>0)continue;s.life-=dt;s.trail.push({x:s.x,y:s.y});if(s.trail.length>12)s.trail.shift();s.a=aim(s,target);const old={x:s.x,y:s.y};s.x+=Math.cos(s.a)*300*dt;s.y+=Math.sin(s.a)*300*dt*.62;
  if(!lineOfSight(old,s)){s.life=0;continue}if(dist(s,target)<18){hitEnemy(w,target,6,2);s.life=0}
 }
 w.swords=w.swords.filter(s=>s.life>0);
 if(lastSword&&!w.swords.length){const target=w.actors.find(e=>e.id===lastSword.target);if(target)cue(w,'finale',target.x,target.y)}
 for(const f of w.formations){f.life-=dt;f.tick-=dt;if(f.tick<=0){f.tick=1;for(const e of w.actors)if(!e.dead&&e.kind!=='deer'&&e.anger>0&&dist(f,e)<80&&lineOfSight(f,e)){e.slow=1.3;hitEnemy(w,e,8,4)}}}
 w.formations=w.formations.filter(f=>f.life>0);
 if(w.puppet){const ally=w.puppet;ally.life-=dt;ally.cd-=dt;if(dist(ally,p)>35)move(ally,aim(ally,p),115,dt,true);
  const target=w.actors.find(e=>!e.dead&&e.anger>0&&e.kind!=='deer'&&dist(e,ally)<180&&lineOfSight(ally,e));
  if(target&&ally.cd<=0){ally.cd=1;w.shots.push({x:ally.x,y:ally.y,a:aim(ally,target),v:230,life:1,friendly:true,damage:9,spell:'jade',trail:[]})}
  if(ally.life<=0)w.puppet=null;
 }
}
