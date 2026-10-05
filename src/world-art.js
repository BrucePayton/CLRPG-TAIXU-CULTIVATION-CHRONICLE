import {WORLD,REGIONS,ROCKS} from './world.js';
import {poly,ring,hero,enemy,scene,foreground} from './art.js';
import {LEGACY_ARENA,regionAt,sameMap,MAP_EXITS} from './maps.js';
export function arenaForeground(c){c.save();c.translate(LEGACY_ARENA.x,LEGACY_ARENA.y);foreground(c);c.restore()}
import {drawWorldAsset,terrainTexture,WORLD_ART} from './world-assets.js';
import {CAMP_LODGE,CAMP_TREES} from './camp-layout.js';
import {campTerrain,campDetails,drawCampProp} from './camp-art.js';
import {healerFrame} from './camp-assets.js';
export const DECORATIONS=[CAMP_LODGE,...CAMP_TREES,...Array.from({length:24},(_,i)=>({kind:'pine',x:430+(i*137)%460,y:80+(i*173)%750})).filter(o=>Math.abs(o.y-400)>=45&&Math.abs(o.y-720)>=35)];
export function drawDecoration(c,o,player){
 if(o.mapId==='camp'){drawCampProp(c,o,player);return}
 if(drawWorldAsset(c,o.kind==='lodge'?'lodge-v2':'pine',o.x,o.y))return;
 if(o.kind==='lodge'){c.fillStyle='#665442';c.fillRect(120,300,105,65);poly(c,[[108,304],[172,267],[238,304]],'#376964');c.fillStyle='#132c31';c.fillRect(155,320,24,45)}
 else{c.fillStyle='#283d35';c.fillRect(o.x-2,o.y-18,5,20);poly(c,[[o.x-18,o.y-15],[o.x,o.y-65],[o.x+18,o.y-15]],'#193e38')}
}
export function cameraFor(p){const r=regionAt(p);return {map:r,x:Math.round(r.w<=480?r.x+(r.w-480)/2:Math.max(r.x,Math.min(r.x+r.w-480,p.x-240))),y:Math.round(Math.max(r.y,Math.min(r.y+r.h-270,p.y-(r.id==='camp'?225:150))))}}
export function terrain(c,cam,time){
 if(cam.map.id==='arena'){c.save();c.translate(LEGACY_ARENA.x,LEGACY_ARENA.y);scene(c,time);c.restore();return}
 if(cam.map.id==='camp'){campTerrain(c,cam);campDetails(c,time);return}
 c.fillStyle='#29463e';c.fillRect(cam.x,cam.y,480,270);
 for(const r of REGIONS){c.fillStyle=r.color;c.fillRect(r.x,r.y,r.w,r.h)}
 terrainTexture(c,'grass',cam.x,cam.y,480,270,.32);
 // Stable seeded tile details: map decoration never changes on return.
 for(let y=Math.floor(cam.y/24)*24;y<cam.y+290;y+=24)for(let x=Math.floor(cam.x/24)*24;x<cam.x+500;x+=24){
  const seed=(x*17+y*31)%97;c.fillStyle=seed%3?'#91a27a16':'#142c3329';c.fillRect(x+seed%17,y+seed%11,5,2);
 }
 c.strokeStyle='#8c85624a';c.lineWidth=34;c.beginPath();c.moveTo(150,410);c.lineTo(420,410);c.lineTo(760,390);c.lineTo(1240,390);c.stroke();
 c.strokeStyle='#736e564a';c.lineWidth=24;c.beginPath();c.moveTo(760,390);c.lineTo(820,720);c.lineTo(1220,720);c.stroke();
 c.fillStyle='#254d61';c.fillRect(918,0,66,900);c.fillStyle='#79b6b43b';
 for(let y=Math.floor(cam.y/18)*18;y<cam.y+280;y+=18)c.fillRect(925+Math.sin(y+time)*5,y,45,1);
 for(const [y,h] of [[355,70],[695,60]]){c.fillStyle='#83785c';c.fillRect(910,y,82,h);for(let yy=y;yy<y+h;yy+=7){c.fillStyle='#b4a278';c.fillRect(912,yy,78,2)}}
 c.fillStyle='#686556';c.fillRect(1120,310,260,205);for(let y=310;y<515;y+=16)for(let x=1120;x<1380;x+=32){c.strokeStyle='#343d3f';c.strokeRect(x,y,32,16)}
 const tx=Math.max(1120,cam.x),ty=Math.max(310,cam.y);if(tx<Math.min(1380,cam.x+480)&&ty<Math.min(515,cam.y+270))terrainTexture(c,'stone',tx,ty,Math.min(1380,cam.x+480)-tx,Math.min(515,cam.y+270)-ty,.8);
 ring(c,1260,430,35,'#b4a977',.5);
 c.fillStyle='#d5c794';c.font='9px serif';c.fillText('落星山门',1235,460);
 for(const r of ROCKS){poly(c,[[r.x-r.r,r.y],[r.x-r.r*.7,r.y-24],[r.x+5,r.y-35],[r.x+r.r,r.y-15],[r.x+r.r,r.y+5]],'#637878');poly(c,[[r.x-r.r,r.y],[r.x+5,r.y-20],[r.x+r.r,r.y+5]],'#354e52')}
 // Safe roadside shelter.
 c.fillStyle='#adc1a0';c.font='9px serif';for(const r of REGIONS)c.fillText(r.name,r.x+35,100);
}
export function drawNode(c,n,time,player){
 if(n.taken)return;
 if(n.kind==='exit'){
  ring(c,n.x,n.y,12,'#e5cf91',.75);c.fillStyle='#4d5448';c.fillRect(n.x-2,n.y-21,4,21);c.fillStyle='#c5ac70';c.fillRect(n.x-11,n.y-24,22,9);
  c.fillStyle='#f3e7ba';c.font='8px sans-serif';c.textAlign='center';c.fillText('→ '+n.to,n.x,n.y-30);c.textAlign='start';return;
 }
 if(n.kind==='healer'){
  c.fillStyle='#132e3255';c.beginPath();c.ellipse(n.x,n.y,11,4,0,0,Math.PI*2);c.fill();
  if(drawWorldAsset(c,'camp-healer',n.x,n.y,{frame:healerFrame(n,player,time)})){c.fillStyle='#dbcda5';c.font='8px serif';c.textAlign='center';c.fillText('药师 · 闻溪',n.x,n.y-59);c.textAlign='start';return}
 }
 if(n.kind==='stone'&&drawWorldAsset(c,'shrine',n.x,n.y))return;
 if(n.kind==='herb'){c.fillStyle='#abc87c';c.fillRect(n.x,n.y-10,2,10);poly(c,[[n.x,n.y-4],[n.x-7,n.y-10],[n.x-5,n.y-2]],'#82b980');poly(c,[[n.x+1,n.y-6],[n.x+8,n.y-13],[n.x+6,n.y-3]],'#c4da8c')}
 if(n.kind==='ore'){poly(c,[[n.x-9,n.y],[n.x-5,n.y-10],[n.x+3,n.y-14],[n.x+10,n.y]],'#778393');c.fillStyle='#d2b783';c.fillRect(n.x,n.y-8,4,3)}
 if(n.kind==='stone'){c.fillStyle='#35464e';c.fillRect(n.x-8,n.y-28,16,28);c.fillStyle='#d1c396';for(let i=0;i<4;i++)c.fillRect(n.x-3,n.y-23+i*5,5,2);ring(c,n.x,n.y,15,'#b9c9aa',.3)}
 if(n.kind==='camp'){ring(c,n.x,n.y,16,'#9a9279');poly(c,[[n.x-7,n.y],[n.x-3,n.y-17],[n.x+2,n.y-8],[n.x+4,n.y-22],[n.x+8,n.y]],'#ef9f65');c.fillStyle='#ffe3a3';c.fillRect(n.x-2,n.y-10,4,10)}
 if(n.kind==='healer'){c.fillStyle='#bba27b';c.fillRect(n.x-5,n.y-30,10,9);poly(c,[[n.x-6,n.y-23],[n.x+6,n.y-23],[n.x+10,n.y],[n.x-10,n.y]],'#879aab');c.fillStyle='#25363e';c.fillRect(n.x-6,n.y-34,12,5)}
}
export function drawCreature(c,e,time){
 if(e.dead){c.fillStyle='#272e2c';c.fillRect(e.x-6,e.y-2,12,3);return}
 if(e.kind==='warden'){enemy(c,e,time);return}
 const rendered=drawWorldAsset(c,e.kind,e.x,e.y,{face:e.face});
 if(!rendered){
 c.save();c.translate(Math.round(e.x),Math.round(e.y));if(Math.cos(e.face)<0)c.scale(-1,1);
 c.fillStyle='#12292d60';c.beginPath();c.ellipse(0,0,15,5,0,0,7);c.fill();
 const color=e.kind==='deer'?'#abac80':e.kind==='boar'?'#948378':'#64798a';
 c.fillStyle=color;c.fillRect(-12,-17,23,12);c.fillRect(7,-24,10,14);
 for(const x of [-9,6]){c.fillStyle='#344343';c.fillRect(x,-7,4,8+Math.sin(e.step+x)*2)}
 c.fillStyle='#f6da9d';c.fillRect(13,-21,2,2);
 if(e.kind==='deer'){c.strokeStyle='#c5c3a0';c.beginPath();c.moveTo(11,-23);c.lineTo(8,-35);c.lineTo(3,-38);c.moveTo(8,-32);c.lineTo(14,-37);c.stroke()}
 else if(e.kind==='boar'){poly(c,[[-12,-16],[-7,-27],[0,-20],[5,-29],[10,-16]],'#5c5d61');c.fillStyle='#eee0b1';c.fillRect(16,-13,5,2)}
 else{poly(c,[[8,-22],[8,-33],[14,-25],[17,-31],[18,-20]],color);poly(c,[[-10,-12],[-23,-22],[-18,-8]],color)}
 c.restore();
 }
 const labelY=e.y-(WORLD_ART[e.kind]?.height||39)-5;
 if(e.hp<e.maxHp||e.state!=='漫游'){c.fillStyle='#142d32';c.fillRect(e.x-15,labelY,30,3);c.fillStyle=e.slow>0?'#8ec9ee':'#d69472';c.fillRect(e.x-15,labelY,30*e.hp/e.maxHp,3)}
 c.font='7px sans-serif';c.fillStyle=e.state==='示警'?'#ffd38b':'#c8d5c0';c.fillText(e.state,e.x-10,labelY-4);
}
export function minimap(c,w,large=false){
 const r=regionAt(w.player);c.save();c.fillStyle='#10232bed';c.strokeStyle='#897d57';
 if(large){
  c.fillRect(36,56,408,165);c.strokeRect(36,56,408,165);c.font='11px serif';c.fillStyle='#edddb1';c.fillText('山河路引 · 靠近现场路标按 R 换图',54,78);
  REGIONS.forEach((m,i)=>{const x=60+i*77,y=127;if(i<4){c.strokeStyle='#8b9173';c.beginPath();c.moveTo(x+25,y);c.lineTo(x+77,y);c.stroke()}
   c.fillStyle=m.id===r.id?'#95d6bd':'#4d6460';c.fillRect(x-8,y-8,28,16);c.font='9px serif';c.fillStyle=w.discovered.has(m.name)?'#edddb1':'#82968d';c.fillText(m.name,x-12,y+31);
  });c.fillStyle='#b6c5b7';c.font='9px sans-serif';c.fillText('落星台是独立地点；遇敌不切场。路线图不可点击传送。',54,193);
 }else{
  const x=383,y=8,width=88,height=58,sx=width/r.w,sy=height/r.h;
  c.fillRect(x-3,y-3,width+6,height+6);c.fillStyle=r.color;c.fillRect(x,y,width,height);
  const dot=(o,color,size=2)=>{c.fillStyle=color;c.fillRect(x+(o.x-r.x)*sx-size/2,y+(o.y-r.y)*sy-size/2,size,size)};
  for(const n of w.nodes.filter(n=>!n.taken&&sameMap(n,w.player)))dot(n,n.kind==='herb'?'#a9d579':'#d7c49d');
  for(const e of w.actors.filter(e=>!e.dead&&sameMap(e,w.player)))dot(e,e.kind==='deer'?'#d7d9af':'#df967b');
  for(const e of MAP_EXITS.filter(e=>sameMap(e,w.player)))dot(e,'#ffe4a2',4);dot(w.player,'#efffe2',4);
 }c.restore();
}
