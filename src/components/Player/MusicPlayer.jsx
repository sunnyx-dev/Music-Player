import { usePlayer } from '../../contexts/PlayerContext';
import { formatTime } from '../../utils/helpers';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Heart, ListMusic, Volume2, VolumeX, Maximize2 } from 'lucide-react';

export default function MusicPlayer() {
  const {
    currentSong, isPlaying, currentTime, duration, volume, muted,
    shuffle, repeat, togglePlay, seek, playNext, playPrev,
    setVolume, toggleMute, toggleShuffle, cycleRepeat,
    toggleLike, isLiked, toggleQueue, toggleFullScreen
  } = usePlayer();

  if (!currentSong) return (
    <div className="bottom-player" style={{ justifyContent: 'center', color: 'var(--text3)', fontSize: 14 }}>
      <span>🎵 Search and play a song to get started</span>
    </div>
  );

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bottom-player">
      <div className="bp-song">
        <div className={`bp-img ${isPlaying ? 'playing' : ''}`} onClick={toggleFullScreen}>
          {currentSong.image ? <img src={currentSong.image} alt="" /> : <div style={{ width: '100%', height: '100%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎵</div>}
        </div>
        <div className="bp-info">
          <div className="bp-name">{currentSong.name}</div>
          <div className="bp-artist">{currentSong.artist}</div>
        </div>
        <button className={`btn-icon ${isLiked(currentSong.id) ? 'active' : ''}`} onClick={() => toggleLike(currentSong.id)}>
          <Heart size={18} fill={isLiked(currentSong.id) ? 'var(--accent)' : 'none'} color={isLiked(currentSong.id) ? 'var(--accent)' : 'var(--text2)'} />
        </button>
      </div>

      <div className="bp-controls">
        <div className="bp-buttons">
          <button className={`btn-icon ${shuffle ? 'active' : ''}`} onClick={toggleShuffle} title="Shuffle">
            <Shuffle size={18} />
          </button>
          <button className="btn-icon" onClick={playPrev}><SkipBack size={20} /></button>
          <button className="bp-play-btn" onClick={togglePlay}>
            {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: 2 }} />}
          </button>
          <button className="btn-icon" onClick={playNext}><SkipForward size={20} /></button>
          <button className={`btn-icon ${repeat !== 'off' ? 'active' : ''}`} onClick={cycleRepeat} title={`Repeat: ${repeat}`}>
            {repeat === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
          </button>
        </div>
        <div className="bp-seekbar">
          <span className="bp-time">{formatTime(currentTime)}</span>
          <input
            type="range" className="bp-slider" min={0} max={duration || 0} step={0.1}
            value={currentTime}
            onChange={e => seek(parseFloat(e.target.value))}
            style={{ background: `linear-gradient(to right, var(--primary) ${progress}%, var(--surface2) ${progress}%)` }}
          />
          <span className="bp-time">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="bp-right">
        <div className="bp-vol">
          <button className="btn-icon" onClick={toggleMute}>
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input type="range" min={0} max={1} step={0.01} value={muted ? 0 : volume}
            onChange={e => setVolume(parseFloat(e.target.value))}
            style={{ background: `linear-gradient(to right, var(--primary) ${(muted ? 0 : volume)*100}%, var(--surface2) ${(muted ? 0 : volume)*100}%)` }}
          />
        </div>
        <button className="btn-icon" onClick={toggleQueue} title="Queue"><ListMusic size={18} /></button>
        <button className="btn-icon" onClick={toggleFullScreen} title="Fullscreen"><Maximize2 size={18} /></button>
      </div>
    </div>
  );
}
