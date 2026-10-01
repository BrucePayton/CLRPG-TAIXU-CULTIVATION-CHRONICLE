// Software 2D ray casting in screen space; not hardware/path-traced lighting.
import {slashPose} from './combat.js';
const TAU = Math.PI * 2;
export const PILLAR_OCCLUDERS = [[68,122],[412,122],[54,222],[426,222]].map(([x,y]) =>
  [[x-7,y],[x+7,y],[x+7,y-30],[x,y-35],[x-7,y-30]]);

export function raySegment(origin, direction, a, b) {
  const sx=b[0]-a[0], sy=b[1]-a[1];
  const cross=direction.x*sy-direction.y*sx;
  if(Math.abs(cross)<1e-9)return Infinity;
  const qx=a[0]-origin.x, qy=a[1]-origin.y;
  const t=(qx*sy-qy*sx)/cross, u=(qx*direction.y-qy*direction.x)/cross;
  return t>=0&&u>=0&&u<=1?t:Infinity;
}

export function visibilityPolygon(light, polygons, samples=64) {
  const angles=Array.from({length:samples},(_,i)=>i*TAU/samples);
  for(const polygon of polygons)for(const [x,y] of polygon){
    const a=Math.atan2(y-light.y,x-light.x);
    angles.push(a-.0001,a,a+.0001);
  }
  angles.sort((a,b)=>a-b);
  return angles.map(a=>{
    const direction={x:Math.cos(a),y:Math.sin(a)};
    let length=light.radius;
    for(const polygon of polygons)for(let i=0;i<polygon.length;i++)
      length=Math.min(length,raySegment(light,direction,polygon[i],polygon[(i+1)%polygon.length]));
    return [light.x+direction.x*length,light.y+direction.y*length];
  });
}

export function collectLights(player,boss,shots,swords,zones,effects,time) {
  const lights=[];
  const add=(x,y,radius,color,power,priority=0)=>lights.push({x,y,radius,color,power,priority});
  const pose=slashPose(player.slash), bladeAngle=player.face+pose.angle;
  const handSide=Math.abs(player.face)>Math.PI*.75?-8:8;
  add(player.x+handSide+Math.cos(bladeAngle)*19+Math.cos(player.face)*pose.lean,
    player.y-23-(player.altitude||0)+Math.sin(bladeAngle)*19+Math.sin(player.face)*pose.lean*.62,
    player.slash?78:64,[112,236,191],player.slash?.85:.65,5);
  if(player.flying)add(player.x,player.y-player.altitude,48,[111,211,228],.45,3);
  if(!boss.dead)add(boss.x+23,boss.y-64, boss.windup>0?94:66,[255,139,74],boss.windup>0?.95:.55,5);
  for(const [x,y] of [[68,122],[412,122],[54,222],[426,222]])
    add(x,y-38,38,[135,220,193],.28+Math.sin(time*2+x)*.025,0);
  for(const p of shots)add(p.x,p.y-18,40,p.friendly?[106,237,188]:[255,133,67],.55,2);
  for(let i=0;i<swords.length;i+=3){const s=swords[i];add(s.x,s.y-22,45,[163,246,188],s.delay>0?.25:.6,2)}
  for(const z of zones)if(z.hit)add(z.x,z.y-15,66,[255,129,56],.8,4);
  for(const f of effects){
    const power=Math.max(0,1-f.age/f.duration);
    add(f.x,f.y,f.kind==='formation'?112:f.kind==='finale'?130:58,
      f.kind==='parry'?[255,223,147]:[143,248,194],power*(f.kind==='finale'?1:.6),4);
  }
  return lights.filter(l=>Number.isFinite(l.x+l.y)&&l.power>0)
    .sort((a,b)=>b.priority-a.priority||b.power-a.power).slice(0,16);
}

export class RayLighting {
  constructor(width,height,makeCanvas=()=>document.createElement('canvas')) {
    this.width=width;this.height=height;this.mode=2;this.stats={lights:0,rays:0};
    this.map=makeCanvas();this.map.width=width;this.map.height=height;
    this.c=this.map.getContext('2d');
  }
  cycle(){this.mode=(this.mode+1)%3;return this.label}
  get label(){return ['光照：关闭','光照：柔光','光照：光线阴影'][this.mode]}
  draw(target,lights) {
    this.stats={lights:0,rays:0};if(!this.mode)return;
    const c=this.c;
    c.globalCompositeOperation='source-over';c.globalAlpha=1;
    c.fillStyle='rgb(118,139,154)';c.fillRect(0,0,this.width,this.height);
    for(const light of lights){
      c.save();
      if(this.mode===2){
        const points=visibilityPolygon(light,PILLAR_OCCLUDERS);
        this.stats.rays+=points.length;
        c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();
      }
      const gradient=c.createRadialGradient(light.x,light.y,0,light.x,light.y,light.radius);
      gradient.addColorStop(0,`rgba(${light.color.join(',')},${light.power})`);
      gradient.addColorStop(.28,`rgba(${light.color.join(',')},${light.power*.7})`);
      gradient.addColorStop(1,`rgba(${light.color.join(',')},0)`);
      c.globalCompositeOperation='screen';c.fillStyle=gradient;
      c.fillRect(light.x-light.radius,light.y-light.radius,light.radius*2,light.radius*2);
      c.restore();this.stats.lights++;
    }
    target.save();target.globalCompositeOperation='multiply';target.drawImage(this.map,0,0);
    // Small local luminous cores, not a full-screen bloom wash.
    target.globalCompositeOperation='screen';
    for(const l of lights){target.globalAlpha=l.power*.28;target.fillStyle=`rgb(${l.color.join(',')})`;target.fillRect(Math.round(l.x)-1,Math.round(l.y)-1,2,2)}
    target.restore();
  }
}
