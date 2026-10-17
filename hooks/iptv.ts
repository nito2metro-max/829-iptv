import { IPTV_CATEGORIES_URL, IPTV_COUNTRIES_URL } from '@/constants/iptv';

export type Channel = {
  id: string;
  name: string;
  logo: string | null;
  group: string;
  url: string;
  referrer?: string;
  userAgent?: string;
};

export type Country = { name: string; code: string; flag: string };
export type Category = { id: string; name: string };

const attr = (line: string, key: string) => {
  const m = line.match(new RegExp(`${key}="([^"]*)"`));
  return m ? m[1] : '';
};

/* 📄 Parser M3U / M3U8 (formato estándar de listas IPTV) */
export function parseM3U(text: string): Channel[] {
  const lines = text.split(/\r?\n/);
  const channels: Channel[] = [];
  let pending: Omit<Channel, 'url' | 'id'> | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF')) {
      const comma = line.lastIndexOf(',');
      pending = {
        name: (comma >= 0 ? line.slice(comma + 1) : '').trim() || 'Sin nombre',
        logo: attr(line, 'tvg-logo') || null,
        group: attr(line, 'group-title').split(';')[0] || 'General',
        referrer: attr(line, 'http-referrer') || undefined,
        userAgent: attr(line, 'http-user-agent') || undefined,
      };
    } else if (line.startsWith('#EXTVLCOPT') && pending) {
      const [k, ...v] = line.slice(line.indexOf(':') + 1).split('=');
      if (k === 'http-referrer') pending.referrer = v.join('=');
      if (k === 'http-user-agent') pending.userAgent = v.join('=');
    } else if (!line.startsWith('#') && pending) {
      channels.push({ ...pending, url: line, id: `${channels.length}-${line}` });
      pending = null;
    }
  }
  return channels;
}

export async function fetchPlaylist(url: string): Promise<Channel[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parseM3U(await res.text());
}

export async function fetchCountries(): Promise<Country[]> {
  const res = await fetch(IPTV_COUNTRIES_URL);
  const json: Country[] = await res.json();
  return json.sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(IPTV_CATEGORIES_URL);
  const json: Category[] = await res.json();
  return json.sort((a, b) => a.name.localeCompare(b.name));
}
