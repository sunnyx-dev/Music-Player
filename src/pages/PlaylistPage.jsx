import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePlaylist } from '../contexts/PlaylistContext';
import { usePlayer } from '../contexts/PlayerContext';
import { formatTime } from '../utils/helpers';
import { Play, Shuffle, Heart, Trash2, ArrowLeft } from 'lucide-react';
import { showToast } from '../components/UI/Toast';

export default function PlaylistPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playlists, removeSongFromPlaylist } = usePlaylist();
  const { playSong, liked, recentlyPlayed } = usePlayer();

  let playlist = playlists.find(p => p.id === id);
  if (id === 'liked') {
    playlist = { id: 'liked', name: 'Liked Songs', songs: recentlyPlayed.filter(s => liked.includes(s.id)), icon: '❤️' };
  }

  if (!playlist) return <div style={{ padding: 40, textAlign: 'center' }}>Playlist not found</div>;

  const handlePlayAll = () => {
    if (!playlist.songs.length) return;
    playSong(playlist.songs[0], playlist.songs, 0);
  };

  return (
    <div className="animate-in">
      <button className="btn-icon" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        <ArrowLeft size={20} />
      </button>

      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end', marginBottom: 40 }}>
        <div style={{ width: 220, height: 220, borderRadius: 16, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          {playlist.icon || '🎵'}
        </div>
        <div>
          <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8, color: 'var(--text2)' }}>Playlist</div>
          <h1 style={{ fontSize: 48, marginBottom: 16 }}>{playlist.name}</h1>
          <div style={{ color: 'var(--text2)' }}>
            {playlist.songs?.length || 0} songs
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
            <button className="btn-primary" onClick={handlePlayAll} disabled={!playlist.songs?.length}>
              <Play size={20} fill="white" /> Play All
            </button>
          </div>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', color: 'var(--text3)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, padding: '0 14px 12px', borderBottom: '1px solid var(--glass-border)', marginBottom: 12 }}>
          <div style={{ width: 40 }}>#</div>
          <div style={{ flex: 1 }}>Title</div>
          <div style={{ width: 80, textAlign: 'right' }}>Time</div>
          <div style={{ width: 60 }}></div>
        </div>

        {(!playlist.songs || playlist.songs.length === 0) && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>
            No songs in this playlist yet.
          </div>
        )}

        {playlist.songs?.map((song, i) => (
          <motion.div key={song.id + i} className="song-list-item"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
            onClick={() => playSong(song, playlist.songs, i)}>
            <span className="song-list-num">{i + 1}</span>
            <div className="song-list-img">
              {song.image ? <img src={song.image} alt="" /> : <div style={{ width: '100%', height: '100%', background: 'var(--surface2)' }} />}
            </div>
            <div className="song-list-info">
              <div className="song-list-name">{song.name}</div>
              <div className="song-list-artist">{song.artist}</div>
            </div>
            <span className="song-list-duration" style={{ width: 80, textAlign: 'right' }}>{formatTime(song.duration)}</span>
            <div className="song-list-actions" style={{ width: 60, justifyContent: 'flex-end', opacity: id === 'liked' ? 0 : 1 }}>
              {id !== 'liked' && (
                <button className="btn-icon" onClick={e => { e.stopPropagation(); removeSongFromPlaylist(id, song.id); showToast('Removed from playlist'); }}>
                  <Trash2 size={16} color="var(--text3)" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
