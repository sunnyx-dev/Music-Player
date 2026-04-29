import { useEffect, useRef } from 'react';

export default function AudioVisualizer({ audioRef }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 60;

    function draw() {
      animRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      let data;
      if (analyserRef.current) {
        data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
      }
      
      const bars = 40;
      const barW = (canvas.width / bars) - 2;
      
      for (let i = 0; i < bars; i++) {
        const val = data ? data[i * 2] || 0 : Math.random() * 30;
        const h = Math.max(2, (val / 255) * canvas.height);
        const x = i * (barW + 2);
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - h);
        gradient.addColorStop(0, '#6c3ce0');
        gradient.addColorStop(1, '#00d4ff');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, canvas.height - h, barW, h, 2);
        ctx.fill();
      }
    }

    // Try to connect analyser
    const audio = audioRef?.current;
    if (audio && !sourceRef.current) {
      try {
        const actx = new (window.AudioContext || window.webkitAudioContext)();
        const source = actx.createMediaElementSource(audio);
        const analyser = actx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyser.connect(actx.destination);
        analyserRef.current = analyser;
        sourceRef.current = source;
      } catch (e) { /* already connected or CORS */ }
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [audioRef]);

  return <canvas ref={canvasRef} style={{ width: 300, height: 60, opacity: 0.8 }} />;
}
