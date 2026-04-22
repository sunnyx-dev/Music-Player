import { usePlayer } from '../../contexts/PlayerContext';
import { formatTime } from '../../utils/helpers';
import AudioVisualizer from '../Effects/AudioVisualizer';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, SkipBack, SkipForward, Heart, Shuffle, Repeat, Repeat1 } from 'lucide-react';

export default function FullScreenPlayer() {
  const {
    currentSong, isPlaying, currentTime, duration, shuffle, repeat,
    togglePlay, seek, playNext, playPrev, toggleShuffle, cycleRepeat,
    toggleLike, isLiked, toggleFullScreen, showFullScreen, audioRef
  } = usePlayer();

  if (!showFullScreen || !currentSong) return null;
  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      <motion.div className="fs-player" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="fs-bg" style={{ backgroundImage: `url(${currentSong.image})` }} />
        <div className="fs-overlay" />
        <div className="fs-content">
          <button onClick={toggleFullScreen} style={{ position: 'absolute', top: -20, right: 0, zIndex: 2 }} className="btn-icon">
            <X size={24} />
          </button>

          <motion.div
            className={`fs-art ${isPlaying ? 'playing' : ''}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <img src={currentSong.image} alt={currentSong.name} />
          </motion.div>

          <AudioVisualizer audioRef={audioRef} />

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="fs-title">{currentSong.name}</div>
            <div className="fs-artist">{currentSong.artist}</div>
          </motion.div>

          <div style={{ width: '100%' }}>
            <div className="bp-seekbar">
              <span className="bp-time">{formatTime(currentTime)}</span>
              <input type="range" className="bp-slider" min={0} max={duration || 0} step={0.1} value={currentTime}
                onChange={e => seek(parseFloat(e.target.value))}
                style={{ background: `linear-gradient(to right, var(--primary) ${progress}%, var(--surface2) ${progress}%)` }}
              />
              <span className="bp-time">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="bp-buttons" style={{ gap: 24 }}>
            <button className={`btn-icon ${shuffle ? 'active' : ''}`} onClick={toggleShuffle}><Shuffle size={20} /></button>
            <button className="btn-icon" onClick={playPrev}><SkipBack size={24} /></button>
            <button className="bp-play-btn" onClick={togglePlay} style={{ width: 56, height: 56 }}>
              {isPlaying ? <Pause size={26} /> : <Play size={26} style={{ marginLeft: 3 }} />}
            </button>
            <button className="btn-icon" onClick={playNext}><SkipForward size={24} /></button>
            <button className={`btn-icon ${repeat !== 'off' ? 'active' : ''}`} onClick={cycleRepeat}>
              {repeat === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
            </button>
          </div>

          <button className={`btn-icon ${isLiked(currentSong.id) ? 'active' : ''}`} onClick={() => toggleLike(currentSong.id)}>
            <Heart size={24} fill={isLiked(currentSong.id) ? 'var(--accent)' : 'none'} color={isLiked(currentSong.id) ? 'var(--accent)' : 'var(--text2)'} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
