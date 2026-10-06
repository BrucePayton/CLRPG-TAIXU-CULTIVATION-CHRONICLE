export const LODGE_ROOM={id:'lodge',name:'听雨药庐',x:2000,y:0,w:480,h:270,color:'#403e35'};
export const LODGE_SOLIDS=[{x:2054,y:88,w:88,h:42},{x:2300,y:88,w:96,h:44}];
export const lodgeSolidAt=(x,y,padding=0)=>LODGE_SOLIDS.some(r=>x>=r.x-padding&&x<=r.x+r.w+padding&&y>=r.y-padding&&y<=r.y+r.h+padding);
