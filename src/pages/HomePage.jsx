import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePlayer } from '../contexts/PlayerContext';
import { getTrending, getSongsByMood } from '../services/musicApi';
import { getSmartRecommendations } from '../services/aiEngine';
import { MOODS } from '../utils/constants';
import { getGreeting } from '../utils/helpers';
import { Play, TrendingUp, Clock, Sparkles } from 'lucide-react';

export default function HomePage() {
  const { playSong, recentlyPlayed } = usePlayer();
  const [trending, setTrending] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [moodSongs, setMoodSongs] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeMood, setActiveMood] = useState(null);

  useEffect(() => {
    Promise.all([
      getTrending().then(setTrending),
      getSmartRecommendations().then(setRecommended),
    ]).finally(() => setLoading(false));
  }, []);

  const handleMood = async (mood) => {
    setActiveMood(mood.id);
    if (!moodSongs[mood.id]) {
      const songs = await getSongsByMood(mood.query);
      setMoodSongs(prev => ({ ...prev, [mood.id]: songs }));
    }
  };

  const SongRow = ({ songs, title, icon }) => (
    <section style={{ marginBottom: 32 }}>
      <div className="section-title">{icon} {title}</div>
      <div className="scroll-row">
        {songs.map((song, i) => (
          <motion.div key={song.id + i} className="song-card" onClick={() => playSong(song, songs, i)}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="song-card-img">
              {song.image ? <img src={song.image} alt={song.name} loading="lazy" /> : <div style={{ width: '100%', height: '100%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🎵</div>}
              <div className="song-card-play"><Play size={18} fill="white" color="white" /></div>
            </div>
            <div className="song-card-info">
              <div className="song-card-name">{song.name}</div>
              <div className="song-card-artist">{song.artist}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );

  const Skeleton = () => (
    <div className="scroll-row">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ minWidth: 180 }}>
          <div className="skeleton skeleton-img" style={{ width: 180, height: 180 }} />
          <div className="skeleton skeleton-text" style={{ width: 140, marginTop: 10 }} />
          <div className="skeleton skeleton-text" style={{ width: 100 }} />
        </div>
      ))}
    </div>
  );

  return (
    <div className="animate-in">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, marginBottom: 4 }}>{getGreeting()}</h1>
        <p style={{ color: 'var(--text2)', fontSize: 15 }}>Discover and enjoy your favorite music</p>
      </motion.div>

      {/* Mood Cards */}
      <section style={{ marginBottom: 32 }}>
        <div className="section-title">🎭 Mood Playlists</div>
        <div className="mood-grid">
          {MOODS.map((mood, i) => (
            <motion.div key={mood.id} className="mood-card glass-card"
              style={{ background: `linear-gradient(135deg, ${mood.color}22, ${mood.color}08)`, border: activeMood === mood.id ? `1px solid ${mood.color}` : undefined }}
              onClick={() => handleMood(mood)}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <span className="mood-card-emoji">{mood.emoji}</span>
              <span className="mood-card-label">{mood.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mood Songs */}
      {activeMood && moodSongs[activeMood]?.length > 0 && (
        <SongRow songs={moodSongs[activeMood]} title={`${MOODS.find(m => m.id === activeMood)?.emoji} ${MOODS.find(m => m.id === activeMood)?.label} Vibes`} icon="" />
      )}

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <SongRow songs={recentlyPlayed.slice(0, 10)} title="Recently Played" icon={<Clock size={20} />} />
      )}

      {/* Trending */}
      <div className="section-title"><TrendingUp size={20} /> Trending Now</div>
      {loading ? <Skeleton /> : trending.length > 0 && <SongRow songs={trending} title="" icon="" />}

      {/* Recommended */}
      {recommended.length > 0 && (
        <SongRow songs={recommended} title="Recommended For You" icon={<Sparkles size={20} />} />
      )}
    </div>
  );
}
