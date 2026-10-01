import fs from 'node:fs/promises';
const prompt=JSON.parse(await fs.readFile('docs/production/arena-workflow.json','utf8'));
prompt['2'].inputs.text='pixel art sprite of a Chinese xianxia ancient sorcerer boss, full body single character centered, standing facing viewer, elderly male with long white hair, ornate bronze demon mask with small horns covering face, elaborate crimson and black layered Chinese taoist robes with gold embroidery, broad angular shoulder armor, holding a tall bronze staff with red crystal, dark leather boots, retro 16 bit RPG sprite, detailed pixel clusters, strong silhouette, isolated on completely plain solid bright green background, generous empty margin, no ground, no shadow';
prompt['3'].inputs.text='multiple characters, grid, sprite sheet, cropped, text, watermark, background scenery, photo, smooth painting, green clothing, green body, green eyes';
prompt['4'].inputs.width=512;prompt['4'].inputs.height=768;prompt['5'].inputs.seed=271710;prompt['5'].inputs.steps=24;prompt['7'].inputs.filename_prefix='taixu/boss';
await fs.writeFile('docs/production/boss-workflow.json',JSON.stringify(prompt,null,2));
console.log(await fetch('http://127.0.0.1:8188/prompt',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})}).then(r=>r.json()));
