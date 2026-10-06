import {LODGE_ROOM,LODGE_SOLIDS} from './lodge.js';
import {worldTexturePattern} from './world-assets.js';
// Functional room using the camp's existing materials; not new final artwork.
export function lodgeTerrain(c){
 const r=LODGE_ROOM;c.fillStyle='#17272b';c.fillRect(r.x,r.y,r.w,r.h);
 c.fillStyle=worldTexturePattern(c,'camp-stone')||'#586469';c.fillRect(r.x+12,r.y+55,r.w-24,r.h-75);
 c.fillStyle='#453f35';c.fillRect(r.x+12,r.y+25,r.w-24,30);
 c.fillStyle='#9e8256';c.fillRect(r.x+12,52,r.w-24,3);
 for(const x of [r.x+12,r.x+150,r.x+330,r.x+458]){c.fillStyle='#564332';c.fillRect(x,25,9,35);c.fillStyle='#a68856';c.fillRect(x+2,27,2,31)}
 for(const x of [r.x+60,r.x+355]){c.fillStyle='#aa8345';c.fillRect(x,32,32,18);c.fillStyle='#e0bd7a';c.fillRect(x+2,34,28,14);c.fillStyle='#624e35';for(let i=0;i<4;i++)c.fillRect(x+5+i*7,34,2,14)}
 const [bed,bench]=LODGE_SOLIDS;
 c.fillStyle='#514334';c.fillRect(bed.x,bed.y,bed.w,bed.h);c.fillStyle='#a5b1a1';c.fillRect(bed.x+4,bed.y+3,bed.w-8,bed.h-8);c.fillStyle='#d6cba7';c.fillRect(bed.x+7,bed.y+5,19,bed.h-12);
 c.fillStyle='#624d36';c.fillRect(bench.x,bench.y,bench.w,bench.h);c.fillStyle='#b29965';c.fillRect(bench.x,bench.y,bench.w,4);
 c.fillStyle='#617d72';c.beginPath();c.ellipse(bench.x+48,bench.y+15,15,11,0,0,Math.PI*2);c.fill();c.fillStyle='#cdb77b';c.fillRect(bench.x+43,bench.y+2,10,3);
 c.fillStyle='#d8c69a';c.font='9px serif';c.textAlign='center';c.fillText('听雨药庐 · 静室',r.x+240,76);c.fillText('卧榻 · R 休整',2098,145);c.fillText('丹炉 · B 炼制',2348,147);c.textAlign='start';
 c.fillStyle='#96866a';c.fillRect(2219,239,42,11);
}
