import { readFile, writeFile, mkdir, readdir, copyFile, rm } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { renderSite } from './site.ts';
import { imageSources, validateProject } from './model.ts';

const json = async path => JSON.parse(await readFile(path, 'utf8'));
const save = (path, data) => writeFile(path, JSON.stringify(data, null, 2) + '\n');
const assetNames = asset => [asset.src, ...(asset.srcset || '').split(',').map(s => s.trim().split(' ')[0])].filter(Boolean);

async function copyAssets(from, to) {
  await mkdir(to, { recursive: true });
  for (const entry of await readdir(from, { withFileTypes: true }).catch(() => [])) {
    if (!entry.isFile() || !/^[a-f0-9-]+\.(webp|jpg|png)$/.test(entry.name)) throw new Error('Invalid release asset');
    await copyFile(join(from, entry.name), join(to, entry.name));
  }
}

export async function runRelease({ root = process.cwd(), now = new Date(), event = 'push' } = {}) {
  const project = validateProject(await json(join(root, 'webby/project.json')));
  const images = await json(join(root, 'webby/images.json'));
  const schedulePath = join(root, '.webby/schedules.json');
  const state = await json(schedulePath).catch(error => { if (error.code === 'ENOENT') return { releases: [], heartbeatAt: now.toISOString() }; throw error; });
  const due = state.releases.filter(r => r.status === 'pending' && Date.parse(r.dueAt) <= now.getTime()).sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt) || a.id.localeCompare(b.id));
  let repoChanged = false;
  for (const release of due) {
    if (!/^[\w-]{1,100}$/.test(release.id)) throw new Error('Invalid release ID');
    const section = project.sections.find(s => s.id === release.sectionId && s.type === 'offerings');
    if (!section) { release.status = 'failed'; release.error = 'La sezione del menu è stata rimossa.'; repoChanged = true; continue; }
    try {
      const folder = join(root, 'scheduled', release.id);
      const payload = await json(join(folder, 'release.json'));
      const candidate = structuredClone(project);
      const target = candidate.sections.find(s => s.id === release.sectionId);
      for (const key of ['menuMode', 'items', 'image', 'alt']) target[key] = payload.patch[key];
      validateProject(candidate);
      if (target.menuMode === 'image') {
        const asset = payload.images[target.image];
        if (!asset || !asset.src || !/^webby\/assets\/[a-f\d]+\.(webp|jpg|png)$/.test(target.image)) throw new Error('Immagine del menu non disponibile.');
        await readFile(join(folder, target.image));
        for (const name of assetNames(asset)) {
          if (!/^assets\/[a-f\d-]+\.(webp|jpg)$/.test(name)) throw new Error('Percorso immagine non valido.');
          await readFile(join(folder, 'site', name));
        }
      }
      await copyAssets(join(folder, 'webby/assets'), join(root, 'webby/assets'));
      await copyAssets(join(folder, 'site/assets'), join(root, 'site/assets'));
      for (const key of ['menuMode', 'items', 'image', 'alt']) section[key] = payload.patch[key];
      Object.assign(images, payload.images);
      release.status = 'applied'; release.appliedAt = now.toISOString();
    } catch (error) { release.status = 'failed'; release.error = 'Menu non applicato: ' + String(error.message).slice(0, 200); }
    repoChanged = true;
  }
  const pending = state.releases.some(r => r.status === 'pending');
  if (pending && now.getTime() - (Date.parse(state.heartbeatAt) || 0) > 25 * 86400000) {
    state.heartbeatAt = now.toISOString(); repoChanged = true;
  }
  if (repoChanged) {
    await save(schedulePath, state); await save(join(root, 'webby/project.json'), project); await save(join(root, 'webby/images.json'), images);
  }
  const html = renderSite(project, { images });
  const old = await readFile(join(root, 'site/index.html'), 'utf8').catch(() => '');
  const siteChanged = old !== html;
  await mkdir(join(root, 'site'), { recursive: true });
  await writeFile(join(root, 'site/index.html'), html);
  const needed = new Set();
  for (const source of imageSources(project)) {
    const asset = images[source]; if (!asset) throw new Error(`Missing published image: ${source}`);
    for (const name of assetNames(asset)) {
      if (!/^assets\/[a-f\d-]+\.(webp|jpg)$/.test(name)) throw new Error('Invalid published image path');
      needed.add(name.slice(7));
      await readFile(join(root, 'site', name));
    }
  }
  for (const filename of await readdir(join(root, 'site/assets')).catch(() => [])) {
    if (/^[a-f\d-]+\.(webp|jpg)$/.test(filename) && !needed.has(filename)) { await rm(join(root, 'site/assets', filename)); repoChanged = true; }
  }
  const deploy = event !== 'schedule' || siteChanged || due.some(r => r.status === 'applied');
  return { deploy, repoChanged: repoChanged || siteChanged, applied: due.filter(r => r.status === 'applied').map(r => r.id), failed: due.filter(r => r.status === 'failed').map(r => r.id) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = await runRelease({ event: process.env.GITHUB_EVENT_NAME || 'push' });
  if (process.env.GITHUB_OUTPUT) await writeFile(process.env.GITHUB_OUTPUT, `deploy=${result.deploy}\nrepo_changed=${result.repoChanged}\n`, { flag: 'a' });
  console.log(JSON.stringify(result));
}
