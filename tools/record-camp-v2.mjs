// Hash freeze only. Visual acceptance is not inferred from generation or tests.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {CAMP_ART,CAMP_TEXTURES} from '../src/camp-assets.js';
const root='docs/production/camp-v2';
const hash=async path=>createHash('sha256').update(await fs.readFile(path)).digest('hex');
const tasks={lodge:'exec-1410a653-8b52-45c2-b6da-3a919339ffe7',pine:'exec-5b7ce1af-e61f-41fc-8411-7031a23e5fc8',stone:'exec-de413eff-0db7-49a0-a353-b395c6020b06',healer:'exec-95797743-ef34-43d9-8e5e-815ca69fbd40'};
const assets=[];
for(const [id,config] of Object.entries({...CAMP_ART,...CAMP_TEXTURES})){
 const name=id.replace('camp-',''),stem=name==='healer'?'healer-atlas':name;
 const runtime=`public${config.src}`,input=`${root}/source/${name}.png`,editable=`${root}/${stem}.aseprite`;
 assets.push({id,runtime,sha256:await hash(runtime),input,input_sha256:await hash(input),editable,editable_sha256:await hash(editable),generation_task:tasks[name],config,status:'integrated_preview',visual_review:'pending_user_review',redistribution_review:'not_performed_this_turn'});
}
const references={};for(const p of ['docs/production/style-v2/candidate-02.png','public/assets/hero-atlas.png'])references[p]=await hash(p);
const preparation='tools/prepare-camp-v2.lua';
await fs.writeFile(`${root}/manifest.json`,JSON.stringify({version:2,date:new Date().toISOString(),scope:'Tingyu lodge, pine, healer and stone; not all-map art completion',direction:'continued by user after style-v2 review; not final asset approval',user_approval:'pending',generator:'built-in image_gen',preparation,preparation_sha256:await hash(preparation),references,assets,checks:'runtime/checks.json'},null,2)+'\n');
console.log('Recorded V2 identities; historical V1 manifest unchanged.');
