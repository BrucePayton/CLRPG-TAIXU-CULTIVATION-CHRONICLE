import {drawWorldAsset} from './world-assets.js';
import {CAMP_BOUNDS,CAMP_LODGE,CAMP_LAMPS} from './camp-layout.js';

function polygon(c,p,color){c.fillStyle=color;c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill()}
function oval(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill()}
function hash(x,y){return Math.abs(Math.imul(x,374761393)^Math.imul(y,668265263))>>>0}
let paving=null;
function pavingPattern(c){
 if(paving)return paving;
 const tile=document.createElement('canvas');tile.width=32;tile.height=20;const t=tile.getContext('2d');
 t.fillStyle='#656e5d';t.fillRect(0,0,32,20);
 for(let row=0;row<2;row++)for(let col=-1;col<3;col++){
  const x=col*16+(row?8:0),y=row*10;t.fillStyle=(col+row)%2?'#858875':'#93917a';t.fillRect(x+1,y+1,14,8);
  t.fillStyle='#a0a18a';t.fillRect(x+2,y+1,11,1);
 }
 paving=c.createPattern(tile,'repeat');return paving;
}
function road(c,width){c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.beginPath();c.moveTo(-182,448);c.bezierCurveTo(-90,420,82,443,184,404);c.bezierCurveTo(265,378,307,419,414,410);c.moveTo(67,342);c.lineTo(67,424);c.moveTo(205,410);c.bezierCurveTo(263,460,300,527,350,620);c.stroke()}
function garden(c,x,y){
 polygon(c,[[x-3,y+3],[x+106,y+3],[x+106,y+55],[x-3,y+55]],'#213b39');
 c.fillStyle='#8a8466';c.fillRect(x-2,y,106,3);c.fillRect(x-2,y,3,52);c.fillRect(x+102,y,3,52);c.fillRect(x-2,y+50,106,3);
 c.fillStyle='#4d5140';c.fillRect(x+2,y+4,99,44);
 for(let row=0;row<3;row++)for(let col=0;col<7;col++){
  const px=x+10+col*14,py=y+13+row*13;
  oval(c,px,py+3,5,2,'#293e32');c.fillStyle='#466747';c.fillRect(px,py-4,2,8);
  polygon(c,[[px,py],[px-5,py-4],[px-4,py+1]],'#8baf75');polygon(c,[[px+1,py-1],[px+6,py-6],[px+5,py]],'#709c76');
  if((col+row)%3===0){c.fillStyle='#d4c18c';c.fillRect(px,py-5,2,2)}
 }
}
export function campTerrain(c,cam){
 const r=CAMP_BOUNDS;c.fillStyle='#344e48';c.fillRect(r.x,r.y,r.w,r.h);
 // Low-contrast, stable pixel clusters. No stretched high-resolution grass image.
 for(let y=Math.floor(cam.y/16)*16;y<cam.y+286;y+=16)for(let x=Math.floor(cam.x/16)*16;x<cam.x+496;x+=16){
  const n=hash(x,y);c.fillStyle=['#375148','#344e46','#364f47'][n%3];c.fillRect(x,y,16,16);
  c.fillStyle=n%2?'#516650':'#30483e';c.fillRect(x+2+n%9,y+3+(n>>4)%8,3,1);c.fillRect(x+4+n%7,y+8+(n>>7)%5,1,2);
 }
 // Raised courtyard, with a dark retaining face and an irregular stone edge.
 const court=[[-47,351],[28,327],[150,336],[244,359],[304,396],[282,457],[176,484],[34,477],[-60,424]];
 polygon(c,court.map(([x,y])=>[x,y+8]),'#203b3c');polygon(c,court,'#6e7970');
 c.save();c.beginPath();court.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();
 for(let y=326;y<488;y+=12)for(let x=-80;x<330;x+=24){const n=hash(x,y),xx=x+(Math.floor(y/12)%2)*12;c.fillStyle=['#66776e','#5c716a','#718077'][n%3];c.fillRect(xx+1,y+1,22,10);c.fillStyle='#91a08b55';c.fillRect(xx+2,y+1,18,1)}
 c.restore();
 c.strokeStyle='#4e6151';road(c,29);c.strokeStyle='#717663';road(c,25);c.strokeStyle=pavingPattern(c);road(c,23);
 for(let i=0;i<24;i++){const x=-180+i*25,y=426+Math.sin(i*.55)*8;c.fillStyle='#536252';c.fillRect(x,y,5,2)}
 // Matching quiet stone pattern beneath the player's initial position.
 for(let i=0;i<4;i++){const y=351+i*3;c.fillStyle=i%2?'#879384':'#465c56';c.fillRect(33-i*3,y,65+i*6,3)}
 garden(c,-157,368);garden(c,-143,455);
 // Tiny ornamental pond, separate from traversable river gameplay.
 oval(c,-157,286,64,30,'#1e3638');oval(c,-157,282,64,28,'#778675');oval(c,-157,282,57,23,'#2e5359');
 for(let i=0;i<12;i++){const x=-204+(i*19)%92,y=268+(i*7)%27;c.fillStyle=i%3?'#6f9c974f':'#a8beb273';c.fillRect(x,y,9,1)}
 // Low boundary terraces, not a second connected overworld.
 for(let i=0;i<3;i++)polygon(c,[[-320,92+i*22],[-166,115+i*16],[-29,85+i*17],[112,112+i*15],[270,96+i*18],[420,120+i*20],[420,0],[-320,0]],['#233d3d','#294441','#304b45'][2-i]);
 c.fillStyle='#b4bca0';c.font='8px serif';c.fillText('药圃',-124,357);
}
export function drawCampProp(c,o,player){
 if(o.kind==='camp-lodge'){
  const behind=player.x>o.x-110&&player.x<o.x+110&&player.y<o.y&&player.y>o.y-158;
  oval(c,o.x+8,o.y,112,22,'#152f324f');
  if(drawWorldAsset(c,'camp-lodge',o.x,o.y,{alpha:behind?.48:1}))return true;
  // Explicit failure rendering keeps the collision volume visible, never pretends to be finished art.
  c.fillStyle='#52655a';c.fillRect(-17,293,158,49);c.strokeStyle='#dbba80';c.lineWidth=1;c.strokeRect(-17,293,158,49);
  c.fillStyle='#f0d5a3';c.font='8px serif';c.fillText('药庐 · 素材未载入',8,320);return false;
 }
 if(o.kind==='camp-pine'){
  const behind=Math.abs(player.x-o.x)<o.height*.36&&player.y<o.y&&player.y>o.y-o.height;
  oval(c,o.x+5,o.y,25,7,'#132e304d');
  if(drawWorldAsset(c,'camp-pine',o.x,o.y,{height:o.height,alpha:behind?.4:1}))return true;
  c.fillStyle='#60543e';c.fillRect(o.x-4,o.y-18,8,18);return false;
 }
}
export function campDetails(c,time){
 // Warm courtyard accents remain well below spell brightness.
 for(const p of CAMP_LAMPS){
  oval(c,p.x,p.y+1,9,3,'#223d37');c.fillStyle='#4b4b39';c.fillRect(p.x-2,p.y-30,4,31);
  c.fillStyle='#293c35';c.fillRect(p.x-7,p.y-32,14,3);c.fillStyle='#bd8f51';c.fillRect(p.x-5,p.y-28,10,13);
  c.fillStyle='#f0ce85';c.fillRect(p.x-3,p.y-27,6,10);c.fillStyle='#624e34';c.fillRect(p.x-6,p.y-15,12,2);
 }
 // Medicine drying rack: distinct silhouette and collision footprint.
 c.fillStyle='#394b3d';c.fillRect(285,290,3,31);c.fillRect(312,290,3,31);
 for(let row=0;row<3;row++){c.fillStyle='#9d8c61';c.fillRect(282,290+row*8,35,3);for(let j=0;j<5;j++){c.fillStyle=j%2?'#b3ba7c':'#658465';c.fillRect(286+j*6,287+row*8,4,3)}}
 // Steam is restrained environmental motion, not a character animation substitute.
 for(let i=0;i<3;i++){const life=(time*.3+i/3)%1;c.fillStyle=`rgba(193,209,187,${(1-life)*.19})`;c.fillRect(CAMP_LODGE.x+70+Math.sin(time+i)*2,235-life*20,2,4)}
}
