// Same lifetime, opacity and jade palette as the original duel. Visual only.
export class MotionEffects {
 constructor(){this.clear()}
 clear(){this.ghosts=[];this.sparks=[];this.flight=false}
 update(p,dt){
  for(const g of this.ghosts)g.life-=dt;
  for(const s of this.sparks){s.life-=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.z-=15*dt}
  this.ghosts=this.ghosts.filter(g=>g.life>0);
  this.sparks=this.sparks.filter(s=>s.life>0);
  if(p.dash>0)this.ghosts.push({...p,slash:null,life:.23});
  if(p.flying&&p.moving)this.sparks.push({x:p.x-10,y:p.y,z:p.altitude,vx:-Math.cos(p.face)*15,vy:-Math.sin(p.face)*10,life:.35});
  this.ghosts=this.ghosts.slice(-16);this.sparks=this.sparks.slice(-32);
 }
 draw(c,painter,time){
  for(const g of this.ghosts)painter(c,g,time,g.life*.9);
  c.save();c.fillStyle='#95e9d0';
  for(const s of this.sparks){c.globalAlpha=Math.min(1,s.life*3);c.fillRect(Math.round(s.x),Math.round(s.y-s.z),2,2)}
  c.restore();
 }
}
