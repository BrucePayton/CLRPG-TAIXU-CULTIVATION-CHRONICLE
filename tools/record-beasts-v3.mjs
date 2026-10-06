import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {BEAST_ART} from '../src/beast-assets.js';
const root='docs/production/beasts-v3',hash=async p=>createHash('sha256').update(await fs.readFile(p)).digest('hex');
const assets=[];
for(const [id,config] of Object.entries(BEAST_ART)){
 const paths={source:`${root}/source/${id}.png`,editable:`${root}/${id}.aseprite`,runtime:`public${config.src}`,audio:`public/audio/beasts-v3/${id}.wav`};
 const hashes=Object.fromEntries(await Promise.all(Object.entries(paths).map(async([k,p])=>[k,await hash(p)])));
 const job=JSON.parse(await fs.readFile(`${root}/audio/${id}-result.json`));
 assets.push({id,config,paths,hashes,audio_job:job.id,audio_backend:job.artifacts[0].backend,audio_quality:job.quality});
}
await fs.writeFile(`${root}/manifest.json`,JSON.stringify({date:new Date().toISOString(),status:'integrated_preview',user_approval:'pending',listening_review:'pending; mechanical/browser playback checks are not subjective approval',art_generator:'built-in image_gen',preparation:'Aseprite nearest-neighbour registration, binary alpha, 2px padding; not hand-pixelled art',reference:'docs/production/camp-v2/same-scale.png',assets},null,2)+'\n');
