import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePlaylist } from '../contexts/PlaylistContext';
import { usePlayer } from '../contexts/PlayerContext';
import { Plus, Music, Heart, Clock, Trash2 } from 'lucide-react';

export default function LibraryPage() {
  const { playlists, createPlaylist, deletePlaylist } = usePlaylist();
  const { recentlyPlayed, liked, playSong } = usePlayer();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) return;
    createPlaylist({ name: newName.trim(), icon: '🎵' });
    setNewName('');
    setShowCreate(false);
  };

  const likedSongs = recentlyPlayed.filter(s => liked.includes(s.id));

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 28 }}>📚 Your Library</motion.h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}><Plus size={18} /> New Playlist</button>
      </div>

      {/* Quick Access */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 32 }}>
        <motion.div className="glass-card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}
          whileHover={{ scale: 1.02 }} onClick={() => navigate('/playlist/liked')}>
          <div style={{ width: 50, height: 50, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent), #ff6b9d)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={24} fill="white" color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Liked Songs</div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>{liked.length} songs</div>
          </div>
        </motion.div>

        <motion.div className="glass-card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}
          whileHover={{ scale: 1.02 }}>
          <div style={{ width: 50, height: 50, borderRadius: 10, background: 'linear-gradient(135deg, var(--secondary), #00a3cc)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Recently Played</div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>{recentlyPlayed.length} songs</div>
          </div>
        </motion.div>
      </div>

      {/* Playlists */}
      <div className="section-title">Your Playlists</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {playlists.filter(p => p.id !== 'liked').map((pl, i) => (
          <motion.div key={pl.id} className="glass-card" style={{ cursor: 'pointer', position: 'relative' }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.02 }} onClick={() => navigate(`/playlist/${pl.id}`)}>
            <div style={{ width: '100%', aspectRatio: '1', borderRadius: 12, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, marginBottom: 12 }}>
              {pl.icon || '🎵'}
            </div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{pl.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{pl.songs?.length || 0} songs</div>
            <button className="btn-icon" style={{ position: 'absolute', top: 8, right: 8 }}
              onClick={e => { e.stopPropagation(); deletePlaylist(pl.id); }}>
              <Trash2 size={14} color="var(--text3)" />
            </button>
          </motion.div>
        ))}
      </div>

      {playlists.filter(p => p.id !== 'liked').length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>
          <Music size={48} style={{ marginBottom: 12 }} />
          <p>No playlists yet. Create one!</p>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <motion.div className="modal-content" onClick={e => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="modal-title">Create Playlist</div>
            <input placeholder="Playlist name..." value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()} autoFocus style={{ marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreate}>Create</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
