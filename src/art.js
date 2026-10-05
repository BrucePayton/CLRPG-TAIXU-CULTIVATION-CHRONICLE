export const W=480,H=270,GROUND=.62;
import {slashPose} from './combat.js';
const atlas=new Image();atlas.src='/assets/hero-atlas.png';
const backdrop=new Image();backdrop.src='/assets/cloud-sea.png';
const bossAtlas=new Image();let bossSprite=null;bossAtlas.onload=()=>{bossSprite=bossAtlas};bossAtlas.src='/assets/boss-final.png';
const cols=[[36,286],[349,590],[664,923],[968,1212]],rows=[[6,354],[357,665],[675,976]];
export function poly(c,points,color){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill()}
export function ring(c,x,y,r,color,alpha=1){c.save();c.globalAlpha=alpha;c.strokeStyle=color;c.beginPath();c.ellipse(x,y,r,r*GROUND,0,0,7);c.stroke();c.restore()}
function stageRing(c,r,color,alpha=1){c.save();c.globalAlpha=alpha;c.strokeStyle=color;c.beginPath();c.ellipse(240,171,r,r*83/218,0,0,7);c.stroke();c.restore()}
export function sword(c,x,y,a,scale=1,color='#8bddbc'){
 c.save();c.translate(Math.round(x),Math.round(y));c.rotate(a);c.scale(scale,scale);
 poly(c,[[0,-2],[22,-2],[28,0],[22,2],[0,2]],'#235a53');poly(c,[[1,-1],[22,-1],[27,0],[2,1]],color);c.fillStyle='#e6fff0';c.fillRect(3,-1,19,1);
 c.fillStyle='#d4b371';c.fillRect(-2,-4,3,8);c.fillStyle='#395e4e';c.fillRect(-8,-1,6,3);c.fillStyle='#c78856';c.fillRect(-10,-2,3,4);c.fillStyle='#963936';c.fillRect(-15,0,5,1);c.fillRect(-17,1,4,1);c.restore();
}
function pillar(c,x,y){poly(c,[[x-7,y],[x+7,y],[x+7,y-30],[x-7,y-30]],'#253b43');poly(c,[[x,y],[x+7,y],[x+7,y-30],[x,y-30]],'#14272f');poly(c,[[x-10,y-30],[x,y-35],[x+10,y-30],[x,y-25]],'#768c85');c.fillStyle='#aa985c';c.fillRect(x-2,y-24,3,12);c.fillStyle='#a2e5d0';c.fillRect(x-1,y-23,1,8);ring(c,x,y,10,'#56867a')}
export function scene(c,t,{background=true}={}){
 if(background){
 c.fillStyle='#102831';c.fillRect(0,0,W,H);
 if(backdrop.complete&&backdrop.naturalWidth)c.drawImage(backdrop,0,0,W,H);
 else for(let i=0;i<7;i++){let x=i*91-40;poly(c,[[x,140],[x+39,12+i%3*14],[x+70,100],[x+100,150]],i%2?'#24434d':'#31505a')}
 for(let i=0;i<8;i++){c.fillStyle='#82b5b00c';c.beginPath();c.ellipse((i*97+t*3)%580-50,40+i%3*94,80,16,0,0,7);c.fill()}
 }
 c.fillStyle='#12232b';c.beginPath();c.ellipse(240,186,218,83,0,0,7);c.fill();c.fillStyle='#31494f';c.beginPath();c.ellipse(240,171,218,83,0,0,7);c.fill();
 c.save();c.beginPath();c.ellipse(240,171,215,80,0,0,7);c.clip();c.fillStyle='#41585b';c.fillRect(20,82,440,170);
 for(let y=90;y<260;y+=14)for(let x=0;x<480;x+=32){let xx=x+(y%28?16:0);c.fillStyle=(Math.floor(x/32)+Math.floor(y/14))%3?'#3a5155':'#465f60';c.fillRect(xx,y,30,12);c.fillStyle='#70817a33';c.fillRect(xx+2,y,25,1)}
 for(let i=0;i<35;i++){let x=40+(i*73)%400,y=94+(i*31)%150;c.fillStyle='#6b887242';c.fillRect(x,y,5,2)}c.restore();
 stageRing(c,208,'#a9a076');stageRing(c,201,'#6d897f');stageRing(c,130,'#89b09a',.5);stageRing(c,120,'#b6aa74',.65);stageRing(c,49,'#87baa2',.6);
 for(let i=0;i<8;i++){let a=i*Math.PI/4,x=240+Math.cos(a)*163,y=171+Math.sin(a)*65;c.save();c.translate(x,y);c.scale(1,.62);c.rotate(a);c.fillStyle='#bcb586';for(let j=0;j<3;j++){c.fillRect(-8,-6+j*5,6,2);c.fillRect(i&(1<<j)?1:-1,-6+j*5,i&(1<<j)?7:9,2)}c.restore()}
 c.save();c.translate(240,171);c.scale(1,.62);c.rotate(t*.025);c.strokeStyle='#b2c3a380';c.beginPath();c.arc(0,0,34,0,7);c.stroke();c.beginPath();c.arc(0,-17,17,-Math.PI/2,Math.PI/2);c.arc(0,17,17,-Math.PI/2,Math.PI/2,true);c.stroke();c.fillStyle='#acc6ad';c.fillRect(-2,-19,4,4);c.fillStyle='#172f36';c.fillRect(-2,15,4,4);c.restore();
 pillar(c,68,122);pillar(c,412,122);for(let j=0;j<5;j++)poly(c,[[214-j*3,249+j*3],[266+j*3,249+j*3],[266+j*3,252+j*3],[214-j*3,252+j*3]],j%2?'#425a5b':'#718077');
}
export function foreground(c){pillar(c,54,222);pillar(c,426,222)}
export function ward(c,p,t){
 if(!p.guard)return;const x=p.x,y=p.y-24-p.altitude,pulse=.5+.5*Math.sin(t*2.5);
 c.save();c.fillStyle=p.guardHit>0?'#b9ffe52b':'#79d8c310';c.strokeStyle=p.guardHit>0?'#eeffcf':'#92dfc4';c.globalAlpha=.65+pulse*.2;
 c.beginPath();c.ellipse(x,y,23,29,0,0,Math.PI*2);c.fill();c.stroke();
 for(let i=0;i<4;i++){const a=t*.65+i*Math.PI/2;c.fillStyle='#daf4bf';c.fillRect(x+Math.cos(a)*23-1,y+Math.sin(a)*29-1,2,2)}
 c.restore();ring(c,p.x,p.y-p.altitude,25,'#91dfbc',.5);
}
export function hero(c,o,t,alpha=1){
 if(!atlas.complete||!atlas.naturalWidth)return;
 let a=o.face,col=Math.abs(a)<Math.PI/4?3:Math.abs(a)>Math.PI*.75?2:a>0?0:1;
 let row=o.moving&&!o.flying?1+(Math.floor(o.step)%2):0,[x0,x1]=cols[col],[y0,y1]=rows[row];
 let h=51,w=(x1-x0)/(y1-y0)*h,raise=o.altitude||0;
 const pose=slashPose(o.slash);
 c.save();c.globalAlpha=alpha*(o.inv>0&&Math.floor(t*20)%2?.45:1);c.translate(Math.cos(a)*pose.lean,-raise+Math.sin(a)*pose.lean*GROUND);
 if(raise>2)sword(c,o.x-9,o.y+1,Math.cos(o.face)<0?Math.PI:0,1.25,'#b8f4d6');
 c.drawImage(atlas,x0,y0,x1-x0,y1-y0,Math.round(o.x-w/2),Math.round(o.y-h),Math.round(w),h);
 let handX=o.x+(col===2?-8:8),handY=o.y-23;sword(c,handX,handY,o.face+pose.angle,.9);c.fillStyle='#ecd1a1';c.fillRect(handX-2,handY-1,3,3);c.restore();
}
export function enemy(c,o,t){
 if(o.dead)return;let x=Math.round(o.x),y=Math.round(o.y),hover=Math.sin(t*3)*2;c.save();c.translate(x,y+hover);
 ring(c,0,-34,25,o.phase===2?'#ffae63':'#b18558',.55);
 if(bossSprite){
  if(o.phase===2){ring(c,0,-35,33,'#eb9256',.35);ring(c,0,-35,37,'#d4b56d',.2)}
  let h=76,w=h*bossSprite.naturalWidth/bossSprite.naturalHeight;c.drawImage(bossSprite,Math.round(-w/2),-h,w,h);
  if(o.windup>0){let v=1-o.windup/.65;ring(c,23,-66,6+v*8,'#ffe1a0',.9);c.fillStyle='#ffcc87';c.fillRect(21,-69,4,5)}
  if(o.phase===2)for(let i=0;i<6;i++){let a=t+i*Math.PI/3,xx=Math.cos(a)*32,yy=-30+Math.sin(a)*13;c.save();c.translate(xx,yy);c.rotate(Math.sin(a)*.12);c.fillStyle='#6e393b';c.fillRect(-1,-1,6,12);c.fillStyle='#f3bd72';c.fillRect(0,0,4,10);c.fillStyle='#a74c40';c.fillRect(1,2,2,1);c.fillRect(2,3,1,4);c.fillRect(1,6,2,1);c.restore()}
  if(o.stun>0){c.fillStyle='#e4f0c2';for(let i=0;i<3;i++)c.fillRect(Math.cos(t*3+i*2.1)*13,-69+Math.sin(t*3+i*2.1)*3,2,2)}
  c.restore();return
 }
 poly(c,[[-15,-40],[13,-40],[22,-8],[10,-3],[-2,-7],[-19,-2],[-23,-12]],'#211e32');
 poly(c,[[-13,-38],[0,-30],[-4,-6],[-18,-3]],'#713a43');poly(c,[[0,-31],[12,-39],[19,-5],[4,-8]],'#934951');
 poly(c,[[-17,-37],[-25,-23],[-17,-17],[-6,-30]],'#45273a');poly(c,[[12,-37],[24,-26],[20,-16],[6,-29]],'#582e3c');
 c.fillStyle='#d8b175';c.fillRect(-14,-37,26,2);c.fillRect(-4,-30,3,24);c.fillRect(-12,-18,22,3);
 poly(c,[[-10,-51],[9,-51],[13,-34],[7,-27],[6,-46],[-6,-46],[-9,-28],[-15,-35]],'#c7c6b8');poly(c,[[-7,-51],[7,-51],[8,-39],[0,-33],[-8,-39]],'#a48b57');
 c.fillStyle='#332535';c.fillRect(-6,-44,4,2);c.fillRect(2,-44,4,2);c.fillStyle='#f8b36a';c.fillRect(-5,-44,2,1);c.fillRect(3,-44,2,1);
 poly(c,[[-7,-49],[-13,-58],[-10,-60],[-3,-50]],'#c1a16b');poly(c,[[6,-49],[12,-58],[10,-60],[2,-50]],'#c1a16b');
 c.fillStyle='#967650';c.fillRect(22,-47,2,47);c.fillStyle='#f0c373';c.fillRect(20,-48,6,2);c.fillStyle='#db754a';c.fillRect(21,-54,4,6);
 if(o.phase===2)for(let i=0;i<5;i++){let a=t+i*1.256,xx=Math.cos(a)*30,yy=-24+Math.sin(a)*11;c.fillStyle='#ecab67';c.fillRect(xx,yy,4,9);c.fillStyle='#953f3c';c.fillRect(xx+1,yy+2,2,4)}c.restore();
}
