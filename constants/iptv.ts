/* 📺 Fuentes de TV en vivo (iptv-org: canales públicos y gratuitos de todo el mundo) */
export const IPTV_BASE = 'https://iptv-org.github.io';
export const IPTV_COUNTRIES_URL = `${IPTV_BASE}/api/countries.json`;
export const IPTV_CATEGORIES_URL = `${IPTV_BASE}/api/categories.json`;
export const IPTV_ALL_URL = `${IPTV_BASE}/iptv/index.m3u`;
export const iptvCountryUrl = (code: string) => `${IPTV_BASE}/iptv/countries/${code.toLowerCase()}.m3u`;
export const iptvCategoryUrl = (id: string) => `${IPTV_BASE}/iptv/categories/${id}.m3u`;

/* 🎬 Películas y series de dominio público (Internet Archive) */
export const ARCHIVE_BASE = 'https://archive.org';
export const MOVIES_COLLECTION = 'feature_films';
export const SERIES_COLLECTION = 'classic_tv';

export const MOVIE_GENRES = [
  { label: 'Todo', subject: '' },
  { label: 'Comedia', subject: 'comedy' },
  { label: 'Terror', subject: 'horror' },
  { label: 'Ciencia ficción', subject: 'science fiction' },
  { label: 'Drama', subject: 'drama' },
  { label: 'Western', subject: 'western' },
  { label: 'Misterio', subject: 'mystery' },
  { label: 'Cine negro', subject: 'film noir' },
  { label: 'Animación', subject: 'animation' },
];

export const SERIES_GENRES = [
  { label: 'Todo', subject: '' },
  { label: 'Western', subject: 'western' },
  { label: 'Comedia', subject: 'comedy' },
  { label: 'Misterio', subject: 'mystery' },
  { label: 'Aventura', subject: 'adventure' },
  { label: 'Ciencia ficción', subject: 'science fiction' },
];
