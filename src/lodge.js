export const LODGE_ROOM={id:'lodge',name:'听雨药庐',x:2000,y:0,w:480,h:270,color:'#403e35'};
export const LODGE_SOLIDS=[{x:2054,y:88,w:88,h:42},{x:2300,y:88,w:96,h:44}];
export const LODGE_WALKABLE={left:2033,right:2447,top:83,bottom:250};
export const LODGE_PROPS=[{kind:'lodge-bed',mapId:'lodge',x:2098,y:130},{kind:'lodge-workbench',mapId:'lodge',x:2348,y:132}];
export const lodgeSolidAt=(x,y,padding=0)=>x<LODGE_WALKABLE.left||x>LODGE_WALKABLE.right||y<LODGE_WALKABLE.top||y>LODGE_WALKABLE.bottom||LODGE_SOLIDS.some(r=>x>=r.x-padding&&x<=r.x+r.w+padding&&y>=r.y-padding&&y<=r.y+r.h+padding);
