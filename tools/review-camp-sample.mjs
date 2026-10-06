import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE));
const dir=process.env.CAMP_REVIEW_DIR||'docs/production/visual-v1/runtime';await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,channel:'chrome'});
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 await page.route('https://**/*',route=>route.abort()); // Prove the scene does not need remote fonts/services.
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400&&!r.url().includes('/audio/'))errors.push(`${r.status()} ${r.url()}`)});
 await page.goto('http://127.0.0.1:4174/',{waitUntil:'domcontentloaded'});await page.locator('#startButton').click();await page.waitForTimeout(4500);
 await page.locator('#game').screenshot({path:`${dir}/camp-arrival.png`});
 await page.waitForTimeout(3300);await page.locator('#game').screenshot({path:`${dir}/camp-herb-inspection.png`});
 const move=async(key,ms)=>{await page.keyboard.down(key);await page.waitForTimeout(ms);await page.keyboard.up(key)};
 await move('d',350);await move('w',550);await page.keyboard.press('r');
 assert.match(await page.locator('#toast').innerText(),/药师/);
 await page.locator('#game').screenshot({path:`${dir}/camp-healer.png`});
 await page.keyboard.press('k');await page.keyboard.press('f');await move('s',500);await page.waitForTimeout(700);
 await page.locator('#game').screenshot({path:`${dir}/camp-flight-ward.png`});
 await move('d',1100);await page.keyboard.press('r');await page.waitForTimeout(700);
 assert.equal(await page.locator('#regionName').innerText(),'雾松林');
 await page.keyboard.press('r');await page.waitForTimeout(700);assert.equal(await page.locator('#regionName').innerText(),'听雨驿');
 await page.locator('#game').screenshot({path:`${dir}/camp-return.png`});
 // Separate labelled fixture verifies the unchanged old scene, not a claimed walk-through.
 await page.goto('http://127.0.0.1:4174/?inspectMap=arena',{waitUntil:'domcontentloaded'});await page.locator('#startButton').click();await page.waitForTimeout(4500);
 await page.locator('#game').screenshot({path:`${dir}/arena-regression.png`});
 await page.keyboard.press('r');assert.equal(await page.locator('#sparDialogue').isVisible(),true);
 await page.locator('#sparDecline').click();await page.keyboard.press('k');await page.keyboard.press('f');await page.waitForTimeout(500);
 await page.locator('#game').screenshot({path:`${dir}/arena-flight-ward.png`});
 const baseline=JSON.parse(await fs.readFile('docs/production/visual-v1/baseline/hashes.json','utf8'));
 for(const [file,hash] of Object.entries(baseline.hashes))assert.equal(createHash('sha256').update(await fs.readFile(file)).digest('hex'),hash,`Protected baseline changed: ${file}`);
 assert.deepEqual(errors,[]);
 await fs.writeFile(`${dir}/checks.json`,JSON.stringify({at:new Date().toISOString(),browser:'headless Chrome',input:'normal keyboard; arena uses labelled development start; HTTPS requests blocked',errors,checks:['camp arrival','healer herb inspection screenshot','healer interaction','camp flight and ward','walk/fly to forest exit and return using R','arena scene and declined dialogue','arena flight and ward','protected source and asset hashes unchanged','no remote font or generation dependency'],limitations:['not a complete five-map playthrough','NPC walk frames and subjective music review not completed','performance across 30/60/120 Hz not measured']},null,2));
 console.log('PASS: sample browser interactions, protected baseline hashes, no page/asset errors');
}finally{await browser.close()}
