// Development evidence only. Uses an explicitly supplied local Playwright installation.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE));
const dir='docs/production/visual-v1/baseline';await fs.mkdir(dir,{recursive:true});
const sources=['src/art.js','src/effects.js','src/boss-effects.js','src/motion-effects.js','src/lighting.js','public/assets/hero-atlas.png','public/assets/boss-final.png','public/assets/cloud-sea.png'];
const hashes={};for(const file of sources)hashes[file]=createHash('sha256').update(await fs.readFile(file)).digest('hex');
await fs.writeFile(`${dir}/hashes.json`,JSON.stringify({capturedAt:new Date().toISOString(),hashes},null,2));
const browser=await chromium.launch({headless:true,channel:'chrome'});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 for(const [name,query] of [['camp',''],['arena','?inspectMap=arena']]){
  await page.goto('http://127.0.0.1:4174/'+query);await page.locator('#startButton').click();await page.waitForTimeout(1000);
  await page.locator('#game').screenshot({path:`${dir}/${name}.png`});
  if(name==='arena'){
   await page.keyboard.press('r');await page.locator('#sparDialogue').screenshot({path:`${dir}/arena-dialogue.png`});
   await page.locator('#sparDecline').click();await page.keyboard.press('k');await page.keyboard.press('f');await page.waitForTimeout(500);
   await page.locator('#game').screenshot({path:`${dir}/arena-flight-ward.png`});
  }
 }
}finally{await browser.close()}
console.log('Baseline captured. Arena uses the labelled development entry, not a full playthrough.');
