import {LODGE_ROOM} from './lodge.js';
import {drawWorldAsset,worldTexturePattern} from './world-assets.js';
import {LODGE_ART} from './lodge-assets.js';
export function lodgeTerrain(c){
 const r=LODGE_ROOM;
 if(!drawWorldAsset(c,'lodge-room',r.x,r.y)){
  c.fillStyle=worldTexturePattern(c,'camp-stone')||'#586469';c.fillRect(r.x,0,r.w,r.h);
  c.fillStyle='#e0c99a';c.font='10px serif';c.fillText('药庐素材载入中',r.x+190,60);
 }
 c.fillStyle='#ead2a4';c.font='8px serif';c.textAlign='center';
 c.fillText('卧榻 · R 休整',2098,145);c.fillText('丹炉 · B 炼制',2348,147);c.textAlign='start';
}
export function drawLodgeProp(c,o,player){
 const config=LODGE_ART[o.kind];
 const behind=Math.abs(player.x-o.x)<56&&player.y<o.y&&player.y>o.y-config.height;
 if(drawWorldAsset(c,o.kind,o.x,o.y,{alpha:behind?.45:1}))return;
 c.strokeStyle='#e0c99a';c.strokeRect(o.x-44,o.y-35,88,35);
}
