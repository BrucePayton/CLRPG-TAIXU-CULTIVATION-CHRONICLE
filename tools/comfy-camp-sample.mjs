// Small, image-conditioned ComfyUI batch. Outputs remain outside public runtime assets.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root='docs/production/visual-v1',endpoint='http://127.0.0.1:8188';
const catalog={
 lodge:'ONE Chinese mountain herbalist lodge, single complete building, weathered muted jade blue green curved tiled roof, fine tile ridges, pale warm plaster, dark cedar frame, two lattice windows and one dark open doorway, stone footing and steps, two small amber lanterns attached to eaves, elevated orthographic RPG game view. Preserve reference building proportions and view. Entire building centered with generous blank margin, no separate props.',
 healer:'ONE adult male Chinese herbalist, full body, facing forward slightly from above, mature gentle face, dark tied hair, muted slate blue and ivory hanfu, russet inner robe, ochre sash, holding a small bamboo herb basket at waist, dark cloth shoes, realistic adult proportions, about six heads tall. Preserve reference pose, silhouette and basket. Single isolated game character, complete feet and head, generous blank margin.'
};
catalog['healer-work']='ONE adult male Chinese herbalist, full body, front view slightly from above, tied dark hair, same slate blue outer hanfu and russet inner robe, blue sash, dark cloth shoes as reference. Looking down at a green medicinal sprig lifted in his right hand near chest, left hand supports a small bamboo medicine basket at waist. Keep body position, size and head proportions of reference. Both feet planted, calm working pose, single isolated complete character with generous blank margin.';
for(const id of process.argv.slice(2)){
 if(!catalog[id])throw Error('Unknown sample');
 const bytes=await fs.readFile(`${root}/${id==='healer-work'?'healer':id}-reference.png`);
 const form=new FormData();form.append('image',new Blob([bytes],{type:'image/png'}),`taixu-v1-${id}.png`);form.append('overwrite','false');
 const upload=await fetch(endpoint+'/upload/image',{method:'POST',body:form});if(!upload.ok)throw Error(await upload.text());
 const uploaded=await upload.json();
 const positive=`pixel art, ${catalog[id]} Detailed readable pixel clusters, restrained 16-bit Chinese xianxia RPG style, cool desaturated jade and slate shadows with warm parchment highlights, sharp silhouette, solid uniform white background, no ground plane, no cast shadow.`;
 const prompt={
  '1':{class_type:'CheckpointLoaderSimple',inputs:{ckpt_name:'sd_xl_base_1.0_0.9vae.safetensors'}},
  '8':{class_type:'LoraLoader',inputs:{model:['1',0],clip:['1',1],lora_name:'pixel-art-xl.safetensors',strength_model:.65,strength_clip:.8}},
  '2':{class_type:'CLIPTextEncode',inputs:{clip:['8',1],text:positive}},
  '3':{class_type:'CLIPTextEncode',inputs:{clip:['8',1],text:'photograph, smooth 3d render, painting, chibi, border, bamboo frame, scenery, terrain, collection, separate items, sprite sheet, multiple characters, duplicate building, cropped feet, text, logo, watermark, cast shadow'}},
  '4':{class_type:'LoadImage',inputs:{image:uploaded.subfolder?`${uploaded.subfolder}/${uploaded.name}`:uploaded.name}},
  '9':{class_type:'VAEEncode',inputs:{pixels:['4',0],vae:['1',2]}},
  '5':{class_type:'KSampler',inputs:{model:['8',0],positive:['2',0],negative:['3',0],latent_image:['9',0],seed:id==='lodge'?26100401:id==='healer-work'?26100403:26100402,steps:24,cfg:6,sampler_name:'euler',scheduler:'normal',denoise:id==='lodge'?.62:id==='healer-work'?.58:.46}},
  '6':{class_type:'VAEDecode',inputs:{samples:['5',0],vae:['1',2]}},
  '7':{class_type:'SaveImage',inputs:{images:['6',0],filename_prefix:`taixu/visual-v1/${id}`}}
 };
 await fs.writeFile(`${root}/${id}-workflow.json`,JSON.stringify(prompt,null,2));
 const response=await fetch(endpoint+'/prompt',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})});const job=await response.json();
 if(!response.ok||!job.prompt_id)throw Error(JSON.stringify(job));
 await fs.writeFile(`${root}/${id}-job.json`,JSON.stringify({...job,reference_sha256:createHash('sha256').update(bytes).digest('hex'),status:'submitted',visual_review:'pending'},null,2));
 console.log(id,job.prompt_id);
}
