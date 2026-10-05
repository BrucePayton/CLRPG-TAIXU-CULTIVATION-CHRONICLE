import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {chooseMusic,MUSIC_TRACKS} from '../src/music-policy.js';
import {extractBackground} from '../src/world-assets.js';
const memory={};
assert.equal(chooseMusic({region:'听雨驿',time:0},memory),'camp');
assert.equal(chooseMusic({region:'雾松林',time:0},memory),'forest');
assert.equal(chooseMusic({region:'照石溪',time:0},memory),'explore');
assert.equal(chooseMusic({region:'残星原',time:0},memory),'ruins');
assert.equal(chooseMusic({region:'听雨驿',time:0,meditating:true},memory),'cultivate');
assert.equal(chooseMusic({region:'雾松林',time:2,threat:true},memory),'encounter');
assert.equal(chooseMusic({region:'雾松林',time:6.9},memory),'encounter');
assert.equal(chooseMusic({region:'雾松林',time:7.1},memory),'forest');
const pixels=new Uint8ClampedArray(7*7*4);pixels.fill(245);for(let i=3;i<pixels.length;i+=4)pixels[i]=255;
// A dark ring must preserve the enclosed white pixel, unlike global colorkey.
for(let y=2;y<=4;y++)for(let x=2;x<=4;x++)if(x!==3||y!==3){const i=(y*7+x)*4;pixels[i]=20;pixels[i+1]=35;pixels[i+2]=40}
assert.deepEqual(extractBackground(pixels,7,7),{x:2,y:2,w:3,h:3});assert.equal(pixels[3],0);assert.equal(pixels[(3*7+3)*4+3],255);
let ticker;const created=[];
class AudioMock{constructor(url){this.url=url;this.volume=0;this.paused=true;this.currentTime=0;this.duration=30;this.events={};created.push(this)}addEventListener(k,fn){this.events[k]=fn}load(){}play(){this.paused=false;return Promise.resolve()}pause(){this.paused=true}}
const source=fs.readFileSync('src/audio.js','utf8').replace(/^import .*;$/gm,'').replaceAll('export function','function');
vm.runInNewContext(source+`
music('camp');assert.equal(voices.length,1);music('camp');assert.equal(voices.length,1);
for(let i=0;i<20;i++)tick();assert.equal(active.audio.volume,.2);
active.audio.currentTime=29;tick();assert.equal(voices.length,2);assert.equal(active.audio.currentTime,0);
for(let i=0;i<20;i++)tick();assert.equal(voices.length,1);
pauseMusic(true);for(let i=0;i<20;i++)tick();assert.equal(active.audio.paused,true);assert.equal(active.audio.volume,0);
pauseMusic(false);assert.equal(active.audio.paused,false);
toggle();for(let i=0;i<20;i++)tick();assert.equal(active.audio.volume,0);toggle();
music('forest');active.audio.events.error();tick();assert.equal(musicStatus(),'本地音乐未安装');
`,{Audio:AudioMock,MUSIC_TRACKS,setInterval:fn=>{ticker=fn;return 1},assert,Math,Number,Set});
console.log('PASS: contextual music, disengagement delay, crossfade, mute/pause, missing music fallback and edge-connected background extraction');
