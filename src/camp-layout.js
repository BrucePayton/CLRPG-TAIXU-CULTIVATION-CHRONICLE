// The sample map has explicit geometry; other regions keep their legacy atlas.
export const CAMP_BOUNDS={x:-320,y:0,w:740,h:720};
export const CAMP_LODGE={id:'camp-lodge',kind:'camp-lodge',mapId:'camp',x:65,y:346};
export const CAMP_POND={x:-157,y:282,rx:57,ry:23};
export const CAMP_SOLIDS=[
 {id:'lodge-foundation',x:-58,y:307,w:247,h:35},
 {id:'medicine-rack',x:285,y:307,w:30,h:13},
];
export const CAMP_TREES=[
 [-278,192,118],[-213,158,108],[-135,183,125],[-65,154,106],[36,170,120],[148,155,117],[255,175,120],[359,195,110],
 [-278,315,126],[-245,480,116],[-285,625,130],[-172,672,108],[-66,661,124],[53,679,116],[184,666,118],[363,649,108],[365,288,92],[365,550,116]
 ,[230,288,90],[-114,324,88]
].map(([x,y,height],i)=>({id:`camp-pine-${i}`,kind:'camp-pine',mapId:'camp',x,y,height}));
export function campSolidAt(x,y,padding=0){
 return CAMP_SOLIDS.some(r=>x>=r.x-padding&&x<=r.x+r.w+padding&&y>=r.y-padding&&y<=r.y+r.h+padding)
  ||CAMP_TREES.some(t=>Math.hypot(x-t.x,(y-t.y)/.62)<7+padding);
}
export const CAMP_LAMPS=[{x:-36,y:368},{x:158,y:368},{x:334,y:411}];
