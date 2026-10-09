export type TemplateId = 'bakery' | 'restaurant' | 'shop';
export type SectionType = 'hero' | 'offerings' | 'story' | 'gallery' | 'quote' | 'contact' | 'canvas';
export type Layout = 'split' | 'cover' | 'editorial' | 'cinema' | 'bento';
export interface Item { title: string; description: string; price: string }
export interface Block {
  id: string; type: 'text' | 'image' | 'button'; text: string; image: string;
  alt: string; href: string; x: number; y: number; width: number; size: number;
}
export interface Section {
  id: string; type: SectionType; visible: boolean; eyebrow: string; title: string;
  text: string; image: string; alt: string; button: string; href: string;
  items: Item[]; images: { src: string; alt: string }[]; blocks: Block[]; height: number;
  menuMode?: 'items' | 'image';
}
export interface Project {
  version: 1; id: string; name: string; template: TemplateId; updatedAt: string;
  business: { name: string; tagline: string; phone: string; email: string; address: string; hours: string; instagram: string; language: 'it' | 'en' };
  seo: { title: string; description: string; domain: string };
  design: { theme: string; accent: string; background: string; text: string; font: 'serif' | 'sans'; layout: Layout; radius: number; motion: boolean };
  sections: Section[];
}
export interface ProjectSummary { id: string; name: string; template: TemplateId; updatedAt: string }

export const themes = [
  { id: 'olive', name: 'Oliva e lino', accent: '#435742', background: '#f7f5ec', text: '#293b2b', font: 'serif' as const },
  { id: 'clay', name: 'Terracotta', accent: '#8f3829', background: '#fcf6e9', text: '#492a20', font: 'serif' as const },
  { id: 'night', name: 'Dopo il tramonto', accent: '#d8b56c', background: '#191d1a', text: '#f7f2e8', font: 'serif' as const },
  { id: 'coast', name: 'Costa azzurra', accent: '#28658a', background: '#f2f7f9', text: '#233d4a', font: 'sans' as const },
  { id: 'rose', name: 'Rosa di paese', accent: '#88445b', background: '#faf1f3', text: '#432c37', font: 'serif' as const },
  { id: 'studio', name: 'Studio essenziale', accent: '#262626', background: '#faf9f6', text: '#262626', font: 'sans' as const },
  { id: 'cinema', name: 'Cinema, a tavola', accent: '#e5d2a8', background: '#151514', text: '#f6f1e6', font: 'serif' as const },
  { id: 'espresso', name: 'Espresso club', accent: '#f5e8a4', background: '#211b17', text: '#fcf5e5', font: 'sans' as const },
  { id: 'bento', name: 'Bento notturno', accent: '#ded8c5', background: '#101210', text: '#ede9dc', font: 'serif' as const },
  { id: 'carta', name: 'Carta editoriale', accent: '#34352f', background: '#faf9f5', text: '#34352f', font: 'sans' as const },
];
export const sectionNames: Record<SectionType, string> = {
  hero: 'Copertina', offerings: 'Menu / prodotti', story: 'La nostra storia', gallery: 'Galleria', quote: 'Citazione', contact: 'Contatti', canvas: 'Spazio libero',
};
export const templateInfo: { id: TemplateId; name: string; category: string; description: string; image: string; theme: string }[] = [
  { id: 'bakery', name: 'Forno', category: 'Panifici e caffè', description: 'Caldo, artigianale, un po’ di casa.', image: '/photos/bread.jpg', theme: 'clay' },
  { id: 'restaurant', name: 'Oliva', category: 'Ristoranti e trattorie', description: 'Sapori di territorio, eleganza senza fretta.', image: '/photos/restaurant.jpg', theme: 'olive' },
  { id: 'shop', name: 'Forma', category: 'Negozi e boutique', description: 'Spazi ariosi. Oggetti che si fanno notare.', image: '/photos/shop.jpg', theme: 'studio' },
];
/** Longest text field, in UTF-16 units; the server's valid_project uses the same limit. */
export const MAX_TEXT = 20000;
export function uid(): string { return crypto.randomUUID(); }
export function clone<T>(value: T): T { return structuredClone(value); }
export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
export function safeUrl(value: string): string {
  const clean = value.trim();
  if (/^(https?:\/\/|mailto:|tel:|#[a-z\d_-]*$)/i.test(clean)) return clean;
  if (/^\/(photos|media)\/[a-z\d_.-]+$/i.test(clean)) return clean;
  if (/^assets\/[a-z\d_.-]+$/i.test(clean)) return clean;
  // People type "www.prenota.it" or "instagram.com/forno"; a bare domain still means a web address.
  if (/^(?:[a-z\d](?:[a-z\d-]*[a-z\d])?\.)+[a-z]{2,}(?:[/?#][^\s"'<>]*)?$/i.test(clean)) return `https://${clean}`;
  return '#';
}
export function color(value: string, fallback: string): string { return /^#[\da-f]{6}$/i.test(value) ? value : fallback; }
export function number(value: number, min: number, max: number): number { return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min)); }
export function newBlock(type: Block['type']): Block {
  return { id: uid(), type, text: type === 'button' ? 'Scopri di più' : 'Una bella idea\ninizia qui.', image: '/photos/cafe.jpg', alt: 'Interno del locale', href: '#contact', x: 8, y: 12, width: type === 'button' ? 24 : 40, size: type === 'text' ? 48 : 18 };
}
export function newSection(type: SectionType): Section {
  return {
    id: uid(), type, visible: true, eyebrow: 'Fatto con passione',
    title: ({ hero: 'Il bello è vicino.', offerings: 'Le nostre specialità', story: 'Una storia di famiglia.', gallery: 'Uno sguardo da vicino', quote: 'Le cose buone si riconoscono.', contact: 'Ti aspettiamo.', canvas: 'Spazio alle tue idee.' })[type],
    text: 'Ogni giorno mettiamo cura, tempo e un po’ di noi in quello che facciamo. Passa a trovarci: ci farà piacere conoscerti.',
    image: '/photos/cafe.jpg', alt: 'Uno scorcio del nostro locale', button: 'Vieni a trovarci', href: '#contact',
    items: [ { title: 'Una specialità di casa', description: 'Ingredienti scelti, preparati con cura.', price: '€ 8' }, { title: 'Il nostro preferito', description: 'Un piccolo piacere, ogni giorno.', price: '€ 6' }, { title: 'Da condividere', description: 'Le cose belle sono ancora più belle insieme.', price: '€ 12' } ],
    images: [{ src: '/photos/pastry.jpg', alt: 'Una delle nostre specialità' }, { src: '/photos/cafe.jpg', alt: 'Il nostro spazio' }, { src: '/photos/bread.jpg', alt: 'Dettagli del nostro lavoro' }],
    blocks: type === 'canvas' ? [newBlock('text'), { ...newBlock('image'), x: 55, y: 10, width: 38 }] : [], height: 480,
  };
}
export function createProject(template: TemplateId, name?: string): Project {
  const info = templateInfo.find(t => t.id === template)!;
  const theme = themes.find(t => t.id === info.theme)!;
  const project: Project = {
    version: 1, id: uid(), name: name?.trim() || `${info.name} — nuovo sito`, template, updatedAt: new Date().toISOString(),
    business: { name: info.name, tagline: 'Una piccola eccellenza, vicino a te.', phone: '', email: '', address: 'Il tuo indirizzo, la tua città', hours: 'Lun–Sab  08:00–19:00\nDomenica  08:00–13:00', instagram: '', language: 'it' },
    seo: { title: `${info.name} | ${info.category}`, description: info.description, domain: '' },
    design: { ...theme, theme: theme.id, layout: template === 'restaurant' ? 'cover' : template === 'shop' ? 'editorial' : 'split', radius: template === 'shop' ? 0 : 6, motion: true },
    sections: ['hero', 'offerings', 'story', 'gallery', 'contact'].map(t => newSection(t as SectionType)),
  };
  const [hero, offerings, story, gallery] = project.sections;
  hero.image = info.image; hero.alt = info.category; story.image = '/photos/cafe.jpg';
  if (template === 'bakery') {
    hero.eyebrow = 'Il tuo forno di quartiere'; hero.title = 'Il buongiorno\nha un altro\nsapore.';
    hero.text = 'Pane fatto a mano, caffè che profuma di casa e qualcosa di buono, ogni giorno. Dal nostro forno, con amore.'; hero.button = 'Scopri le nostre bontà'; hero.href = '#offerings';
    offerings.eyebrow = 'Farina, acqua, tempo'; offerings.title = 'Poche cose. Fatte bene.';
    offerings.items = [{ title: 'Pane a lievitazione naturale', description: 'Crosta croccante, cuore morbido. 24 ore di pazienza.', price: 'da € 4' }, { title: 'Colazioni felici', description: 'Cornetti appena sfornati e il tuo caffè preferito.', price: 'da € 3' }, { title: 'Dolci di casa', description: 'Ricette di famiglia, una fetta alla volta.', price: 'da € 5' }];
    story.title = 'Le mani in pasta.\nIl cuore in paese.'; story.text = 'Crediamo nelle cose semplici: una buona farina, il tempo giusto e il piacere di fare bene. Il nostro forno è un posto per fermarsi, scambiare due parole e sentirsi a casa.';
    gallery.title = 'Piccoli momenti,\ngrandi bontà.';
  } else if (template === 'restaurant') {
    hero.eyebrow = 'Cucina di territorio'; hero.title = 'A tavola,\ncome a casa.'; hero.text = 'La stagione nel piatto, il territorio nel cuore. Una cucina sincera, da assaporare senza fretta.'; hero.button = 'Vieni a trovarci';
    offerings.title = 'Il gusto della stagione.'; offerings.eyebrow = 'Dalla nostra cucina';
    offerings.items = [{ title: 'Tagliatelle fatte a mano', description: 'Pasta fresca, ragù della casa, Parmigiano.', price: '€ 14' }, { title: 'Il piatto dell’orto', description: 'Verdure di stagione, erbe fresche e olio buono.', price: '€ 12' }, { title: 'Il dolce della domenica', description: 'Una ricetta di famiglia, per finire in bellezza.', price: '€ 7' }];
    story.title = 'La nostra tavola\nracconta una storia.'; story.text = 'Scegliamo produttori vicini e ingredienti che rispettano le stagioni. Li portiamo a tavola con semplicità, perché le cose buone hanno già tutto quello che serve.';
    gallery.images = [{ src: '/photos/restaurant.jpg', alt: 'Un piatto della nostra cucina' }, { src: '/photos/cafe.jpg', alt: 'La sala del ristorante' }, { src: '/photos/pastry.jpg', alt: 'Un dolce della casa' }];
  } else {
    hero.eyebrow = 'Oggetti, storie, persone'; hero.title = 'Il bello,\nogni giorno.'; hero.text = 'Una selezione di cose speciali, scelte per durare. Scopri il tuo prossimo piccolo grande amore.'; hero.button = 'Esplora la selezione'; hero.href = '#offerings';
    offerings.title = 'Scelti con cura.'; offerings.eyebrow = 'La nostra selezione';
    offerings.items = [{ title: 'Per la casa', description: 'Dettagli che cambiano il tuo spazio.', price: '' }, { title: 'Da indossare', description: 'Materiali belli, linee senza tempo.', price: '' }, { title: 'Da regalare', description: 'Un pensiero che si fa ricordare.', price: '' }];
    story.title = 'Meno cose.\nPiù significato.'; story.text = 'Ci piacciono gli oggetti con una storia. Cerchiamo piccoli marchi, artigiani e idee belle da portare nella vita di tutti i giorni. Il nostro negozio è fatto di queste scoperte.'; story.image = info.image;
    gallery.images = [{ src: '/photos/shop.jpg', alt: 'La nostra boutique' }, { src: '/photos/cafe.jpg', alt: 'Dettagli dello spazio' }, { src: '/photos/restaurant.jpg', alt: 'Ispirazioni quotidiane' }];
  }
  return project;
}

// Imports are treated as untrusted data; renderers also escape every field.
export function validateProject(value: unknown): Project {
  if (!value || typeof value !== 'object') throw new Error('Il file non contiene un progetto Webby.');
  const p = value as Project;
  const isString = (v: unknown) => typeof v === 'string' && v.length <= MAX_TEXT;
  if (p.version !== 1 || !isString(p.id) || !/^[\w-]{1,100}$/.test(p.id) || !isString(p.name)
    || !templateInfo.some(t => t.id === p.template) || !p.business || !p.seo || !p.design
    || !Array.isArray(p.sections) || p.sections.length > 50) throw new Error('Formato del progetto non valido.');
  for (const key of ['name', 'tagline', 'phone', 'email', 'address', 'hours', 'instagram'] as const) {
    if (!isString(p.business[key])) throw new Error('Dati attività non validi.');
  }
  if (!['it', 'en'].includes(p.business.language) || !['serif', 'sans'].includes(p.design.font)
    || !['split', 'cover', 'editorial', 'cinema', 'bento'].includes(p.design.layout) || !Number.isFinite(p.design.radius)
    || typeof p.design.motion !== 'boolean' || !isString(p.design.theme)
    || ![p.design.accent, p.design.background, p.design.text].every(c => /^#[\da-f]{6}$/i.test(c))
    || ![p.seo.title, p.seo.description, p.seo.domain].every(isString)) throw new Error('Stile o impostazioni non validi.');
  const ids = new Set<string>();
  for (const s of p.sections) {
    if (!s || !Object.hasOwn(sectionNames, s.type) || !isString(s.id) || !/^[\w-]{1,100}$/.test(s.id) || ids.has(s.id)
      || (s.menuMode !== undefined && !['items', 'image'].includes(s.menuMode))
      || typeof s.visible !== 'boolean' || !Number.isFinite(s.height)
      || ![s.eyebrow, s.title, s.text, s.image, s.alt, s.button, s.href].every(isString)
      || !Array.isArray(s.items) || s.items.length > 30 || !Array.isArray(s.images) || s.images.length > 20
      || !Array.isArray(s.blocks) || s.blocks.length > 40) throw new Error('Una sezione non è valida.');
    ids.add(s.id);
    for (const item of s.items) if (!item || ![item.title, item.description, item.price].every(isString)) throw new Error('Prodotti non validi.');
    for (const img of s.images) if (!img || ![img.src, img.alt].every(isString)) throw new Error('Immagini non valide.');
    for (const b of s.blocks) {
      if (!b || !['text', 'image', 'button'].includes(b.type) || !isString(b.id) || !/^[\w-]{1,100}$/.test(b.id) || ids.has(b.id)
        || ![b.text, b.image, b.alt, b.href].every(isString) || ![b.x, b.y, b.width, b.size].every(Number.isFinite)) throw new Error('Elemento libero non valido.');
      ids.add(b.id);
    }
  }
  return clone(p);
}
export function imageSources(p: Project): string[] {
  return [...new Set(p.sections.filter(s => s.visible).flatMap(s => [
    ...(['hero', 'story'].includes(s.type) ? [s.image] : []),
    ...(s.type === 'hero' && p.design.layout === 'bento' ? s.images.slice(0, 2).map(i => i.src) : []),
    ...(s.type === 'offerings' && s.menuMode === 'image' ? [s.image] : []),
    ...(s.type === 'gallery' ? s.images.map(i => i.src) : []),
    ...(s.type === 'canvas' ? s.blocks.filter(b => b.type === 'image').map(b => b.image) : []),
  ]).filter(Boolean))];
}
export function allImageSources(p: Project): string[] {
  return [...new Set(p.sections.flatMap(s => [s.image, ...s.images.map(i => i.src), ...s.blocks.map(b => b.image)]).filter(Boolean))];
}
