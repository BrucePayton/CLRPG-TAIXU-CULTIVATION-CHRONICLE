import fs from 'node:fs/promises';
const prompt=JSON.parse(await fs.readFile('docs/production/arena-workflow.json','utf8'));
prompt['2'].inputs.text='pixel art, atmospheric Chinese mountain landscape from high above, looking down into an immense sea of pale blue clouds, tall narrow jagged rocky peaks piercing cloud banks along left and right edges, tiny ancient Chinese pavilion on distant rock at top left, dark teal and blue grey rocks, soft jade green distant peaks, expansive empty cloud mist at center and lower half, detailed 16 bit retro game pixel art, cinematic mystical xianxia environment, wide landscape composition';
prompt['3'].inputs.text='people, character, person, text, watermark, UI, photo, blurry, arena, platform, courtyard, pool, water, flat green background, close up';prompt['5'].inputs.seed=817207;prompt['7'].inputs.filename_prefix='taixu/cloud-sea';
await fs.writeFile('docs/production/cloud-workflow.json',JSON.stringify(prompt,null,2));
console.log(await fetch('http://127.0.0.1:8188/prompt',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})}).then(r=>r.json()));
