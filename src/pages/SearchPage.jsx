import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { usePlayer } from '../contexts/PlayerContext';
import { searchSongs } from '../services/musicApi';
import { debounce, formatTime } from '../utils/helpers';
import { Search, Play, Plus, Heart, Loader } from 'lucide-react';
import { showToast } from '../components/UI/Toast';

const SUGGESTIONS = ['Arijit Singh', 'Tum Hi Ho', 'Kesariya', 'Sad Songs', 'Gym Workout', 'Romantic Hindi', 'Lofi Chill', 'Atif Aslam', 'AP Dhillon', 'Diljit Dosanjh'];

export default function SearchPage() {
  const { playSong, addToQueue, toggleLike, isLiked } = usePlayer();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(debounce(async (q) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true); setSearched(true);
    const songs = await searchSongs(q, 30);
    setResults(songs);
    setLoading(false);
  }, 300), []);

  const handleInput = (e) => {
    setQuery(e.target.value);
    doSearch(e.target.value);
  };

  return (
    <div className="animate-in">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ fontSize: 28, marginBottom: 24 }}>🔍 Search</motion.h1>

      <div className="search-container" style={{ maxWidth: '100%', marginBottom: 24 }}>
        <Search size={20} className="search-icon" />
        <input className="search-input" placeholder="Search songs, artists, moods..."
          value={query} onChange={handleInput} autoFocus />
      </div>

      {!searched && !query && (
        <div>
          <div className="section-title" style={{ fontSize: 16, marginBottom: 12 }}>✨ Try searching</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SUGGESTIONS.map(s => (
              <motion.button key={s} className="btn-ghost" onClick={() => { setQuery(s); doSearch(s); }}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                {s}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} color="var(--primary)" />
        </div>
      )}

      {!loading && results.length > 0 && (
        <div>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 12 }}>{results.length} results</div>
          {results.map((song, i) => (
            <motion.div key={song.id + i} className="song-list-item"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              onClick={() => playSong(song, results, i)}>
              <span className="song-list-num">{i + 1}</span>
              <div className="song-list-img">
                {song.image ? <img src={song.image} alt="" loading="lazy" /> : <div style={{ width: '100%', height: '100%', background: 'var(--surface2)' }} />}
              </div>
              <div className="song-list-info">
                <div className="song-list-name">{song.name}</div>
                <div className="song-list-artist">{song.artist}</div>
              </div>
              <span className="song-list-duration">{formatTime(song.duration)}</span>
              <div className="song-list-actions" style={{ opacity: 1 }}>
                <button className="btn-icon" onClick={e => { e.stopPropagation(); toggleLike(song.id); }}>
                  <Heart size={16} fill={isLiked(song.id) ? 'var(--accent)' : 'none'} color={isLiked(song.id) ? 'var(--accent)' : 'var(--text3)'} />
                </button>
                <button className="btn-icon" onClick={e => { e.stopPropagation(); addToQueue(song); showToast('Added to queue', 'success'); }}>
                  <Plus size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <div>No results found for "{query}"</div>
        </div>
      )}
    </div>
  );
}
