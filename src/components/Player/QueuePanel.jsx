import { usePlayer } from '../../contexts/PlayerContext';
import { formatTime } from '../../utils/helpers';
import { X, Trash2, GripVertical } from 'lucide-react';

export default function QueuePanel() {
  const { queue, queueIndex, currentSong, showQueue, toggleQueue, playSong, removeFromQueue } = usePlayer();

  return (
    <div className={`queue-panel ${showQueue ? 'open' : ''}`}>
      <div className="queue-title">
        <span>Queue ({queue.length})</span>
        <button className="btn-icon" onClick={toggleQueue}><X size={20} /></button>
      </div>

      {currentSong && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Now Playing</div>
          <div className="song-list-item playing">
            <div className="song-list-img">
              {currentSong.image ? <img src={currentSong.image} alt="" /> : <div style={{ width: '100%', height: '100%', background: 'var(--surface2)' }} />}
            </div>
            <div className="song-list-info">
              <div className="song-list-name">{currentSong.name}</div>
              <div className="song-list-artist">{currentSong.artist}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Up Next</div>
      {queue.length === 0 && (
        <div style={{ color: 'var(--text3)', fontSize: 13, padding: 20, textAlign: 'center' }}>Queue is empty</div>
      )}
      {queue.map((song, i) => {
        if (i <= queueIndex) return null;
        return (
          <div key={`${song.id}-${i}`} className="song-list-item" onClick={() => playSong(song, queue, i)}>
            <div className="song-list-img">
              {song.image ? <img src={song.image} alt="" /> : <div style={{ width: '100%', height: '100%', background: 'var(--surface2)' }} />}
            </div>
            <div className="song-list-info">
              <div className="song-list-name">{song.name}</div>
              <div className="song-list-artist">{song.artist}</div>
            </div>
            <span className="song-list-duration">{formatTime(song.duration)}</span>
            <button className="btn-icon" onClick={e => { e.stopPropagation(); removeFromQueue(i); }} style={{ opacity: 1 }}>
              <Trash2 size={14} color="var(--text3)" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
