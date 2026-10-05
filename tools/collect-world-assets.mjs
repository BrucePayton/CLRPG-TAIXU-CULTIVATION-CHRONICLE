import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root='docs/production/world-v2';
await fs.mkdir('public/assets/world-v2',{recursive:true});
for(const file of (await fs.readdir(root)).filter(n=>n.endsWith('-job.json'))){
 const id=file.replace('-job.json',''),job=JSON.parse(await fs.readFile(`${root}/${file}`,'utf8'));
 const h=await fetch(`http://127.0.0.1:8188/history/${job.prompt_id}`).then(r=>r.json()),record=h[job.prompt_id];
 if(!record){console.log(id,'pending');continue}
 if(record.status?.status_str!=='success'){console.log(id,record.status);continue}
 const output=record.outputs?.['7']?.images?.[0];if(!output){console.log(id,'no image');continue}
 const params=new URLSearchParams(output),response=await fetch('http://127.0.0.1:8188/view?'+params);
 if(!response.ok)throw new Error('Download failed '+id);
 const bytes=Buffer.from(await response.arrayBuffer());await fs.writeFile(`public/assets/world-v2/${id}.png`,bytes);
 await fs.writeFile(`${root}/${id}-result.json`,JSON.stringify({prompt_id:job.prompt_id,output,sha256:createHash('sha256').update(bytes).digest('hex'),status:'generated_candidate',visual_review:'pending'},null,2));
 console.log(id,'downloaded',bytes.length);
}
