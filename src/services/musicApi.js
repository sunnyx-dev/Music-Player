const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

function decodeHtml(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

async function fetchYoutube(endpoint, params = {}) {
  if (!API_KEY) {
    console.error('YouTube API Key is missing. Add VITE_YOUTUBE_API_KEY to .env');
    return null;
  }
  
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('key', API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const key = url.toString();

  if (cache.has(key)) {
    const { data, ts } = cache.get(key);
    if (Date.now() - ts < CACHE_TTL) return data;
  }

  try {
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    cache.set(key, { data, ts: Date.now() });
    return data;
  } catch (err) {
    console.warn('YouTube API Error:', err);
    return null;
  }
}

function normalizeYoutubeVideo(item) {
  if (!item) return null;
  return {
    id: item.id.videoId || item.id,
    name: item.snippet ? decodeHtml(item.snippet.title) : 'Unknown',
    artist: item.snippet ? decodeHtml(item.snippet.channelTitle) : 'Unknown',
    album: '',
    image: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || '',
    url: '', // Ignored by YT iframe player
    duration: 0,
    year: item.snippet?.publishedAt?.substring(0, 4) || '',
    language: 'unknown',
    playCount: 0,
  };
}

export async function searchSongs(query, limit = 20) {
  const data = await fetchYoutube('/search', { part: 'snippet', q: query, type: 'video', videoCategoryId: '10', maxResults: limit });
  if (!data?.items) return [];
  return data.items.filter(i => i.id?.videoId).map(normalizeYoutubeVideo);
}

export async function searchAll(query) {
  return searchSongs(query, 20);
}

export async function getSongById(id) {
  const data = await fetchYoutube('/videos', { part: 'snippet', id });
  if (!data?.items?.length) return [];
  return [normalizeYoutubeVideo(data.items[0])];
}

export async function getPlaylistById(id) {
  return [];
}

export async function getAlbumById(id) {
  return [];
}

export async function getArtistById(id) {
  return null;
}

export async function getArtistSongs(id, page = 0) {
  return [];
}

export async function getTrending() {
  const queries = ['trending music video 2024', 'latest top hits', 'popular songs right now', 'billboard hot 100'];
  const q = queries[Math.floor(Math.random() * queries.length)];
  return searchSongs(q, 20);
}

export async function getSongsByMood(mood) {
  return searchSongs(`${mood} music`, 20);
}

export async function getRecommendations(songName, artistName) {
  const query = artistName || songName ? `${songName || ''} ${artistName || ''} similar songs`.trim() : 'top music hits';
  return searchSongs(query, 15);
}

export { normalizeYoutubeVideo as normalizeSong };
