import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
export async function prepareAssets(root) {
  const items = JSON.parse(await readFile(resolve(root, 'assets.manifest.json'), 'utf8'));
  for (const item of items) {
    const dest = resolve(root, 'public', item.path);
    try { await access(dest); continue; } catch { /* Download once, then use repository assets. */ }
    let saved = false;
    for (const url of item.sources) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(45000), redirect: 'follow' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const bytes = Buffer.from(await response.arrayBuffer());
        const type = response.headers.get('content-type') || '';
        if (!type.startsWith('image/') || bytes.length < 100 || bytes.length > 4_000_000) throw new Error('Resposta não é uma imagem otimizada válida');
        await mkdir(dirname(dest), { recursive: true });
        await writeFile(dest, bytes);
        console.log(`Asset preparado: ${item.path} (${bytes.length} bytes)`);
        saved = true;
        break;
      } catch (error) { console.warn(`Fonte indisponível para ${item.path}: ${error.message}`); }
    }
    if (!saved) throw new Error(`Não foi possível preparar ${item.path}. Adicione a imagem aprovada em public/${item.path} e execute o build novamente.`);
  }
}
