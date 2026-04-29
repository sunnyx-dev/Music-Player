import { searchSongs } from './musicApi';
import { MOODS } from '../utils/constants';
import { loadFromStorage } from '../utils/helpers';

export function getAIDJSuggestions(currentSong, queue = [], count = 5) {
  if (!currentSong) return Promise.resolve([]);
  const query = currentSong.artist || currentSong.name;
  return searchSongs(query, count + queue.length).then(songs => {
    const queueIds = new Set(queue.map(s => s.id));
    queueIds.add(currentSong.id);
    return songs.filter(s => !queueIds.has(s.id)).slice(0, count);
  });
}

export async function generateMoodPlaylist(moodId) {
  const mood = MOODS.find(m => m.id === moodId);
  if (!mood) return [];
  return searchSongs(mood.query, 20);
}

export function getSmartRecommendations() {
  const history = loadFromStorage('recentlyPlayed', []);
  if (!history.length) return searchSongs('trending hindi songs', 15);
  const artists = {};
  history.forEach(s => {
    const a = s.artist?.split(',')[0]?.trim();
    if (a) artists[a] = (artists[a] || 0) + 1;
  });
  const topArtist = Object.entries(artists).sort((a, b) => b[1] - a[1])[0]?.[0];
  return searchSongs(topArtist || 'hindi hits', 15);
}

export function analyzeMood(songs) {
  if (!songs.length) return 'chill';
  return 'chill';
}

export function vibeCheck(currentSong, candidate) {
  if (!currentSong || !candidate) return true;
  if (currentSong.language === candidate.language) return true;
  if (currentSong.artist === candidate.artist) return true;
  return Math.random() > 0.3;
}
