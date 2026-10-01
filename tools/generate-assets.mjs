import fs from 'node:fs/promises';
const prompt={
 '1':{class_type:'CheckpointLoaderSimple',inputs:{ckpt_name:'sd_xl_base_1.0_0.9vae.safetensors'}},
 '2':{class_type:'CLIPTextEncode',inputs:{clip:['1',1],text:'pixel art game environment, Chinese xianxia ancient floating stone battle arena above misty mountains, elevated orthographic isometric top down view, broad empty circular stone platform centered in image, carved concentric taoist magic circles, weathered blue grey stone tiles, four small bronze braziers at outer corners, broken stone stairs at bottom, towering distant mountains immersed in teal cloud sea, jade cyan and antique gold accents, detailed retro RPG pixel art, game background, entire arena visible, no characters'}},
 '3':{class_type:'CLIPTextEncode',inputs:{clip:['1',1],text:'people, character, person, text, watermark, UI, interface, photo, realistic, blurry, buildings blocking center, close up, horizon eye level'}},
 '4':{class_type:'EmptyLatentImage',inputs:{width:1024,height:576,batch_size:1}},
 '5':{class_type:'KSampler',inputs:{model:['1',0],positive:['2',0],negative:['3',0],latent_image:['4',0],seed:817204,steps:22,cfg:6.5,sampler_name:'euler',scheduler:'normal',denoise:1}},
 '6':{class_type:'VAEDecode',inputs:{samples:['5',0],vae:['1',2]}},
 '7':{class_type:'SaveImage',inputs:{images:['6',0],filename_prefix:'taixu/arena'}}};
await fs.mkdir('docs/production',{recursive:true});
await fs.writeFile('docs/production/arena-workflow.json',JSON.stringify(prompt,null,2));
const r=await fetch('http://127.0.0.1:8188/prompt',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})}).then(r=>r.json());
await fs.writeFile('docs/production/comfy-job.json',JSON.stringify(r,null,2));console.log('ComfyUI',r);
const templates=await fetch('http://127.0.0.1:8200/api/templates').then(r=>r.json());
const workflow=templates.find(t=>t.id==='sword').workflow;
workflow.name='太虚·玉剑出鞘';workflow.nodes[0].params.prompt='A magical jade sword releasing a fast airy slicing whoosh with crystalline jade chime impact, isolated fantasy game spell, no voice, no music';
const body={workflow,seed:817204,backend:'mlx',idempotency_key:'taixu-jade-sword-v1'};
await fs.writeFile('docs/production/sword-workflow.json',JSON.stringify(body,null,2));
const s=await fetch('http://127.0.0.1:8200/api/jobs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(r=>r.json());
await fs.writeFile('docs/production/sound-job.json',JSON.stringify(s,null,2));console.log('SoundGenerated',s);
