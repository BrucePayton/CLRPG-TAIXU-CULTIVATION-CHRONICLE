import fs from 'node:fs/promises';
const jobs={deer:'575cb3e9-7423-4981-8c3e-6f7a22d13717',boar:'b180c5e0-9a8f-4620-8f26-ad0a488d13b5',wolf:'225bfabd-5487-45bb-9e44-05fb6a1781fb'};
await fs.mkdir('public/audio/beasts-v3',{recursive:true});
for(const [species,id] of Object.entries(jobs)){
 const response=await fetch(`http://127.0.0.1:8200/api/jobs/${id}`);
 if(!response.ok)throw Error(`Job HTTP ${response.status}`);
 const job=await response.json();
 if(job.status!=='succeeded'||!job.quality.mechanical_passed)throw Error(`${species}: ${job.status}`);
 await fs.writeFile(`docs/production/beasts-v3/audio/${species}-result.json`,JSON.stringify(job,null,2)+'\n');
 const asset=job.artifacts[0],r=await fetch(`http://127.0.0.1:8200${asset.content_url}`);
 if(!r.ok)throw Error(`Asset HTTP ${r.status}`);
 await fs.writeFile(`public/audio/beasts-v3/${species}.wav`,Buffer.from(await r.arrayBuffer()));
 console.log(species,job.quality);
}
