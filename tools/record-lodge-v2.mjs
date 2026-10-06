import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {LODGE_ART} from '../src/lodge-assets.js';
const root='docs/production/lodge-v2';
const hash=async path=>createHash('sha256').update(await fs.readFile(path)).digest('hex');
const tasks={room:'exec-a9cd88b8-2cfa-4df5-884b-31e43243a1e7',bed:'exec-a2d2de5a-83c3-4737-9e47-01cf08867b5d',workbench:'exec-b20ff595-8022-4764-8c7b-3d192834157d'};
const assets=[];
for(const [id,config] of Object.entries(LODGE_ART)){
 const name=id.replace('lodge-',''),runtime=`public${config.src}`,source=`${root}/source/${name}.png`,editable=`${root}/${name}.aseprite`;
 const buf=await fs.readFile(runtime);
 assets.push({id,runtime,sha256:await hash(runtime),source,source_sha256:await hash(source),editable,editable_sha256:await hash(editable),generation_task:tasks[name],width:buf.readUInt32BE(16),height:buf.readUInt32BE(20),config,status:'integrated_preview',user_approval:'pending'});
}
const reference='docs/production/camp-v2/source/lodge.png',preparation='tools/prepare-lodge-v2.lua';
await fs.writeFile(`${root}/manifest.json`,JSON.stringify({version:2,date:new Date().toISOString(),scope:'lodge interior only',generator:'built-in image_gen',reference,reference_sha256:await hash(reference),preparation,preparation_sha256:await hash(preparation),assets,user_approval:'pending',notes:['Aseprite registration/resampling is not hand-pixelled retouch','workbench-original.png is the unchanged archived generator output; workbench.png is its identical preparation input','No private music or new third-party source used; no remote publication this turn']},null,2)+'\n');
