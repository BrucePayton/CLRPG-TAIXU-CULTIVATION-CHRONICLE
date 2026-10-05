// ComfyUI-generated sources stay unmodified. Edge-connected studio backgrounds
// are removed once on load; no live generation or network service is required.
import {CAMP_ART} from './camp-assets.js';
export const WORLD_ART={deer:{height:52,facesLeft:true},wolf:{height:39,facesLeft:true},boar:{height:40,facesLeft:false,crop:[30,250,440,340]},'lodge-v2':{height:112},pine:{height:91,crop:[0,0,410,755]},healer:{height:48},shrine:{height:38},grass:{tile:true},stone:{tile:true},...CAMP_ART};
const images=new Map();
export function extractBackground(data,width,height){
 const corners=[0,(width-1)*4,(height-1)*width*4,(width*height-1)*4];
 const bg=[0,1,2].map(channel=>corners.reduce((n,i)=>n+data[i+channel],0)/4);
 const seen=new Uint8Array(width*height),queue=new Int32Array(width*height);let read=0,write=0;
 function add(i){if(i<0||i>=seen.length||seen[i])return;seen[i]=1;const o=i*4;
  const difference=Math.max(Math.abs(data[o]-bg[0]),Math.abs(data[o+1]-bg[1]),Math.abs(data[o+2]-bg[2]));
  const magenta=data[o]>125&&data[o+2]>90&&data[o+1]<Math.min(data[o],data[o+2])*.65;
  if(difference<36||magenta){queue[write++]=i;data[o+3]=0}
 }
 for(let x=0;x<width;x++){add(x);add((height-1)*width+x)}
 for(let y=0;y<height;y++){add(y*width);add(y*width+width-1)}
 while(read<write){const i=queue[read++],x=i%width;if(x>0)add(i-1);if(x<width-1)add(i+1);add(i-width);add(i+width)}
 let left=width,right=0,top=height,bottom=0;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]>0){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y)}
 return right>=left?{x:left,y:top,w:right-left+1,h:bottom-top+1}:null;
}
export function loadWorldArt(){
 for(const [id,config] of Object.entries(WORLD_ART)){
  const source=new Image();source.onload=()=>{
   if(config.frames&&(source.width!==config.frames.width*config.frames.count||source.height!==config.frames.height)){console.warn(`Invalid sprite sheet: ${id}`);return}
   const [sx,sy,sw,sh]=config.crop||[0,0,source.width,source.height];
   const canvas=document.createElement('canvas');canvas.width=sw;canvas.height=sh;const c=canvas.getContext('2d',{willReadFrequently:true});c.drawImage(source,sx,sy,sw,sh,0,0,sw,sh);
   let box={x:0,y:0,w:sw,h:sh};
   if(!config.tile&&!config.prepared){const pixels=c.getImageData(0,0,sw,sh);box=extractBackground(pixels.data,sw,sh);c.putImageData(pixels,0,0)}
   if(box)images.set(id,{image:canvas,box});
  };source.onerror=()=>console.warn(`World asset unavailable: ${id}`);source.src=config.src||`/assets/world-v2/${id}.png`;
 }
}
export function drawWorldAsset(c,id,x,y,{height=WORLD_ART[id]?.height,face=null,alpha=1,frame=0}={}){
 const asset=images.get(id);if(!asset)return false;
 const {image}=asset,frames=WORLD_ART[id].frames;
 const box=frames?{x:Math.max(0,Math.min(frames.count-1,Math.floor(frame)))*frames.width,y:0,w:frames.width,h:frames.height}:asset.box;
 const w=box.w/box.h*height,flip=face!==null&&(WORLD_ART[id].facesLeft?Math.cos(face)>0:Math.cos(face)<0);
 c.save();c.globalAlpha=alpha;c.translate(Math.round(x),Math.round(y));if(flip)c.scale(-1,1);c.imageSmoothingEnabled=false;
 const pivot=WORLD_ART[id]?.pivot||[.5,1];
 c.drawImage(image,box.x,box.y,box.w,box.h,Math.round(-w*pivot[0]),Math.round(-height*pivot[1]),Math.round(w),height);c.restore();return true;
}
export function terrainTexture(c,id,x,y,w,h,alpha=.4){
 const asset=images.get(id);if(!asset)return false;c.save();c.globalAlpha=alpha;
 c.beginPath();c.rect(x,y,w,h);c.clip();c.imageSmoothingEnabled=false;
 for(let yy=Math.floor(y/96)*96;yy<y+h;yy+=96)for(let xx=Math.floor(x/96)*96;xx<x+w;xx+=96)c.drawImage(asset.image,xx,yy,96,96);
 c.restore();return true;
}
