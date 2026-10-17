import { ARCHIVE_BASE } from '@/constants/iptv';

export type Title = {
  identifier: string;
  title: string;
  year?: number;
};

export type Episode = { name: string; title: string; url: string };

export type TitleDetail = {
  identifier: string;
  title: string;
  description: string;
  year?: string;
  episodes: Episode[];
};

export const posterUrl = (id: string) => `${ARCHIVE_BASE}/services/img/${id}`;

/* 🔍 Busca títulos de dominio público en una colección del Internet Archive */
export async function searchTitles(opts: {
  collection: string;
  query?: string;
  subject?: string;
  page?: number;
  rows?: number;
}): Promise<{ items: Title[]; total: number }> {
  const { collection, query, subject, page = 1, rows = 30 } = opts;
  const parts = [
    `collection:${collection}`,
    'mediatype:movies',
    'licenseurl:*publicdomain*',
    'format:(MPEG4 OR "h.264")',
  ];
  if (subject) parts.push(`subject:"${subject}"`);
  if (query?.trim()) parts.push(`title:(${query.trim().replace(/[():"]/g, ' ')})`);

  const params = new URLSearchParams({
    q: parts.join(' AND '),
    'fl[]': 'identifier',
    rows: String(rows),
    page: String(page),
    output: 'json',
    'sort[]': 'downloads desc',
  });
  params.append('fl[]', 'title');
  params.append('fl[]', 'year');

  const res = await fetch(`${ARCHIVE_BASE}/advancedsearch.php?${params}`);
  const json = await res.json();
  return { items: json.response?.docs ?? [], total: json.response?.numFound ?? 0 };
}

const first = (v: unknown) => (Array.isArray(v) ? v[0] : v) as string | undefined;
const stripHtml = (s: string) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

/* 🎞 Detalle + lista de archivos MP4 reproducibles (1 = película, varios = episodios) */
export async function fetchTitle(id: string): Promise<TitleDetail> {
  const res = await fetch(`${ARCHIVE_BASE}/metadata/${encodeURIComponent(id)}`);
  const json = await res.json();
  const meta = json.metadata ?? {};
  const files: { name: string; format?: string; title?: string }[] = json.files ?? [];

  const mp4 = files.filter(f => f.name.toLowerCase().endsWith('.mp4'));
  // Si hay una copia derivada (512kb) del mismo archivo, prefiere la original
  const byBase = new Map<string, (typeof mp4)[number]>();
  for (const f of mp4) {
    const base = f.name.replace(/(\.ia)?([._]512kb)?\.mp4$/i, '');
    const prev = byBase.get(base);
    if (!prev || /512kb/i.test(prev.name)) byBase.set(base, f);
  }

  const episodes = [...byBase.values()]
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
    .map(f => ({
      name: f.name,
      title: f.title || f.name.replace(/\.mp4$/i, '').replace(/[_]+/g, ' '),
      url: `${ARCHIVE_BASE}/download/${encodeURIComponent(id)}/${f.name
        .split('/')
        .map(encodeURIComponent)
        .join('/')}`,
    }));

  return {
    identifier: id,
    title: first(meta.title) ?? id,
    description: stripHtml(first(meta.description) ?? ''),
    year: first(meta.year) ?? first(meta.date)?.slice(0, 4),
    episodes,
  };
}
