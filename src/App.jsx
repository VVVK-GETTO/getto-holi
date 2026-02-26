import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, UploadCloud, X, Copy, ShoppingBag, 
  AlertCircle, RefreshCw, CheckCircle2, Image as ImageIcon,
  Clock
} from 'lucide-react';

// --- STYLES & ANIMATIONS ---
const customStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');
  
  body {
    font-family: 'Outfit', sans-serif;
    background-color: #f8fafc;
    overflow-x: hidden;
    -webkit-tap-highlight-color: transparent;
  }
  
  .glass-card {
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.6);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 0 40px rgba(37, 188, 180, 0.1);
  }

  .text-gradient {
    background: linear-gradient(135deg, #25bcb4 0%, #a855f7 50%, #ec4899 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .loader-ring {
    border: 4px solid transparent;
    border-top-color: #25bcb4;
    border-right-color: #ec4899;
    border-bottom-color: #eab308;
    border-left-color: #a855f7;
    border-radius: 50%;
    animation: spin 1.5s linear infinite;
  }

  @keyframes spin { 100% { transform: rotate(360deg); } }
  
  .blob {
    position: absolute;
    filter: blur(60px);
    z-index: -1;
    opacity: 0.4;
    animation: float 10s ease-in-out infinite;
    will-change: transform;
  }

  @keyframes float {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
  }
`;

// --- BACKGROUND PARTICLES COMPONENT ---
const BackgroundParticles = () => {
  const colors = ['#25bcb4', '#ec4899', '#eab308', '#a855f7', '#3b82f6'];
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
      {/* Soft animated blobs */}
      <div className="blob bg-[#25bcb4] w-64 h-64 sm:w-96 sm:h-96 rounded-full top-[-10%] left-[-10%]" style={{ animationDelay: '0s' }}></div>
      <div className="blob bg-[#ec4899] w-56 h-56 sm:w-80 sm:h-80 rounded-full bottom-[-10%] right-[-5%]" style={{ animationDelay: '2s' }}></div>
      <div className="blob bg-[#eab308] w-48 h-48 sm:w-64 sm:h-64 rounded-full top-[40%] left-[60%]" style={{ animationDelay: '4s' }}></div>
      
      {/* Floating powder particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-60"
          style={{
            backgroundColor: colors[i % colors.length],
            width: Math.random() * 12 + 4 + 'px',
            height: Math.random() * 12 + 4 + 'px',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
          }}
          animate={{
            y: [0, -100 - Math.random() * 200],
            x: Math.sin(i) * 50,
            opacity: [0, 0.6, 0],
            rotate: Math.random() * 360
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5
          }}
        />
      ))}

      {/* Cartoons / GIFs of Teens Playing Holi */}
      <div className="fixed bottom-0 left-0 w-full flex justify-between items-end pointer-events-none opacity-40 sm:opacity-60 px-2 sm:px-10 pb-2 sm:pb-4 z-0">
        <img 
          src="https://media.tenor.com/bZ-s7v0YGEQAAAAj/happy-holi-colorful.gif" 
          alt="Holi Cartoon" 
          className="w-28 sm:w-40 md:w-64 max-w-full drop-shadow-xl" 
        />
        <img 
          src="https://media.tenor.com/P4E1H1jF3B4AAAAi/holi-happy-holi.gif" 
          alt="Holi Cartoon" 
          className="w-28 sm:w-40 md:w-64 max-w-full transform -scale-x-100 drop-shadow-xl" 
        />
      </div>
    </div>
  );
};

// --- NATIVE CANVAS CLICK EFFECT (High Performance) ---
const CanvasClickEffect = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const colors = ['#25bcb4', '#1fa19a', '#74e0da'];

    const createParticles = (x, y, target) => {
      if (target.closest('button') || target.tagName.toLowerCase() === 'input') return;

      for (let i = 0; i < 20; i++) {
        particles.push({
          x: x,
          y: y,
          vx: (Math.random() - 0.5) * 15,
          vy: (Math.random() - 0.5) * 15,
          size: Math.random() * 5 + 3,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 1,
          decay: Math.random() * 0.02 + 0.015
        });
      }
    };

    const handleClick = (e) => createParticles(e.clientX, e.clientY, e.target);
    const handleTouch = (e) => {
      if (e.touches.length > 0) {
        createParticles(e.touches[0].clientX, e.touches[0].clientY, e.target);
      }
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('touchstart', handleTouch, { passive: true });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.4;
        p.life -= p.decay;
        
        if (p.life > 0) {
          ctx.globalAlpha = p.life;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }
      }
      
      particles = particles.filter(p => p.life > 0);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('touchstart', handleTouch);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[100]" />;
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [step, setStep] = useState('upload');
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // --- IMAGE ANALYSIS ALGORITHM (Strict Skin & Texture AI) ---
  const analyzeHoliImage = async (dataUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 150;
        canvas.height = 150;
        ctx.drawImage(img, 0, 0, 150, 150);
        const imageData = ctx.getImageData(0, 0, 150, 150).data;

        let colorfulPixels = 0;
        let skinPixels = 0; 
        const totalPixels = 150 * 150;
        let colorBuckets = new Set();
        let flatPixels = 0;
        let splatterPixels = 0;

        for (let i = 0; i < imageData.length; i += 4) {
          const r = imageData[i];
          const g = imageData[i+1];
          const b = imageData[i+2];

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const l = (max + min) / 2;
          let s = 0;
          if (max !== min) {
            s = l > 127 ? (max - min) / (510 - max - min) : (max - min) / (max + min);
          }

          // STRICT HUMAN DETECTION
          const isSkinTone = (r > 60 && g > 30 && b > 15 && r > g && r > b && Math.abs(r - g) > 10 && s > 0.1 && s < 0.65);
          
          if (isSkinTone) {
            skinPixels++;
          }

          // STRICT COLOR DETECTION
          if (s > 0.45 && l > 35 && l < 220) {
            const isSkyOrJeans = (b > r && b > g && s < 0.65);
            const isNatureGreen = (g > r && g > b && s < 0.6);

            if (!isSkinTone && !isSkyOrJeans && !isNatureGreen) {
              colorfulPixels++;

              const nextR = imageData[i+4];
              const nextG = imageData[i+5];
              const nextB = imageData[i+6];
              
              if (nextR !== undefined) {
                const colorDiff = Math.abs(r - nextR) + Math.abs(g - nextG) + Math.abs(b - nextB);
                if (colorDiff < 20) {
                  flatPixels++; 
                } else {
                  splatterPixels++; 
                }
              }

              let h = 0;
              if (max === r) h = (g - b) / (max - min) + (g < b ? 6 : 0);
              else if (max === g) h = (b - r) / (max - min) + 2;
              else if (max === b) h = (r - g) / (max - min) + 4;
              h = Math.round(h * 60); 
              
              colorBuckets.add(Math.floor(h / 30));
            }
          }
        }

        const colorDensity = colorfulPixels / totalPixels;
        const skinDensity = skinPixels / totalPixels;
        const distinctColors = colorBuckets.size;
        const totalVibrant = flatPixels + splatterPixels;
        const splatterRatio = totalVibrant > 0 ? splatterPixels / totalVibrant : 0;

        setTimeout(() => {
          if (skinDensity < 0.005) {
            resolve({ valid: false, reason: "We couldn't detect a person in this photo! Please ensure your face or arms are visible." });
            return;
          }

          if (colorDensity < 0.015) { 
            resolve({ valid: false, reason: "Looks like there are no Holi colors here! Try a photo with vibrant Holi powder." });
            return;
          }
          
          if (totalVibrant > 0 && splatterRatio < 0.25) {
             resolve({ valid: false, reason: "This looks like a solid colored object or wall. We need to see textured Holi powder splatters!" });
             return;
          }

          if (colorDensity < 0.10 && distinctColors < 2) {
            resolve({ valid: false, reason: "This looks like normal clothing! We need to see distinct Holi color splatters or multiple colors." });
            return;
          }

          let calculatedDiscount = 20 + ((colorDensity - 0.015) / 0.15) * 50;
          let roundedDiscount = Math.round(calculatedDiscount / 10) * 10;
          const finalDiscount = Math.max(20, Math.min(70, roundedDiscount));
          const couponCode = `HOLI${finalDiscount}`;

          resolve({ valid: true, discount: finalDiscount, couponCode, reason: "Success" });
        }, 2000); 
      };
      img.src = dataUrl;
    });
  };

  const processImage = async (dataUrl) => {
    setImage(dataUrl);
    setStep('analyzing');
    const analysis = await analyzeHoliImage(dataUrl);
    if (analysis.valid) {
      setResult(analysis);
      setStep('result');
    } else {
      setErrorMsg(analysis.reason);
      setStep('error');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg("Please upload a valid image file.");
      setStep('error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => processImage(event.target.result);
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => processImage(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const openCamera = async () => {
    setStep('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
    } catch (err) {
      setStep('upload');
      setErrorMsg("Camera access denied or unavailable. Please upload a photo instead.");
      setStep('error');
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setStep('upload');
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (streamRef.current.getVideoTracks()[0].getSettings().facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      closeCamera();
      processImage(dataUrl);
    }
  };

  const resetFlow = () => {
    setImage(null);
    setResult(null);
    setErrorMsg('');
    setStep('upload');
  };

  const copyToClipboard = () => {
    const textToCopy = result?.couponCode;
    const textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      alert("Coupon copied to clipboard! 🎉");
    } catch (err) {
      console.error('Failed to copy', err);
    }
    document.body.removeChild(textArea);
  };

  const renderUpload = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-lg mt-6 sm:mt-8 px-2"
    >
      <div 
        className="glass-card rounded-3xl p-6 sm:p-8 text-center cursor-pointer relative group transition-all duration-300 hover:shadow-2xl hover:border-[#25bcb4]/50"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          accept="image/*" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleFileUpload}
          title="Upload your Holi photo"
        />
        <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4 pointer-events-none">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-[#25bcb4]/20 to-[#ec4899]/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 text-[#25bcb4]" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Tap to upload or Drag & Drop</h3>
          <p className="text-gray-500 text-xs sm:text-sm">Browse from your phone or computer</p>
          <div className="text-[10px] sm:text-xs text-gray-400 mt-2">Only one image allowed</div>
        </div>
      </div>

      <div className="flex items-center justify-center my-6">
        <div className="h-px bg-gray-300 flex-1"></div>
        <span className="px-4 text-gray-400 text-xs sm:text-sm font-medium">OR</span>
        <div className="h-px bg-gray-300 flex-1"></div>
      </div>

      <button 
        onClick={openCamera}
        className="w-full py-3 sm:py-4 rounded-2xl bg-white border-2 border-[#25bcb4] text-[#25bcb4] font-semibold text-base sm:text-lg flex items-center justify-center space-x-2 hover:bg-[#25bcb4] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98]"
      >
        <Camera className="w-5 h-5" />
        <span>Take a Photo Now</span>
      </button>
    </motion.div>
  );

  const renderCamera = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
      className="w-full max-w-lg mt-4 sm:mt-8 glass-card rounded-3xl overflow-hidden relative shadow-2xl mx-4"
    >
      <div className="relative w-full aspect-[3/4] sm:aspect-video bg-black rounded-t-3xl overflow-hidden">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
        <button 
          onClick={closeCamera}
          className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-4 sm:p-6 bg-white flex justify-center items-center">
        <button 
          onClick={capturePhoto}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-[#25bcb4] p-1 group active:scale-90 transition-transform"
        >
          <div className="w-full h-full bg-[#25bcb4] rounded-full group-hover:bg-[#1fa19a] transition-colors"></div>
        </button>
      </div>
    </motion.div>
  );

  const renderAnalyzing = () => (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="w-full max-w-lg mt-10 sm:mt-16 text-center px-4"
    >
      <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 loader-ring"></div>
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
          {image && <img src={image} alt="Analyzing" className="w-full h-full object-cover filter brightness-75" />}
        </div>
        <ImageIcon className="absolute text-white/50 w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
      </div>
      <h3 className="mt-6 sm:mt-8 text-xl sm:text-2xl font-bold text-gray-800">Analyzing your Holi look...</h3>
      <p className="text-gray-500 mt-2 text-sm sm:text-base">Checking skin tone and color spread</p>
    </motion.div>
  );

  const renderResult = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
      className="w-full max-w-lg mt-6 sm:mt-8 relative px-2"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-20">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={`confetti-${i}`}
            className="absolute top-1/2 left-1/2 w-2 h-2 sm:w-3 sm:h-3 rounded-full"
            style={{ backgroundColor: '#25bcb4' }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{ 
              x: (Math.random() - 0.5) * (window.innerWidth < 600 ? 250 : 400), 
              y: (Math.random() - 0.5) * (window.innerWidth < 600 ? 250 : 400),
              opacity: 0,
              scale: Math.random() * 2 + 1
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        ))}
      </div>

      <div className="glass-card rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${image})`, filter: 'blur(20px)' }}
        ></div>

        <div className="relative z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Congratulations! 🎉</h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">Your Holi colors earned you a massive discount!</p>
          
          <div className="bg-gradient-to-r from-[#25bcb4] to-[#ec4899] p-1 rounded-2xl mb-6 sm:mb-8 transform hover:scale-105 transition-transform duration-300">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-inner">
              <span className="text-gray-500 font-semibold text-xs sm:text-sm uppercase tracking-wider">Your Discount</span>
              <div className="text-5xl sm:text-6xl font-black text-gradient my-1 sm:my-2">{result?.discount}% OFF</div>
            </div>
          </div>

          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 sm:p-4 mb-4 shadow-sm relative overflow-hidden flex flex-col items-center justify-center">
             <div className="absolute inset-0 bg-red-100 opacity-40 animate-pulse"></div>
             <div className="relative flex items-center space-x-2 mb-1">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 animate-bounce" />
                <span className="text-red-600 font-black text-xs sm:text-sm uppercase tracking-widest text-center">
                  Hurry! Valid only for 24 Hours
                </span>
             </div>
             <div className="text-[10px] sm:text-xs text-red-500 font-semibold text-center relative z-10">Claim it before the colors fade!</div>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200 border-dashed relative group">
            <div className="flex items-center justify-between">
              <span className="font-mono text-lg sm:text-xl font-bold text-gray-800 tracking-wider">{result?.couponCode}</span>
              <button 
                onClick={copyToClipboard}
                className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 text-[#25bcb4] hover:bg-[#25bcb4] hover:text-white transition-colors active:scale-95"
                title="Copy Code"
              >
                <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 space-y-3">
            <a 
              href="https://www.gettoindia.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-3 sm:py-4 rounded-xl bg-[#25bcb4] text-white font-bold text-sm sm:text-base flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 hover:bg-[#1fa19a] transition-colors shadow-lg hover:shadow-[#25bcb4]/40 active:scale-[0.98]"
            >
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Rescue My Fit in 60 Mins!</span>
              </div>
              <span>shop now</span>
            </a>
            <button 
              onClick={resetFlow}
              className="w-full py-3 rounded-xl bg-transparent text-gray-500 font-medium text-sm sm:text-base hover:text-gray-800 transition-colors"
            >
              Try another photo
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderError = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-lg mt-6 sm:mt-8 glass-card rounded-3xl p-6 sm:p-8 text-center"
    >
      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
        <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500" />
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Oops! Let's try that again.</h3>
      <p className="text-gray-600 text-sm sm:text-lg mb-6 sm:mb-8 leading-relaxed">
        {errorMsg}
      </p>
      <button 
        onClick={resetFlow}
        className="w-full py-3 sm:py-4 rounded-xl bg-gray-900 text-white font-bold text-base sm:text-lg flex items-center justify-center space-x-2 hover:bg-gray-800 transition-colors shadow-lg active:scale-[0.98]"
      >
        <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>Try Another Photo</span>
      </button>
    </motion.div>
  );

  return (
    <>
      <style>{customStyles}</style>
      <CanvasClickEffect />
      <div className="min-h-screen relative flex flex-col items-center pt-8 sm:pt-12 pb-24 px-4 sm:px-6 lg:px-8">
        <BackgroundParticles />
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto z-10"
        >
          <div className="inline-block mb-3 sm:mb-4 px-3 py-1 sm:py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 shadow-sm">
            <span className="text-[10px] sm:text-sm font-bold tracking-widest uppercase text-gradient">Happy Holi</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-3 sm:mb-4 tracking-tight leading-tight">
            Got Messy,<br/>
            <span className="text-gradient">Go Getto</span>
          </h1>
          <p className="text-sm sm:text-lg text-gray-600 max-w-xl mx-auto px-2">
            Upload a photo of your colorful Holi outfit. The more colors we detect, the higher your discount! (Up to 70% OFF)
          </p>
        </motion.div>

        {/* Dynamic Content Area (FLEX CENTER FIX APPLIED HERE) */}
        <div className="w-full z-10 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {step === 'upload' && <motion.div key="upload" className="w-full flex justify-center">{renderUpload()}</motion.div>}
            {step === 'camera' && <motion.div key="camera" className="w-full flex justify-center">{renderCamera()}</motion.div>}
            {step === 'analyzing' && <motion.div key="analyzing" className="w-full flex justify-center">{renderAnalyzing()}</motion.div>}
            {step === 'result' && <motion.div key="result" className="w-full flex justify-center">{renderResult()}</motion.div>}
            {step === 'error' && <motion.div key="error" className="w-full flex justify-center">{renderError()}</motion.div>}
          </AnimatePresence>
        </div>

        {/* Footer info */}
        <div className="absolute bottom-4 sm:bottom-6 left-0 w-full text-center text-gray-400 text-xs sm:text-sm pointer-events-none z-10">
          Powered by Getto AI
        </div>
      </div>
    </>
  );
}