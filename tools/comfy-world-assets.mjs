// Development-only asset production. Runtime never depends on ComfyUI.
import fs from 'node:fs/promises';
const endpoint='http://127.0.0.1:8188';
const catalog={
 'lodge-v2':'single isometric ancient Chinese cottage building game sprite, ONE complete wide rectangular wooden house with teal tiled roof, white plaster walls, open doorway and two windows, whole building fully visible, white empty background, no trees, no pots, no items, no collection, no separate objects',
 deer:'one graceful moss antler deer creature, full body standing on four hooves, facing right three quarter view, cream brown fur, branching antlers with small jade leaves, readable slender legs, calm woodland animal',
 boar:'one massive rocky armored wild boar creature, full body standing on four legs, facing right three quarter view, grey brown fur, layered dark stone plates on back, ivory tusks, stout silhouette',
 wolf:'one lean mystical grey blue wolf creature, full body on four paws, facing right three quarter view, silver mane, pointed ears, bushy tail, amber eyes, fierce alert pose',
 lodge:'one small ancient Chinese roadside herbalist cottage, entire building with teal tiled curved roof, timber frame, plaster walls, open dark doorway facing lower right, stone doorstep, small medicine jars and wooden sign without lettering beside entrance',
 pine:'one mature Chinese mountain pine tree, entire tree crown and trunk visible, curved textured brown trunk, layered dense blue green needles, asymmetrical umbrella branches',
 healer:'one adult Chinese male herbalist NPC, full body standing, blue grey hanfu robe with linen beige sash, tied dark hair, holding a small bamboo medicine basket, calm kind face, three quarter front view',
 shrine:'one ancient Chinese carved stone stele, full object, weathered grey stone pedestal, engraved abstract golden celestial sigil, moss at base, broken top corner, no readable writing',
 grass:'seamless repeatable texture tile of muted moss green grass ground, tiny clumps and scattered weathered stones, flat top down terrain, evenly lit, low contrast, no objects, no shadows, edge to edge ground texture',
 stone:'seamless repeatable texture tile of weathered grey green stone paving, irregular rectangular stones, narrow dark seams with tiny moss specks, flat top down terrain, evenly lit, low contrast, edge to edge ground texture'
};
await fs.mkdir('docs/production/world-v2',{recursive:true});
const ids=process.argv.slice(2);
for(const id of ids){
 if(!catalog[id])throw new Error('Unknown asset '+id);
 const tile=['grass','stone'].includes(id);
 const positive=`pixel art, ${catalog[id]}, premium 16 bit Chinese fantasy RPG game asset, crisp deliberate pixel clusters, carefully shaded readable forms, limited muted palette, elevated orthographic three quarter camera looking down 35 degrees, consistent small pixel density, detailed but not photorealistic, ${tile?'tileable texture':'single isolated object centered on perfectly uniform solid bright magenta #ff00ff background, generous empty margin, entire object visible, no cast shadow, no ground, no scenery'}`;
 const negative='photograph, 3d render, blurry, smooth painting, text, watermark, frame, grid, sprite sheet, multiple views, duplicate subjects, cropped object, horizon, perspective vanishing point, magenta subject';
 const prompt={
  '1':{class_type:'CheckpointLoaderSimple',inputs:{ckpt_name:'sd_xl_base_1.0_0.9vae.safetensors'}},
  '8':{class_type:'LoraLoader',inputs:{model:['1',0],clip:['1',1],lora_name:'pixel-art-xl.safetensors',strength_model:id==='lodge-v2'?.8:1,strength_clip:1}},
  '2':{class_type:'CLIPTextEncode',inputs:{clip:['8',1],text:positive}},
  '3':{class_type:'CLIPTextEncode',inputs:{clip:['8',1],text:negative}},
  '4':{class_type:'EmptyLatentImage',inputs:{width:768,height:768,batch_size:1}},
  '5':{class_type:'KSampler',inputs:{model:['8',0],positive:['2',0],negative:['3',0],latent_image:['4',0],seed:920100+Object.keys(catalog).indexOf(id)*37,steps:22,cfg:6,sampler_name:'euler',scheduler:'normal',denoise:1}},
  '6':{class_type:'VAEDecode',inputs:{samples:['5',0],vae:['1',2]}},
  '7':{class_type:'SaveImage',inputs:{images:['6',0],filename_prefix:'taixu/world-v2/'+id}}
 };
 await fs.writeFile(`docs/production/world-v2/${id}-workflow.json`,JSON.stringify(prompt,null,2));
 const response=await fetch(endpoint+'/prompt',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})});
 const job=await response.json();if(!response.ok||!job.prompt_id)throw new Error(JSON.stringify(job));
 await fs.writeFile(`docs/production/world-v2/${id}-job.json`,JSON.stringify(job,null,2));
 console.log(id,job.prompt_id);
}
