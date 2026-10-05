export const ELEMENTS={jade:{name:'玉',color:'#95efc1',cost:0},frost:{name:'霜',color:'#9cddff',cost:3},flame:{name:'火',color:'#ff9f65',cost:5},thunder:{name:'雷',color:'#d7b0ff',cost:7}};
export const SHAPES={bolt:{name:'直射',cost:0,cd:0,scale:1},fan:{name:'三分',cost:8,cd:.5,scale:.6},ring:{name:'八方',cost:18,cd:1.2,scale:.35}};
export const MODIFIERS={none:{name:'凝实',cost:0,cd:0},pierce:{name:'贯穿',cost:8,cd:.6},burst:{name:'扩散',cost:10,cd:.8}};
export const FUSIONS={
 'frost+jade':{name:'碎冰玉刃',style:'crystal'},
 'flame+jade':{name:'流焰剑',style:'ember'},
 'jade+thunder':{name:'贯雷刃',style:'arc',pierce:2},
 'flame+frost':{name:'蒸雾术',style:'mist',splash:35},
 'frost+thunder':{name:'霜雷锁',style:'seal',stun:.5},
 'flame+thunder':{name:'雷火爆',style:'nova',splash:38}
};
export function compileSpell({elements,shape='bolt',modifier='none'}){
 if(!Array.isArray(elements)||elements.length<1||elements.length>2||new Set(elements).size!==elements.length||elements.some(e=>!ELEMENTS[e])||!SHAPES[shape]||!MODIFIERS[modifier])throw new Error('法术需要 1–2 个不同元素、一个有效形态和一个修饰');
 const list=[...elements].sort();const fusion=list.length===2,interaction=FUSIONS[list.join('+')];
 return {id:'custom',fusion:interaction?.style||null,name:(interaction?.name||list.map(e=>ELEMENTS[e].name).join(''))+'·'+SHAPES[shape].name+'·'+MODIFIERS[modifier].name,
  elements:list,shape,modifier,cost:18+list.reduce((n,e)=>n+ELEMENTS[e].cost,0)+(fusion?8:0)+SHAPES[shape].cost+MODIFIERS[modifier].cost,
  cd:2+(fusion?.7:0)+SHAPES[shape].cd+MODIFIERS[modifier].cd,damage:(fusion?29:24)*SHAPES[shape].scale,
  slow:list.includes('frost')?2.5:0,stun:interaction?.stun||(list.includes('thunder')?.35:0),
  splash:modifier==='burst'?42:interaction?.splash||(list.includes('flame')?28:0),pierce:modifier==='pierce'?3:interaction?.pierce||1};
}
export function spellProjectiles(spell,p,a){
 const offsets=spell.shape==='fan'?[-.18,0,.18]:spell.shape==='ring'?Array.from({length:8},(_,i)=>i*Math.PI/4):[0];
 return offsets.map(offset=>({x:p.x,y:p.y,a:a+offset,v:spell.elements.includes('thunder')?310:230,life:1.65,friendly:true,
  spell:'custom',recipe:{...spell,elements:[...spell.elements]},damage:spell.damage,remaining:spell.pierce,hits:new Set(),trail:[]}));
}
export function drawCraftProjectile(c,p,time){
 const elements=p.recipe.elements;c.save();
 for(let layer=0;layer<elements.length;layer++){
  const id=elements[layer],color=ELEMENTS[id].color,phase=layer*Math.PI;
  c.strokeStyle=color;c.lineWidth=id==='flame'?3:1;
  for(let i=1;i<p.trail.length;i++){
   const a=p.trail[i-1],b=p.trail[i],wave=elements.length>1?Math.sin(i*.8+time*14+phase)*3:0;
   c.globalAlpha=i/p.trail.length*.75;c.beginPath();c.moveTo(a.x,a.y-18+wave);c.lineTo(b.x,b.y-18+wave);c.stroke();
   if(id==='thunder'){c.beginPath();c.moveTo(b.x-3,b.y-24);c.lineTo(b.x+2,b.y-19);c.lineTo(b.x-1,b.y-14);c.stroke()}
   if(id==='frost'&&i%3===0){c.fillStyle=color;c.fillRect(b.x-1,b.y-22,2,5)}
  }
  c.globalAlpha=.95;c.translate(p.x,p.y-18);c.rotate(p.a+time*(layer?2:-2));c.fillStyle=color;
  c.beginPath();c.moveTo(8,0);c.lineTo(0,-4-layer*2);c.lineTo(-6,0);c.lineTo(0,4+layer*2);c.closePath();c.stroke();
  c.rotate(-p.a-time*(layer?2:-2));c.translate(-p.x,-p.y+18);
 }
 c.fillStyle='#fff7de';c.globalAlpha=1;c.fillRect(p.x-1,p.y-19,2,2);
 const fusion=p.recipe.fusion;
 if(fusion){
  c.strokeStyle=fusion==='mist'?'#ebdfda':fusion==='seal'?'#c5ceff':ELEMENTS[elements[0]].color;c.globalAlpha=.6;
  if(fusion==='mist')for(let i=0;i<3;i++){c.beginPath();c.ellipse(p.x-6-i*5,p.y-18+Math.sin(time*8+i)*4,5+i*2,3+i,0,0,Math.PI*2);c.stroke()}
  else{const r=8+Math.sin(time*14)*2;c.beginPath();for(let i=0;i<=6;i++){const a=i*Math.PI/3+time*2;const rr=fusion==='nova'&&i%2?r*1.5:r;c.lineTo(p.x+Math.cos(a)*rr,p.y-18+Math.sin(a)*rr)}c.stroke()}
 }
 if(p.recipe.modifier==='burst'){c.strokeStyle=ELEMENTS[elements[0]].color;c.beginPath();c.arc(p.x,p.y-18,10,0,Math.PI*2);c.stroke()}
 c.restore();
}
