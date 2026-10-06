// Explicit reviewed-for-preview mapping. User art approval is still pending.
// No discovery of newest candidate files; no network generation at runtime.
export const CAMP_ART={
 'camp-healer':{src:'/assets/camp-v2/healer-atlas.png',height:58,prepared:true,pivot:[.5,56/58],frames:{width:48,height:58,count:12}},
 'camp-lodge':{src:'/assets/camp-v2/lodge.png',height:150,prepared:true,pivot:[.5,148/150]},
 'camp-pine':{src:'/assets/camp-v2/pine.png',height:104,prepared:true,pivot:[.5,102/104]},
};
export const CAMP_TEXTURES={'camp-stone':{src:'/assets/camp-v2/stone.png',tile:true,prepared:true}};

// Presentation only: no movement, resource mutations or rewards in an animation.
export function healerFrame(n,player,time){
 const close=player&&Math.hypot(player.x-n.x,(player.y-n.y)/.62)<90;
 if(!close){const phase=((time%9)+9)%9-6.35;if(phase>=0)return phase<.8?8:phase<1.15?9:phase<2.25?10:11}
 const a=close?Math.atan2((player.y-n.y)/.62,player.x-n.x):Math.PI/2;
 const direction=Math.abs(a)<Math.PI/4?3:Math.abs(a)>Math.PI*.75?2:a>0?0:1;
 const blink=((time%4)+4)%4>=3.88?1:0;return direction*2+blink;
}
