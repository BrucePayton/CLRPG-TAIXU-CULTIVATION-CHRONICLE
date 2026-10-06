import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {inflateSync} from 'node:zlib';
import {CAMP_BOUNDS,CAMP_SOLIDS,CAMP_POND} from '../src/camp-layout.js';
import {CAMP_ART,CAMP_TEXTURES,healerFrame} from '../src/camp-assets.js';
import {REGIONS,MAP_EXITS,insideMap} from '../src/maps.js';
import {blocked,createWorld,stepWorld,lineOfSight,nearby} from '../src/world.js';

assert.equal(REGIONS[0].w,740);assert.equal(REGIONS[0].h,720);
assert.equal(blocked(-190,410),false);assert.equal(blocked(-319,410),true);
for(const r of CAMP_SOLIDS){assert.equal(blocked(r.x+r.w/2,r.y+r.h/2),true);assert.equal(blocked(r.x+r.w/2,r.y+r.h/2,true),true)}
assert.equal(blocked(CAMP_POND.x,CAMP_POND.y),true);assert.equal(blocked(CAMP_POND.x,CAMP_POND.y,true),false);
assert.equal(lineOfSight({mapId:'camp',x:65,y:280},{mapId:'camp',x:65,y:360}),false);
const w=createWorld();Object.assign(w.player,{x:-170,y:410});stepWorld(w,.1,{x:-1});assert.ok(w.player.x<-170);assert.equal(w.player.mapId,'camp');

// Grid reachability proves no camp interaction or return exit was isolated by props.
const start={x:204,y:404},queue=[start],seen=new Set(['204,404']);
for(let i=0;i<queue.length;i++){
 const p=queue[i];for(const [dx,dy] of [[4,0],[-4,0],[0,4],[0,-4]]){
  const n={x:p.x+dx,y:p.y+dy},key=`${n.x},${n.y}`;
  if(!seen.has(key)&&insideMap(n,CAMP_BOUNDS)&&!blocked(n.x,n.y)){seen.add(key);queue.push(n)}
 }
}
for(const target of [...w.nodes,...MAP_EXITS].filter(n=>n.mapId==='camp')){
 assert.ok(queue.some(p=>Math.hypot(p.x-target.x,(p.y-target.y)/.62)<35&&lineOfSight({...p,mapId:'camp'},target)),`Unreachable ${target.id}`);
}
Object.assign(w.player,{x:260,y:362});assert.equal(nearby(w).id,'healer');
Object.assign(w.player,{x:65,y:350,step:0});stepWorld(w,1/60,{y:-1});const stoppedStep=w.player.step;stepWorld(w,1/60,{y:-1});
assert.equal(w.player.moving,false);assert.equal(w.player.step,stoppedStep);
const qi=w.player.qi,time=w.time;w.paused=true;stepWorld(w,1,{x:1});assert.equal(w.player.qi,qi);assert.equal(w.time,time);
const n={x:0,y:0};
assert.equal(healerFrame(n,{x:0,y:10},0),0);assert.equal(healerFrame(n,{x:0,y:10},3.95),1);
assert.equal(healerFrame(n,{x:0,y:-10},0),2);assert.equal(healerFrame(n,{x:-10,y:0},0),4);assert.equal(healerFrame(n,{x:10,y:0},0),6);
for(const [t,frame] of [[6.4,8],[7.2,9],[7.6,10],[8.8,11]])assert.equal(healerFrame(n,{x:200,y:0},t),frame);
for(let t=0;t<90;t+=.017)assert.ok(healerFrame(n,null,t)>=0&&healerFrame(n,null,t)<12);

// Decode these RGBA PNGs without an image dependency: verify real alpha and clean padded edges.
function rgbaPng(path){
 const file=fs.readFileSync(path);assert.equal(file.toString('hex',0,8),'89504e470d0a1a0a');
 let width,height,channels,idat=[];
 for(let i=8;i<file.length;){const n=file.readUInt32BE(i),type=file.toString('ascii',i+4,i+8),data=file.subarray(i+8,i+8+n);i+=12+n;
  if(type==='IHDR'){width=data.readUInt32BE(0);height=data.readUInt32BE(4);assert.equal(data[8],8);assert.equal(data[9],6);assert.equal(data[12],0);channels=4}
  if(type==='IDAT')idat.push(data);
 }
 const raw=inflateSync(Buffer.concat(idat)),stride=width*channels,out=Buffer.alloc(stride*height);
 const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c};
 for(let y=0;y<height;y++){const filter=raw[y*(stride+1)];assert.ok(filter<=4);for(let x=0;x<stride;x++){
  const a=x>=4?out[y*stride+x-4]:0,b=y?out[(y-1)*stride+x]:0,c=y&&x>=4?out[(y-1)*stride+x-4]:0;
  out[y*stride+x]=(raw[y*(stride+1)+x+1]+[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter])&255;
 }}return {width,height,data:out};
}
for(const [id,asset] of Object.entries(CAMP_ART)){
 const im=rgbaPng(`public${asset.src}`);assert.equal(im.height,asset.height);
 if(asset.frames)assert.equal(im.width,asset.frames.width*asset.frames.count);
 let visible=0;for(let y=0;y<im.height;y++)for(let x=0;x<im.width;x++){
  const alpha=im.data[(y*im.width+x)*4+3];assert.ok(alpha===0||alpha===255,`${id}: interpolated alpha`);if(alpha)visible++;
  const cellWidth=asset.frames?.width||im.width;
  if(x%cellWidth===0||y===0||x%cellWidth===cellWidth-1||y===im.height-1)assert.equal(alpha,0,`${id}: touches frame edge`);
 }
 assert.ok(visible>100);assert.ok(visible<im.width*im.height*.95);assert.ok(asset.prepared);
}
const baseline=JSON.parse(fs.readFileSync('docs/production/visual-v1/baseline/hashes.json','utf8'));
for(const [file,sha] of Object.entries(baseline.hashes))assert.equal(createHash('sha256').update(fs.readFileSync(file)).digest('hex'),sha,`Protected old presentation: ${file}`);
const delivery=JSON.parse(fs.readFileSync('docs/production/visual-v1/manifest.json','utf8'));
assert.equal(delivery.user_approval,'pending');
for(const asset of delivery.assets){assert.equal(createHash('sha256').update(fs.readFileSync(asset.runtime)).digest('hex'),asset.sha256);assert.equal(asset.visual_review,'pending_user_review')}
const current=JSON.parse(fs.readFileSync('docs/production/camp-v2/manifest.json','utf8'));
assert.equal(current.user_approval,'pending');
assert.deepEqual(current.assets.map(a=>a.id).sort(),Object.keys({...CAMP_ART,...CAMP_TEXTURES}).sort());
for(const asset of current.assets){
 assert.deepEqual(asset.config,({...CAMP_ART,...CAMP_TEXTURES})[asset.id]);
 for(const [file,expected] of [[asset.runtime,asset.sha256],[asset.input,asset.input_sha256],[asset.editable,asset.editable_sha256]])assert.equal(createHash('sha256').update(fs.readFileSync(file)).digest('hex'),expected,`V2 identity drift: ${file}`);
}
assert.equal(createHash('sha256').update(fs.readFileSync(current.preparation)).digest('hex'),current.preparation_sha256);
const stone=rgbaPng(`public${CAMP_TEXTURES['camp-stone'].src}`);assert.equal(stone.width,96);assert.equal(stone.height,96);
const healer=rgbaPng(`public${CAMP_ART['camp-healer'].src}`);
for(let frame=0;frame<12;frame++){
 let top=58,bottom=-1;
 for(let y=0;y<58;y++)for(let x=frame*48;x<(frame+1)*48;x++)if(healer.data[(y*healer.width+x)*4+3]){top=Math.min(top,y);bottom=Math.max(bottom,y)}
 assert.equal(bottom,55,'Every pose must share the registered foot baseline');
 assert.ok(bottom-top+1>=50&&bottom-top+1<=51,'No body-scale jump between poses');
}
for(let i=3;i<stone.data.length;i+=4)assert.equal(stone.data[i],255);
// Tile edge luminance delta must remain low; this is technical, not visual approval.
for(let i=0;i<96;i++)for(let ch=0;ch<3;ch++){
 assert.ok(Math.abs(stone.data[(i*96)*4+ch]-stone.data[(i*96+95)*4+ch])<=30);
 assert.ok(Math.abs(stone.data[i*4+ch]-stone.data[(95*96+i)*4+ch])<=30);
}
console.log('PASS: camp geometry, ground/flight collision, west exploration, all interactions reachable, clean binary-alpha PNGs, fixed pivots and protected old Boss/hero/effect hashes');
