// Shared timings drive the held sword, slash ribbon and damage window.
export const SLASHES = [
  {startup:.09,active:.15,recovery:.12,damage:19,posture:12,reach:55,flip:0},
  {startup:.08,active:.15,recovery:.12,damage:19,posture:12,reach:55,flip:1},
  {startup:.16,active:.20,recovery:.22,damage:30,posture:21,reach:65,flip:0},
];
export function createSlash(chain,angle){return {...SLASHES[chain],age:0,angle,hit:false,started:false}}
export function slashPose(s){
  if(!s)return {angle:0,lean:0};
  const direction=s.flip?-1:1;
  if(s.age<s.startup)return {angle:-direction*1.35*s.age/s.startup,lean:-2*s.age/s.startup};
  if(s.age<s.startup+s.active){const t=(s.age-s.startup)/s.active;return {angle:direction*(-1.35+t*2.9),lean:Math.sin(t*Math.PI)*4}}
  const t=Math.min(1,(s.age-s.startup-s.active)/s.recovery);
  return {angle:direction*1.55*(1-t),lean:0};
}
export function stepSlash(s,dt,player,target,ground=.62){
  const previous=s.age;s.age+=dt;
  const started=!s.started&&s.age>=s.startup;
  if(started)s.started=true;
  const dx=target.x-player.x,dy=(target.y-player.y)/ground;
  const delta=Math.atan2(Math.sin(Math.atan2(dy,dx)-s.angle),Math.cos(Math.atan2(dy,dx)-s.angle));
  // Swept angular interval: contact follows the visible blade, including low FPS crossings.
  const lo=Math.max(0,Math.min(1,(previous-s.startup)/s.active));
  const hi=Math.max(0,Math.min(1,(s.age-s.startup)/s.active));
  const directed=delta*(s.flip?-1:1);
  const hit=!s.hit&&s.age>=s.startup&&previous<s.startup+s.active&&
    Math.hypot(dx,dy)<s.reach&&directed>=-1.35+lo*2.9-.22&&directed<=-1.35+hi*2.9+.22;
  if(hit)s.hit=true;
  return {started,hit,done:s.age>=s.startup+s.active+s.recovery};
}
