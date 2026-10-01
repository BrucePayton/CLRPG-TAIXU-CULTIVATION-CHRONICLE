// Screen-space effects, with ground circles projected separately.
export class CombatEffects {
  constructor(){this.items=[];this.bits=[]}
  clear(){this.items.length=0;this.bits.length=0}
  emit(kind,x,y,a=0,power=1){
    const duration={impact:.27,parry:.48,cast:.42,formation:2.5,finale:.75}[kind]||.3;
    this.items.push({kind,x,y,a,power,age:0,duration});
    if(this.items.length>48)this.items.shift();
    if(['impact','parry','finale'].includes(kind)){
      const count=kind==='finale'?42:kind==='parry'?26:12;
      for(let i=0;i<count;i++){
        const dir=kind==='impact'?a+(Math.random()-.5)*2.7:Math.random()*Math.PI*2;
        const speed=(35+Math.random()*100)*power;
        this.bits.push({x,y,px:x,py:y,vx:Math.cos(dir)*speed,vy:Math.sin(dir)*speed*.65,
          age:0,duration:.22+Math.random()*.45,size:Math.random()<.2?3:1,
          color:i%3===0?'#fff5cb':i%3===1?'#a6f5d3':'#55aa9c'});
      }
      if(this.bits.length>360)this.bits.splice(0,this.bits.length-360);
    }
  }
  update(dt){
    for(const f of this.items)f.age+=dt;
    this.items=this.items.filter(f=>f.age<f.duration);
    for(const b of this.bits){b.px=b.x;b.py=b.y;b.x+=b.vx*dt;b.y+=b.vy*dt;b.vx*=Math.exp(-dt*3);b.vy+=28*dt;b.age+=dt}
    this.bits=this.bits.filter(b=>b.age<b.duration);
  }
  ground(c){
    c.save();
    for(const f of this.items){if(f.kind!=='formation')continue;
      const t=f.age/f.duration,alpha=Math.min(1,t*7,(1-t)*4);
      c.save();c.translate(f.x,f.y);c.scale(1,.62);c.rotate(f.age*.32);
      c.globalAlpha=alpha*.6;c.strokeStyle='#a5e9cd';c.lineWidth=1;
      for(const r of [53,59,81]){c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.stroke()}
      for(let i=0;i<8;i++){let a=i*Math.PI/4;c.save();c.rotate(a);c.beginPath();c.moveTo(59,0);c.lineTo(68,-5);c.lineTo(77,0);c.lineTo(68,5);c.closePath();c.stroke();c.fillStyle='#dce9b1';c.fillRect(64,-1,8,2);c.restore()}
      c.globalAlpha=alpha*.25;c.beginPath();for(let i=0;i<=8;i++){let a=i*Math.PI*.75;c.lineTo(Math.cos(a)*53,Math.sin(a)*53)}c.stroke();c.restore();
    }c.restore();
  }
  front(c){
    c.save();
    for(const f of this.items){
      const t=f.age/f.duration;if(f.kind==='formation')continue;
      c.save();c.translate(Math.round(f.x),Math.round(f.y));c.rotate(f.a);
      c.globalAlpha=(1-t)*(1-t);const p=f.power;
      if(f.kind==='impact'||f.kind==='parry'){
        const size=(f.kind==='parry'?23:13)*p;
        // A brief ivory core, then a long narrow directional glint.
        c.fillStyle='#f4ffda';star(c,size*(1+t*.6),size*.16*(1-t));
        c.rotate(Math.PI/2);c.fillStyle='#a9f3d0';star(c,size*.6,size*.12);
        c.strokeStyle=f.kind==='parry'?'#f6d98e':'#8de1bf';c.lineWidth=1;
        c.beginPath();c.arc(0,0,4+t*size*1.8,0,Math.PI*2);c.stroke();
      }else if(f.kind==='cast'){
        c.strokeStyle='#adf4d4';c.lineWidth=1;c.scale(.55,1);
        c.beginPath();c.arc(0,0,5+t*23,0,Math.PI*2);c.stroke();
        c.fillStyle='#f3ffdc';for(let i=0;i<6;i++){let a=i*Math.PI/3+t;c.fillRect(Math.cos(a)*(7+t*23),Math.sin(a)*(7+t*23),2,2)}
      }else if(f.kind==='finale'){
        c.strokeStyle='#ecffcc';c.lineWidth=2*(1-t)+.5;
        c.beginPath();c.ellipse(0,17,12+t*95,7+t*43,0,0,Math.PI*2);c.stroke();
        c.fillStyle='#ecffcb';star(c,65*(1-t),5*(1-t));c.rotate(Math.PI/2);star(c,43*(1-t),3*(1-t));
        for(let i=0;i<8;i++){let a=i*Math.PI/4;c.strokeStyle=i%2?'#9be6bd':'#f7e4a0';c.beginPath();c.moveTo(Math.cos(a)*t*42,Math.sin(a)*t*26);c.lineTo(Math.cos(a)*(18+t*64),Math.sin(a)*(18+t*42));c.stroke()}
      }c.restore();
    }
    for(const b of this.bits){c.globalAlpha=1-b.age/b.duration;c.strokeStyle=b.color;c.lineWidth=b.size;c.beginPath();c.moveTo(Math.round(b.px),Math.round(b.py));c.lineTo(Math.round(b.x),Math.round(b.y));c.stroke()}
    c.restore();
  }
}
function star(c,length,width){c.beginPath();c.moveTo(-length,0);c.lineTo(-width,-width);c.lineTo(0,-length*.36);c.lineTo(width,-width);c.lineTo(length,0);c.lineTo(width,width);c.lineTo(0,length*.36);c.lineTo(-width,width);c.closePath();c.fill()}

export function drawSwordArc(c,a){
  const t=1-a.life/a.max,dir=a.flip?-1:1,heavy=a.heavy,head=-1.35+t*2.9;
  const tail=head-(.3+Math.sin(t*Math.PI)*1.65),r=a.r;
  c.save();c.translate(a.x,a.y-20);c.scale(1,.62);c.rotate(a.a);c.scale(1,dir);
  const colors=a.hostile?['#a94543','#f29361','#ffe6b2']:heavy?['#599d88','#cef0a8','#fff4c3']:['#398f81','#84e1bf','#ecffe6'];
  for(let layer=0;layer<3;layer++){
    c.globalAlpha=Math.sin(Math.PI*Math.min(.98,t+.08))*(layer===0?.32:1);
    c.fillStyle=colors[layer];c.beginPath();
    const width=(heavy?12:8)*(1-layer*.32);
    for(let i=0;i<=20;i++){let k=i/20,theta=tail+(head-tail)*k;c.lineTo(Math.cos(theta)*r,Math.sin(theta)*r)}
    for(let i=20;i>=0;i--){let k=i/20,theta=tail+(head-tail)*k,rr=r-width*Math.sin(k*Math.PI*.9);c.lineTo(Math.cos(theta)*rr,Math.sin(theta)*rr)}c.closePath();c.fill();
  }
  c.globalAlpha=(1-t)*.45;c.strokeStyle=colors[1];c.lineWidth=1;
  for(let k=0;k<2;k++){c.beginPath();c.arc(0,0,r+4+k*4,tail-.12,head-.2);c.stroke()}
  c.globalAlpha=1-t;c.fillStyle=colors[2];for(let i=0;i<5;i++){let theta=head-i*.15;c.fillRect(Math.cos(theta)*(r+3+i),Math.sin(theta)*(r+3+i),2,1)}
  c.restore();
}

export function drawEnergyTrail(c,p,color,height=18){
  if(p.trail.length<2)return;c.save();
  for(let i=1;i<p.trail.length;i++){
    const prev=p.trail[i-1],v=p.trail[i],q=i/p.trail.length;
    c.globalAlpha=q*.36;c.strokeStyle=color;c.lineWidth=1+q*4;c.beginPath();c.moveTo(prev.x,prev.y-height);c.lineTo(v.x,v.y-height);c.stroke();
    c.globalAlpha=q*.8;c.strokeStyle='#eeffdc';c.lineWidth=1;c.beginPath();c.moveTo(prev.x,prev.y-height);c.lineTo(v.x,v.y-height);c.stroke();
  }c.restore();
}
