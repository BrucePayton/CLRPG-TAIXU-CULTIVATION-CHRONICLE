// Freeze actual output identity and technical state; never records user approval.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {CAMP_ART} from '../src/camp-assets.js';
const root='docs/production/visual-v1';
const hash=async file=>createHash('sha256').update(await fs.readFile(file)).digest('hex');
const assets=[];
for(const [id,config] of Object.entries(CAMP_ART)){
 const name=id.replace('camp-',''),runtime=`public${config.src}`,source=`${root}/${name==='healer'?'healer-atlas':name}.aseprite`;
 assets.push({id,runtime,sha256:await hash(runtime),source,source_sha256:await hash(source),height:config.height,pivot:config.pivot,
  production:name==='pine'?'Existing ComfyUI source, isolated upper-right tree, Aseprite scripted alpha cleanup and canopy retint':name==='healer'?'ComfyUI identity reference, built-in image_gen full-body direction/work poses, Aseprite uniform registration, binary-alpha cleanup and frame selection':'Blender orthographic reference, ComfyUI image-to-image, Aseprite scripted alpha cleanup, nearest pixel resampling and material retouch',
  input:name==='pine'?'public/assets/world-v2/pine.png':name==='healer'?[`${root}/healer-directions-candidate.png`,`${root}/healer-work-sheet.png`]:`${root}/${name}-candidate.png`,
  status:'integrated_preview',visual_review:'pending_user_review',technical_checks:'tools/test-camp.mjs',frame_spec:config.frames||null,redistribution_review:'pending; source-code MIT does not automatically license artwork',
  limitations:name==='healer'?['8 standing/blink cells and 4 herb-inspection poses; back neutral duplicate is not a distinct animation','walk cells rejected: opposite support legs not clear','user visual approval pending']:name==='lodge'?['roof and facade source layers exist; runtime uses complete sprite with occlusion fade']:['one isolated tree variant']});
 const entry=assets.at(-1);entry.input_sha256={};for(const file of [entry.input].flat())entry.input_sha256[file]=await hash(file);
}
const work=JSON.parse(await fs.readFile(`${root}/healer-work-result.json`,'utf8'));
work.visual_review='rejected';work.reviewer='assistant';work.reason='Requested raised hand and lowered gaze did not appear; face/proportions changed. Not an action frame and not integrated.';
await fs.writeFile(`${root}/healer-work-result.json`,JSON.stringify(work,null,2));
for(const name of ['lodge','healer']){
 const result=JSON.parse(await fs.readFile(`${root}/${name}-result.json`,'utf8'));
 result.visual_review='selected_for_cleanup_by_assistant';result.user_approval='pending';
 await fs.writeFile(`${root}/${name}-result.json`,JSON.stringify(result,null,2));
}
await fs.writeFile(`${root}/manifest.json`,JSON.stringify({version:1,date:new Date().toISOString(),scope:'V0 baseline and V1 stationary visual sample with idle and work animations, not full V1 completion',user_approval:'pending',assets,rejected:[{path:`${root}/rejected-lodge-01`,reason:'Reference preparation removed neutral roof/walls. Corrected Blender node material and alpha-only flattening, then regenerated.'},{path:`${root}/healer-work-candidate.png`,reason:work.reason},{path:`${root}/healer-directions-candidate.png`,cells:'columns 3-6',reason:'Walk contact and passing pose semantics not sufficiently distinct, especially profile opposite support leg. Only columns 1-2 selected.'}]},null,2));
console.log('Asset identities recorded; user visual review remains pending.');
