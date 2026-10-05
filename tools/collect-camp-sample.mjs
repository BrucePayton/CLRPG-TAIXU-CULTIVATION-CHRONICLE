import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root='docs/production/visual-v1',endpoint='http://127.0.0.1:8188';
for(const id of process.argv.slice(2)){
 const job=JSON.parse(await fs.readFile(`${root}/${id}-job.json`,'utf8'));
 const history=await fetch(`${endpoint}/history/${job.prompt_id}`).then(r=>r.json()),record=history[job.prompt_id];
 if(!record){console.log(id,'pending');continue}
 const output=record.outputs?.['7']?.images?.[0];if(record.status?.status_str!=='success'||!output)throw Error(JSON.stringify(record.status));
 const response=await fetch(`${endpoint}/view?${new URLSearchParams(output)}`);if(!response.ok)throw Error('Download failed');
 const bytes=Buffer.from(await response.arrayBuffer());await fs.writeFile(`${root}/${id}-candidate.png`,bytes);
 await fs.writeFile(`${root}/${id}-result.json`,JSON.stringify({prompt_id:job.prompt_id,output,sha256:createHash('sha256').update(bytes).digest('hex'),status:'generated_candidate',visual_review:'pending'},null,2));
 console.log(id,'collected');
}
