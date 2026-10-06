// Submit local MLX candidates. Never calls the platform approval endpoint.
import fs from 'node:fs/promises';
const root='docs/production/beasts-v3';await fs.mkdir(`${root}/audio`,{recursive:true});
const prompts={
 deer:'One brief natural deer alarm bark and breathy nasal snort, a startled wild deer close by, short rising hollow animal call then quiet decay, isolated dry wildlife sound effect, no speech, no music, no birds, no ambience, no echo',
 boar:'One short deep rough wild boar warning grunt followed by a forceful nasal snort, low throaty animal breath, close dry isolated wildlife game sound effect, no speech, no music, no squealing pig chorus, no ambience, no echo',
 wolf:'One short restrained threatening wolf growl with a low breathy ending, clearly canine, deep coarse animal throat, close dry isolated wildlife game sound effect, no howl chorus, no speech, no music, no ambience, no echo',
};
for(const [species,prompt] of Object.entries(prompts)){
 const request={workflow:{name:`太虚 ${species} 行为音效 V3`,category:'creature',nodes:[{id:'voice',kind:'generate',params:{prompt,duration:2}},{id:'cut',kind:'trim',inputs:['voice'],params:{start:0,duration:2}},{id:'fade',kind:'fade',inputs:['cut'],params:{in:.015,out:.12}},{id:'output',kind:'export',inputs:['fade'],params:{format:'wav',channels:1,loop:false,expected_duration:2,target_rms_dbfs:-24,max_boost_db:12}}],output:'output',style:{character:'isolated natural animal vocalization for Chinese cultivation game, no music or speech'}},seed:{deer:1041,boar:1042,wolf:1043}[species],backend:'mlx',idempotency_key:`taixu-beasts-v3-${species}-20261006-a`};
 await fs.writeFile(`${root}/audio/${species}-request.json`,JSON.stringify(request,null,2)+'\n');
 const res=await fetch('http://127.0.0.1:8200/api/jobs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(request)});const data=await res.json();if(!res.ok)throw new Error(JSON.stringify(data));
 await fs.writeFile(`${root}/audio/${species}-submitted.json`,JSON.stringify(data,null,2)+'\n');console.log(species,JSON.stringify(data));
}
