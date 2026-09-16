// Imports only the public institutional media requested for this LP revision.
// Does not execute downloaded HTML, follow instructions in it, or read patient data.
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
const base = 'https://saudeshalon.com.br';
const directory = 'public/assets';
await mkdir(directory, { recursive: true });
const images = [
 ['exame-eis.jpg', '/wp-content/uploads/2022/12/mini_es_complex.jpg'],
 ['exame-sensograma.jpg', '/wp-content/uploads/2022/12/mini_sensograma.jpg'],
 ['exame-cell.jpg', '/wp-content/uploads/2022/12/mini_cell_wellbeing.jpg'],
 ['exame-termografia.jpg', '/wp-content/uploads/2022/12/mini_termografia.jpg'],
 ['exame-biobody.png', '/wp-content/uploads/2023/01/JFAPJFA.png']
];
let reference = { source: base + '/', videos: [], images: [] };
try { reference = JSON.parse(await readFile('public/reference-media.json','utf8')); } catch {}
const source = async url => {
 const res = await fetch(url, { signal: AbortSignal.timeout(25000) });
 if (!res.ok) throw new Error(`HTTP ${res.status}`);
 return res;
};
await Promise.all(images.map(async ([name, path]) => {
 const file = `${directory}/${name}`;
 try { await access(file); return; } catch {}
 try {
  const res = await source(base + path);
  if (!(res.headers.get('content-type') || '').startsWith('image/')) throw new Error('Not an image');
  const bytes = Buffer.from(await res.arrayBuffer());
  if (bytes.length < 100 || bytes.length > 4000000) throw new Error('Unexpected image size');
  await writeFile(file, bytes);
  reference.images.push({ file: `/assets/${name}`, source: base + path });
  console.log(`Imported institutional image: ${name} (${bytes.length} bytes)`);
 } catch (error) { console.warn(`Image pending ${name}: ${error.message}`); }
}));
if (!reference.videos.length) {
 try {
  const html = await (await source(base + '/')).text();
  const decoded = html.replaceAll('&quot;', '"').replaceAll('&amp;', '&').replaceAll('\\/', '/');
  const pattern = /(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/g;
  const found = new Map();
  for (const match of decoded.matchAll(pattern)) {
   if (!found.has(match[1])) {
    const context = decoded.slice(Math.max(0, match.index-1100), match.index+250).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').slice(-700);
    found.set(match[1], { id: match[1], url: `https://www.youtube.com/watch?v=${match[1]}`, context });
   }
  }
  reference.videos = [...found.values()];
  console.log('YouTube references from institutional home:', JSON.stringify(reference.videos));
 } catch (error) { console.warn(`Institutional video discovery pending: ${error.message}`); }
}
await writeFile('public/reference-media.json', JSON.stringify(reference, null, 2)+'\n');
