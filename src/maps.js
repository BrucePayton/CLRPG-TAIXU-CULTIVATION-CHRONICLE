// Separate RPG maps share an atlas only to preserve existing entity coordinates.
// They are not walk-connected: explicit exits perform transfers.
import {CAMP_BOUNDS} from './camp-layout.js';
export const REGIONS=[
 {id:'camp',name:'听雨驿',...CAMP_BOUNDS,color:'#334f46'},
 {id:'forest',name:'雾松林',x:420,y:0,w:440,h:900,color:'#29463e'},
 {id:'river',name:'照石溪',x:860,y:0,w:220,h:900,color:'#39545a'},
 {id:'plain',name:'残星原',x:1080,y:0,w:360,h:900,color:'#514b4c'},
 {id:'arena',name:'落星台',x:1440,y:240,w:480,h:270,color:'#31494f'}
];
export const LEGACY_ARENA=REGIONS[4];
export function regionAt(p){return REGIONS.find(r=>r.id===p.mapId)||REGIONS.find(r=>p.x>=r.x&&p.x<r.x+r.w)||REGIONS[0]}
export const sameMap=(a,b)=>regionAt(a).id===regionAt(b).id;
export function insideMap(p,r=regionAt(p)){return p.x>=r.x+12&&p.x<=r.x+r.w-12&&p.y>=r.y+55&&p.y<=r.y+r.h-20}
export const MAP_EXITS=[
 {id:'camp-forest',x:385,y:410,to:'雾松林',spawn:{x:462,y:410}},
 {id:'forest-camp',x:445,y:410,to:'听雨驿',spawn:{x:365,y:410}},
 {id:'forest-river',x:828,y:390,to:'照石溪',spawn:{x:906,y:390}},
 {id:'river-forest',x:885,y:390,to:'雾松林',spawn:{x:810,y:390}},
 {id:'river-plain',x:1050,y:390,to:'残星原',spawn:{x:1128,y:390}},
 {id:'plain-river',x:1105,y:390,to:'照石溪',spawn:{x:1030,y:390}},
 {id:'plain-arena',x:1260,y:430,to:'落星台',spawn:{x:1680,y:450}},
 {id:'arena-plain',x:1680,y:480,to:'残星原',spawn:{x:1260,y:460}}
].map(e=>({...e,mapId:regionAt(e).id,destinationId:regionAt(e.spawn).id,spawnId:e.id+'-arrival',spawn:{...e.spawn,mapId:regionAt(e.spawn).id},kind:'exit'}));
