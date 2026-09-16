import {readFile,writeFile} from 'node:fs/promises';
// Only metadata for video URLs already extracted from the requested institutional site.
const file='public/reference-media.json';
const data=JSON.parse(await readFile(file,'utf8'));
for(const video of data.videos){
 if(video.title) continue;
 if(!/^[\w-]{11}$/.test(video.id)) throw new Error('Invalid source video id');
 try{
  const res=await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(video.url)}&format=json`,{signal:AbortSignal.timeout(15000)});
  if(!res.ok) throw new Error(`HTTP ${res.status}`);
  const info=await res.json();
  video.title=info.title;video.author=info.author_name;
  video.provider=info.provider_name;
  console.log(JSON.stringify({id:video.id,title:video.title,author:video.author}));
 }catch(error){console.warn(`Video metadata not confirmed for ${video.id}: ${error.message}`);}
}
await writeFile(file,JSON.stringify(data,null,2)+'\n');
