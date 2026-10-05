// Crimson/gold procedural spell language, independent of player jade effects.
const TAU=Math.PI*2;
function glyph(c,x,y,a,scale=1){
 c.save();c.translate(x,y);c.rotate(a);c.scale(scale,scale);
 c.fillStyle='#572b39';c.fillRect(-4,-7,8,14);c.fillStyle='#f4b366';c.fillRect(-3,-6,6,12);
 c.fillStyle='#a83d37';c.fillRect(-2,-4,4,1);c.fillRect(0,-3,1,6);c.fillRect(-2,0,4,1);c.fillRect(-1,3,3,1);c.restore();
}
function ellipse(c,x,y,r,color,alpha=1){c.globalAlpha=alpha;c.strokeStyle=color;c.beginPath();c.ellipse(x,y,r,r*.62,0,0,TAU);c.stroke()}
export function drawBossCharge(c,boss,time){
 if(boss.dead||boss.windup<=0)return;
 const t=Math.max(0,Math.min(1,1-boss.windup/.65)),x=boss.x+23,y=boss.y-66+Math.sin(time*3)*2;
 c.save();
 for(let i=0;i<8;i++){const a=time*2+i*TAU/8,r=25*(1-t)+7;
  c.fillStyle=i%2?'#ffcf86':'#df6249';c.fillRect(Math.round(x+Math.cos(a)*r),Math.round(y+Math.sin(a)*r*.75),2,2);
 }
 c.strokeStyle='#f4ab65';c.globalAlpha=.5+t*.4;c.beginPath();c.arc(x,y,16-t*8,-time*3,Math.PI*1.5-time*3);c.stroke();
 glyph(c,x,y,time*.4,.6+t*.3);c.restore();
}
export function drawBossBolt(c,p,time){
 c.save();
 for(let i=1;i<p.trail.length;i++){
  const q=i/p.trail.length,a=p.trail[i-1],b=p.trail[i];
  c.globalAlpha=q*.55;c.strokeStyle='#ba443b';c.lineWidth=2+q*5;c.beginPath();c.moveTo(a.x,a.y-18);c.lineTo(b.x,b.y-18);c.stroke();
  c.globalAlpha=q*.85;c.strokeStyle='#ffc078';c.lineWidth=1+q;c.stroke();
  if(i%2===0){c.fillStyle='#f6ae5e';c.fillRect(Math.round(b.x),Math.round(b.y-18+Math.sin(time*15+i)*4),1,2)}
 }
 c.globalAlpha=1;glyph(c,p.x,p.y-18,p.a+Math.PI/2+Math.sin(time*12)*.12,.85);
 c.fillStyle='#fff0b3';c.fillRect(Math.round(p.x)-1,Math.round(p.y-18)-1,2,2);c.restore();
}
export function drawFireZone(c,z,time,front=false){
 c.save();const t=Math.max(0,Math.min(1,(1.15-z.life)/.85));
 if(!front){
  c.fillStyle=z.hit?'#9d392c40':'#9c3d3328';c.beginPath();c.ellipse(z.x,z.y,25,25*.62,0,0,TAU);c.fill();
  // Fixed outer boundary is the actual damage radius. Inner ring counts down.
  ellipse(c,z.x,z.y,25,'#ffd397',.95);ellipse(c,z.x,z.y,25*t,'#f48258',.85);
  for(let i=0;i<6;i++){const a=i*TAU/6;glyph(c,z.x+Math.cos(a)*20,z.y+Math.sin(a)*12,a+time*.3,.33)}
  c.globalAlpha=.8;c.strokeStyle='#ffc385';c.beginPath();c.moveTo(z.x-4,z.y);c.lineTo(z.x+4,z.y);c.moveTo(z.x,z.y-3);c.lineTo(z.x,z.y+3);c.stroke();
 }else if(z.hit){
  const life=Math.max(0,Math.min(1,z.life/.3));
  for(let i=0;i<5;i++){
   const x=z.x+(i-2)*7,h=(30+Math.sin(i*7+time*16)*10)*Math.sin(life*Math.PI*.8);
   c.globalAlpha=life*.65;c.fillStyle=i%2?'#e96e3e':'#b43b32';
   c.beginPath();c.moveTo(x-6,z.y);c.lineTo(x-4,z.y-h*.5);c.lineTo(x+Math.sin(time*12+i)*4,z.y-h);c.lineTo(x+4,z.y-h*.45);c.lineTo(x+6,z.y);c.closePath();c.fill();
   c.globalAlpha=life*.9;c.fillStyle='#ffe0a0';c.fillRect(Math.round(x),Math.round(z.y-h*.45),2,Math.max(1,h*.4));
  }
 }
 c.restore();
}
export function drawBossBurst(c,f){
 const t=f.age/f.duration,phase=f.kind==='bossPhase',r=phase?80:28;
 c.save();c.translate(f.x,f.y);c.globalAlpha=(1-t)*.8;
 ellipse(c,0,phase?30:10,8+t*r,'#ef9b5c',(1-t)*.7);
 if(phase){
  c.strokeStyle='#ffc780';c.globalAlpha=Math.sin(t*Math.PI)*.65;
  for(let j=0;j<2;j++){c.beginPath();c.arc(0,-12,28+j*6,t*(j?2:-2),Math.PI*1.6+t*(j?2:-2));c.stroke()}
  for(let i=0;i<8;i++){const a=i*TAU/8+t*.5;glyph(c,Math.cos(a)*(32+t*12),-12+Math.sin(a)*25,a,.65)}
 }else{
  c.strokeStyle='#ffe1a1';c.lineWidth=1;
  for(let i=0;i<7;i++){const a=i*TAU/7;c.beginPath();c.moveTo(Math.cos(a)*t*16,Math.sin(a)*t*12);c.lineTo(Math.cos(a)*(7+t*26),Math.sin(a)*(7+t*19));c.stroke()}
 }
 c.restore();
}
