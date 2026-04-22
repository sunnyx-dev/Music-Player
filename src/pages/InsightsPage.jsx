import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePlayer } from '../contexts/PlayerContext';
import { BADGES } from '../utils/constants';
import { formatTime } from '../utils/helpers';
import { BarChart3, Clock, Play, Award, Zap, Flame } from 'lucide-react';

export default function InsightsPage() {
  const { recentlyPlayed } = usePlayer();
  const [stats, setStats] = useState({ totalSongs: 0, totalTime: 0, topArtist: '', streak: 0 });

  useEffect(() => {
    if (!recentlyPlayed.length) return;
    
    const artists = {};
    let time = 0;
    
    recentlyPlayed.forEach(song => {
      time += song.duration || 0;
      const a = song.artist?.split(',')[0]?.trim();
      if (a) artists[a] = (artists[a] || 0) + 1;
    });
    
    const topArtist = Object.entries(artists).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None yet';
    
    setStats({
      totalSongs: recentlyPlayed.length,
      totalTime: time,
      topArtist,
      streak: 3 // Mock streak
    });
  }, [recentlyPlayed]);

  return (
    <div className="animate-in">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ fontSize: 28, marginBottom: 32 }}>🧬 Music DNA</motion.h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginBottom: 40 }}>
        <motion.div className="glass-card stat-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Play size={24} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
          <div className="stat-value">{stats.totalSongs}</div>
          <div className="stat-label">Songs Played</div>
        </motion.div>
        
        <motion.div className="glass-card stat-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Clock size={24} color="var(--secondary)" style={{ margin: '0 auto 12px' }} />
          <div className="stat-value">{formatTime(stats.totalTime)}</div>
          <div className="stat-label">Total Time</div>
        </motion.div>
        
        <motion.div className="glass-card stat-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Award size={24} color="var(--gold)" style={{ margin: '0 auto 12px' }} />
          <div className="stat-value" style={{ fontSize: 28 }}>{stats.topArtist}</div>
          <div className="stat-label">Top Artist</div>
        </motion.div>
        
        <motion.div className="glass-card stat-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <Flame size={24} color="var(--accent)" style={{ margin: '0 auto 12px' }} />
          <div className="stat-value">{stats.streak}</div>
          <div className="stat-label">Day Streak</div>
        </motion.div>
      </div>

      <div className="section-title"><Zap size={20} /> Your Badges</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {BADGES.map((badge, i) => {
          const progress = badge.id === 'music-lover' ? Math.min(100, (stats.totalSongs / badge.requirement) * 100) :
                           badge.id === 'streak-master' ? Math.min(100, (stats.streak / badge.requirement) * 100) : 0;
          const isUnlocked = progress >= 100;
          
          return (
            <motion.div key={badge.id} className="glass-card badge-card" style={{ opacity: isUnlocked ? 1 : 0.6 }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: isUnlocked ? 1 : 0.6, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="badge-icon" style={{ filter: isUnlocked ? 'none' : 'grayscale(1)' }}>{badge.icon}</div>
              <div className="badge-info">
                <div className="badge-name">{badge.name}</div>
                <div className="badge-desc">{badge.desc}</div>
              </div>
              <div className="badge-progress" style={{ borderColor: isUnlocked ? 'var(--primary)' : 'var(--surface2)', color: isUnlocked ? 'var(--primary)' : 'var(--text3)' }}>
                {Math.round(progress)}%
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
