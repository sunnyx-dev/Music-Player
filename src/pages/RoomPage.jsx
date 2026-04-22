import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoom } from '../contexts/RoomContext';
import { usePlayer } from '../contexts/PlayerContext';
import { Users, Copy, Check, Send, LogOut, Radio } from 'lucide-react';
import { showToast } from '../components/UI/Toast';

const EMOJIS = ['❤️', '🔥', '😂', '👏', '🎵', '💯'];

export default function RoomPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { room, messages, users, isHost, hostControl, leaveRoom, sendChat, sendReaction, setHostControl } = useRoom();
  const { currentSong, isPlaying } = usePlayer();
  const [chatInput, setChatInput] = useState('');
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!room) navigate('/rooms');
  }, [room, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!room) return null;

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    showToast('Room code copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChat(chatInput);
    setChatInput('');
  };

  return (
    <div className="room-container animate-in">
      <div className="room-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, margin: 0 }}>{room.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface)', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>
              <Radio size={14} /> LIVE
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 8 }}>
            Host: {room.host || 'Unknown'} • <Users size={14} /> {users.length} Listeners
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-ghost" onClick={copyCode}>
            {copied ? <Check size={16} color="#22c55e" /> : <Copy size={16} />} 
            Code: <span style={{ letterSpacing: 2, fontWeight: 700, marginLeft: 4 }}>{room.code}</span>
          </button>
          <button className="btn-ghost" onClick={() => { leaveRoom(); navigate('/rooms'); }} style={{ color: 'var(--accent)', borderColor: 'rgba(255,59,127,0.3)' }}>
            <LogOut size={16} /> Leave
          </button>
        </div>
      </div>

      <div className="room-body">
        <div className="room-player">
          {/* Presence Ring */}
          <div className="presence-ring" style={{ marginBottom: 40 }}>
            {users.map((u, i) => (
              <motion.div key={i} className={`presence-avatar ${u.isHost ? 'host' : ''}`}
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.1 }}>
                {u.avatar}
              </motion.div>
            ))}
          </div>

          {currentSong ? (
            <motion.div className="glass-card" style={{ width: 300, textAlign: 'center' }}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <div style={{ width: 260, height: 260, borderRadius: 16, overflow: 'hidden', margin: '0 auto 20px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <img src={currentSong.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} className={isPlaying ? 'playing' : ''} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{currentSong.name}</div>
              <div style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4 }}>{currentSong.artist}</div>
              
              {!isHost && hostControl && (
                <div style={{ marginTop: 16, fontSize: 12, color: 'var(--primary)', background: 'var(--surface)', padding: '6px 12px', borderRadius: 20, display: 'inline-block' }}>
                  Host controls playback
                </div>
              )}
            </motion.div>
          ) : (
            <div className="glass-card" style={{ width: 300, height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>
              <Radio size={48} style={{ marginBottom: 16 }} />
              <div>Waiting for music...</div>
            </div>
          )}

          {isHost && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20 }}>
              <span style={{ fontSize: 13, color: 'var(--text2)' }}>Host Control Only</span>
              <div style={{ width: 40, height: 24, background: hostControl ? 'var(--primary)' : 'var(--surface2)', borderRadius: 12, position: 'relative', cursor: 'pointer', transition: '.3s' }}
                onClick={() => setHostControl(!hostControl)}>
                <div style={{ width: 20, height: 20, background: '#fff', borderRadius: '50%', position: 'absolute', top: 2, left: hostControl ? 18 : 2, transition: '.3s' }} />
              </div>
            </div>
          )}
        </div>

        <div className="room-chat">
          <div className="room-messages">
            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text3)', margin: '10px 0' }}>Welcome to the room!</div>
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={m.isReaction ? 'room-msg-reaction' : `room-msg ${m.sender === loadFromStorage('userName', 'You') ? 'own' : ''}`}
                style={m.isReaction ? { textAlign: m.sender === loadFromStorage('userName', 'You') ? 'right' : 'left', fontSize: 24 } : {}}>
                {!m.isReaction && m.sender !== loadFromStorage('userName', 'You') && <div className="room-msg-sender">{m.sender}</div>}
                {m.isReaction ? m.emoji : m.text}
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="reaction-bar">
            {EMOJIS.map(emoji => (
              <div key={emoji} className="reaction-btn" onClick={() => sendReaction(emoji)}>{emoji}</div>
            ))}
          </div>
          
          <form className="room-input-bar" onSubmit={handleSend}>
            <input placeholder="Say something..." value={chatInput} onChange={e => setChatInput(e.target.value)} />
            <button type="submit" className="btn-icon" style={{ background: 'var(--primary)' }} disabled={!chatInput.trim()}>
              <Send size={16} fill="white" color="white" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function loadFromStorage(key, fallback) {
  try {
    const v = localStorage.getItem(`sur_${key}`);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
