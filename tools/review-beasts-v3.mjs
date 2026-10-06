import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE));
const dir='docs/production/beasts-v3/runtime';await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,channel:'chrome'}),errors=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400&&/beasts-v3|pine.png/.test(r.url()))errors.push(`${r.status()} ${r.url()}`)});
 await page.addInitScript(()=>{
  window.beastPlays=[];const play=HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play=function(){if(this.src.includes('beasts-v3'))window.beastPlays.push({src:this.src,volume:this.volume});return play.call(this)};
 });
 await page.goto('http://127.0.0.1:4174/?inspectExit=forest-camp');
 await page.waitForTimeout(1000);await page.locator('#startButton').click();await page.waitForTimeout(1400);
 await page.locator('#game').screenshot({path:`${dir}/forest-deer.png`});
 const deerPlays=await page.evaluate(()=>window.beastPlays);assert(deerPlays.some(p=>p.src.includes('deer.wav')),'Deer fear state should play local sample');
 // Same development exit fixture as scene regression, not a claimed full playthrough.
 await page.goto('http://127.0.0.1:4174/?inspectExit=forest-river');await page.waitForTimeout(1000);await page.locator('#startButton').click();await page.waitForTimeout(1800);
 await page.locator('#game').screenshot({path:`${dir}/forest-wolf.png`});
 const wolfPlays=await page.evaluate(()=>window.beastPlays);assert(wolfPlays.some(p=>p.src.includes('wolf.wav')),'Wolf pursuit should play local sample');
 const decoded=await page.evaluate(async()=>{
  const context=new AudioContext(),out=[];
  for(const species of ['deer','boar','wolf']){const r=await fetch(`/audio/beasts-v3/${species}.wav`);const b=await context.decodeAudioData(await r.arrayBuffer());out.push({species,channels:b.numberOfChannels,duration:b.duration})}
  await context.close();return out;
 });
 assert(decoded.every(a=>a.channels===1&&a.duration===2));
 // Isolated registration board uses exact exported files, enlarged by integer factor.
 const board=await browser.newPage({viewport:{width:1100,height:360}});
 await board.setContent('<body style="margin:0;background:#182d2b;color:#e5d6ad;font:20px sans-serif"><h2>Beasts V3 · 4x nearest-neighbour · single poses</h2><div id="board" style="display:flex;align-items:end;gap:30px;padding:30px"></div></body>');
 await board.evaluate(async()=>{for(const id of ['deer','boar','wolf']){const box=document.createElement('div'),im=new Image();im.src=`http://127.0.0.1:4174/assets/beasts-v3/${id}.png`;await im.decode();im.style.width=`${im.width*4}px`;im.style.imageRendering='pixelated';box.append(im,document.createElement('br'),id);document.querySelector('#board').append(box)}});
 await board.screenshot({path:`${dir}/sprite-board.png`});
 assert.deepEqual(errors,[]);
 await fs.writeFile(`${dir}/checks.json`,JSON.stringify({browser:'headless Chrome',fixture:'development forest exit starts',errors,deerPlays,wolfPlays,decoded,listening:'not a subjective listening approval'},null,2));
 console.log('PASS: real forest deer/wolf AI audio triggers, local WAV decoding, clean runtime, sprite board');
}finally{await browser.close()}
