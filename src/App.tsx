/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun, 
  Lock, 
  Unlock,
  Coffee,
  Brain,
  Timer as TimerIcon,
  ChevronUp,
  ChevronDown,
  Target,
  Plus,
  Trash2,
  Check
} from 'lucide-react';
import { Howl } from 'howler';
import { cn } from './lib/utils';
import { THEMES, SOUNDS, type TimerMode, type Theme, type Sound, type Goal } from './constants';

export default function App() {
  // State
  const [mode, setMode] = useState<TimerMode>('down');
  const [inputH, setInputH] = useState(0);
  const [inputM, setInputM] = useState(25);
  const [inputS, setInputS] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>(THEMES[0]);
  const [currentSound, setCurrentSound] = useState<Sound | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Fade-out State
  const [fadeDuration, setFadeDuration] = useState(30); // minutes
  const [isFadeActive, setIsFadeActive] = useState(false);
  const [fadeTimeLeft, setFadeTimeLeft] = useState(30 * 60); // seconds

  // Goals State
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('zentime_goals');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Deep Work', secondsSpent: 0 },
      { id: '2', title: 'Learning', secondsSpent: 0 }
    ];
  });
  const [activeGoalId, setActiveGoalId] = useState<string | null>(() => {
    return localStorage.getItem('zentime_active_goal') || '1';
  });
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const prevGoalIdRef = useRef<string | null>(activeGoalId);

  // Persistence
  useEffect(() => {
    localStorage.setItem('zentime_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    if (activeGoalId) {
      localStorage.setItem('zentime_active_goal', activeGoalId);
    }
  }, [activeGoalId]);

  useEffect(() => {
    if (prevGoalIdRef.current !== activeGoalId) {
      if (prevGoalIdRef.current && sessionSeconds > 0) {
        const pid = prevGoalIdRef.current;
        setGoals(prev => prev.map(g => 
          g.id === pid ? { ...g, secondsSpent: g.secondsSpent + sessionSeconds } : g
        ));
        setSessionSeconds(0);
      }
      prevGoalIdRef.current = activeGoalId;
    }
  }, [activeGoalId]);

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const soundRef = useRef<Howl | null>(null);

  // Actions
  const playCompletionSound = useCallback(() => {
    const sound = new Howl({
      src: ['https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'],
      volume: 0.5
    });
    sound.play();
  }, []);

  // Sound Management
  useEffect(() => {
    if (currentSound) {
      if (soundRef.current) {
        soundRef.current.stop();
        soundRef.current.unload();
      }
      
      soundRef.current = new Howl({
        src: [currentSound.url],
        loop: true,
        volume: isMuted ? 0 : volume,
        html5: true
      });

      if (isActive) {
        soundRef.current.play();
      }
    } else {
      if (soundRef.current) {
        soundRef.current.stop();
      }
    }

    return () => {
      if (soundRef.current) {
        soundRef.current.stop();
      }
    };
  }, [currentSound]);

  useEffect(() => {
    if (soundRef.current) {
      const fadeMultiplier = isFadeActive ? (fadeTimeLeft / (fadeDuration * 60)) : 1;
      soundRef.current.volume(isMuted ? 0 : volume * fadeMultiplier);
    }
  }, [volume, isMuted, isFadeActive, fadeTimeLeft, fadeDuration]);

  useEffect(() => {
    if (isActive && soundRef.current && !soundRef.current.playing()) {
      soundRef.current.play();
    } else if (!isActive && soundRef.current) {
      soundRef.current.pause();
    }
  }, [isActive]);

  // Timer Logic
  const tick = useCallback(() => {
    if (isFadeActive) {
      setFadeTimeLeft(prev => {
        if (prev <= 1) {
          setIsFadeActive(false);
          return 0;
        }
        return prev - 1;
      });
    }

    if (activeGoalId) {
      setSessionSeconds(prev => prev + 1);
    }

    if (mode === 'up') {
      setTimeLeft(prev => prev + 1);
    } else {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsActive(false);
          playCompletionSound();
          return 0;
        }
        return prev - 1;
      });
    }
  }, [mode, playCompletionSound, activeGoalId, isFadeActive, fadeDuration]);

  const commitSession = useCallback(() => {
    if (activeGoalId && sessionSeconds > 0) {
      setGoals(prev => prev.map(g => 
        g.id === activeGoalId ? { ...g, secondsSpent: g.secondsSpent + sessionSeconds } : g
      ));
      setSessionSeconds(0);
    }
  }, [activeGoalId, sessionSeconds]);

  useEffect(() => {
    if (!isActive) {
      commitSession();
    }
  }, [isActive, commitSession]);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(tick, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, tick]);

  // Actions
  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(0);
    setInputH(0);
    setInputM(0);
    setInputS(0);
  };

  const updateInput = (type: 'h' | 'm' | 's', val: string) => {
    const num = Math.max(0, parseInt(val) || 0);
    if (type === 'h') setInputH(num);
    if (type === 'm') setInputM(Math.min(59, num));
    if (type === 's') setInputS(Math.min(59, num));
    
    if (!isActive) {
      const h = type === 'h' ? num : inputH;
      const m = type === 'm' ? Math.min(59, num) : inputM;
      const s = type === 's' ? Math.min(59, num) : inputS;
      setTimeLeft(h * 3600 + m * 60 + s);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatGoalTime = (seconds: number) => {
    if (seconds === 0) return '0s';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}m ${s}s`;
    }
    const h = (seconds / 3600).toFixed(1);
    return `${h}h`;
  };

  const addGoal = () => {
    if (!newGoalTitle.trim()) return;
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: newGoalTitle.trim(),
      secondsSpent: 0
    };
    setGoals(prev => [...prev, newGoal]);
    setNewGoalTitle('');
    setShowGoalInput(false);
    setActiveGoalId(newGoal.id);
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    if (activeGoalId === id) {
      setActiveGoalId(null);
    }
  };

  const toggleFade = () => {
    if (!isFadeActive) {
      setFadeTimeLeft(fadeDuration * 60);
    }
    setIsFadeActive(!isFadeActive);
  };

  const progress = mode === 'up' ? 0 : (timeLeft / (Math.max(1, inputH * 3600 + inputM * 60 + inputS))) * 100;

  return (
    <div className={cn(
      "min-h-screen w-full transition-colors duration-1000 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden relative font-sans",
      currentTheme.background
    )}>
      {/* Ambient Background Glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full blur-[80px] pointer-events-none z-0 opacity-50"
           style={{ background: `radial-gradient(circle, ${currentTheme.accent}14 0%, transparent 70%)` }} />

      <div className="flex flex-col lg:flex-row w-full h-full relative z-10">
        {/* Main Timer Area */}
        <div className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-20 py-10 lg:py-0">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex bg-white/5 border border-white/10 rounded-full p-1">
              <button 
                onClick={() => {
                  setMode('down');
                  if (!isActive) setTimeLeft(inputH * 3600 + inputM * 60 + inputS);
                }}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] uppercase tracking-[0.1em] transition-all",
                  mode === 'down' ? "bg-accent text-bg-dark font-bold" : "text-white/40 hover:text-white/60"
                )}
              >
                Count Down
              </button>
              <button 
                onClick={() => {
                  setMode('up');
                  if (!isActive) setTimeLeft(0);
                }}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] uppercase tracking-[0.1em] transition-all",
                  mode === 'up' ? "bg-accent text-bg-dark font-bold" : "text-white/40 hover:text-white/60"
                )}
              >
                Count Up
              </button>
            </div>
            {activeGoalId && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                <Target size={12} className="text-accent" />
                <span className="text-[11px] uppercase tracking-wider text-white/60">
                  {goals.find(g => g.id === activeGoalId)?.title}
                </span>
              </div>
            )}
          </div>

          <div className="relative group">
            {isActive ? (
              <motion.div
                key={timeLeft}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                className={cn(
                  "font-serif text-[80px] sm:text-[120px] md:text-[150px] lg:text-[180px] leading-none font-light tracking-[-0.03em] tabular-nums",
                  currentTheme.text
                )}
              >
                {formatTime(timeLeft)}
              </motion.div>
            ) : (
              <div className="flex items-center font-serif text-[80px] sm:text-[120px] md:text-[150px] lg:text-[180px] leading-none font-light tracking-[-0.03em] tabular-nums">
                <input 
                  type="number"
                  value={inputH.toString().padStart(2, '0')}
                  onChange={(e) => updateInput('h', e.target.value)}
                  className={cn("bg-transparent w-[100px] sm:w-[150px] md:w-[180px] lg:w-[220px] outline-none text-center", currentTheme.text)}
                  placeholder="00"
                />
                <span className="text-white/10 mx-[-10px] md:mx-[-20px]">:</span>
                <input 
                  type="number"
                  value={inputM.toString().padStart(2, '0')}
                  onChange={(e) => updateInput('m', e.target.value)}
                  className={cn("bg-transparent w-[100px] sm:w-[150px] md:w-[180px] lg:w-[220px] outline-none text-center", currentTheme.text)}
                  placeholder="00"
                />
                <span className="text-white/10 mx-[-10px] md:mx-[-20px]">:</span>
                <input 
                  type="number"
                  value={inputS.toString().padStart(2, '0')}
                  onChange={(e) => updateInput('s', e.target.value)}
                  className={cn("bg-transparent w-[100px] sm:w-[150px] md:w-[180px] lg:w-[220px] outline-none text-center", currentTheme.text)}
                  placeholder="00"
                />
              </div>
            )}
          </div>

          <div className="flex gap-5 items-center mt-10">
            <div className="text-[12px] uppercase tracking-[0.1em] text-white/40">
              {isActive ? 'Session in progress' : 'Set your intention'}
            </div>
            <div className="w-24 h-[1px] bg-white/20" />
            <button 
              onClick={resetTimer}
              className="text-[10px] uppercase tracking-[0.2em] text-white/20 hover:text-white/60 transition-colors flex items-center gap-2"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          </div>

          <div className="mt-16">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-5 block">Aesthetic</span>
            <div className="flex gap-3">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setCurrentTheme(t)}
                  className={cn(
                    "w-5 h-5 rounded-full border border-white/10 transition-all",
                    currentTheme.id === t.id ? "border-accent scale-125" : "hover:opacity-80",
                    t.background
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="w-full lg:w-[350px] bg-white/[0.03] border-t lg:border-t-0 lg:border-l border-white/10 p-6 md:p-10 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="mb-10">
              <div className="flex items-center justify-between mb-5">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">Focus Goals</span>
                <button 
                  onClick={() => setShowGoalInput(!showGoalInput)}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>

              <AnimatePresence>
                {showGoalInput && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 overflow-hidden"
                  >
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={newGoalTitle}
                        onChange={(e) => setNewGoalTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                        placeholder="New goal..."
                        className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-xs focus:outline-none focus:border-accent/50 text-white"
                      />
                      <button 
                        onClick={addGoal}
                        className="bg-accent/20 text-accent p-2 rounded hover:bg-accent/30 transition-colors"
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {goals.map((goal) => (
                  <div 
                    key={goal.id}
                    className={cn(
                      "group flex flex-col p-3 rounded-lg border transition-all cursor-pointer",
                      activeGoalId === goal.id 
                        ? "bg-accent/10 border-accent/30" 
                        : "bg-white/[0.02] border-white/5 hover:border-white/10"
                    )}
                    onClick={() => setActiveGoalId(goal.id)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col gap-0.5">
                        <span className={cn(
                          "text-xs font-medium transition-colors",
                          activeGoalId === goal.id ? "text-accent" : "text-white/70"
                        )}>
                          {goal.title}
                        </span>
                        <span className="text-[10px] text-white/30 uppercase tracking-wider">
                          {formatGoalTime(goal.secondsSpent + (activeGoalId === goal.id ? sessionSeconds : 0))} focused
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteGoal(goal.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-5 block">Atmosphere</span>
              
              <div className="mb-6">
                <span className="text-[9px] uppercase tracking-[0.1em] text-white/20 mb-3 block">Ambient</span>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setCurrentSound(null)}
                    className={cn(
                      "font-serif italic text-base text-left transition-all w-fit border-b border-transparent",
                      currentSound === null ? "text-white border-accent pb-0.5" : "text-white/40 hover:text-white/60"
                    )}
                  >
                    Silence
                  </button>
                  {SOUNDS.filter(s => s.category === 'Ambient').map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setCurrentSound(s)}
                      className={cn(
                        "font-serif italic text-base text-left transition-all w-fit border-b border-transparent",
                        currentSound?.id === s.id ? "text-white border-accent pb-0.5" : "text-white/40 hover:text-white/60"
                      )}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <span className="text-[9px] uppercase tracking-[0.1em] text-white/20 mb-3 block">Sleep Sounds</span>
                <div className="flex flex-col gap-3">
                  {SOUNDS.filter(s => s.category === 'Sleep').map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setCurrentSound(s)}
                      className={cn(
                        "font-serif italic text-base text-left transition-all w-fit border-b border-transparent",
                        currentSound?.id === s.id ? "text-white border-accent pb-0.5" : "text-white/40 hover:text-white/60"
                      )}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">Fade Out</span>
                <button 
                  onClick={toggleFade}
                  className={cn(
                    "w-8 h-4 rounded-full relative transition-colors duration-300",
                    isFadeActive ? "bg-accent" : "bg-white/10"
                  )}
                >
                  <div className={cn(
                    "absolute top-0.5 w-3 h-3 rounded-full transition-all duration-300",
                    isFadeActive ? "left-4.5 bg-bg-dark" : "left-0.5 bg-white/40"
                  )} />
                </button>
              </div>
              
              {isFadeActive && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4"
                >
                  <div className="flex justify-between text-[10px] text-white/40 mb-2">
                    <span>Fading over {fadeDuration}m</span>
                    <span>{Math.ceil(fadeTimeLeft / 60)}m left</span>
                  </div>
                  <div className="w-full h-[1px] bg-white/10 relative">
                    <motion.div 
                      className="absolute left-0 top-0 h-full bg-accent"
                      style={{ width: `${(fadeTimeLeft / (fadeDuration * 60)) * 100}%` }}
                    />
                  </div>
                </motion.div>
              )}

              <div className="flex items-center gap-4">
                <span className="text-[10px] text-white/20">Duration</span>
                <input 
                  type="range" 
                  min="5" 
                  max="120" 
                  step="5" 
                  value={fadeDuration}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setFadeDuration(val);
                    if (isFadeActive) setFadeTimeLeft(val * 60);
                  }}
                  className="flex-1 h-[1px] bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent/50"
                />
                <span className="text-[10px] text-white/40 w-8">{fadeDuration}m</span>
              </div>
            </div>

            <div className="mt-10">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4 block">Volume</span>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="flex-1 h-[1px] bg-white/20 rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[11px] text-white/40">App Lock Active</span>
              <button 
                onClick={() => setIsLocked(!isLocked)}
                className={cn(
                  "w-10 h-5 rounded-full relative transition-colors duration-300",
                  isLocked ? "bg-accent" : "bg-white/10"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-3 h-3 rounded-full transition-all duration-300",
                  isLocked ? "left-6 bg-bg-dark" : "left-1 bg-white/40"
                )} />
              </button>
            </div>

            <button 
              onClick={toggleTimer}
              className="w-full border border-accent text-accent py-4 text-[12px] uppercase tracking-[0.2em] hover:bg-accent hover:text-bg-dark transition-all duration-300"
            >
              {isActive ? 'Pause Session' : 'Start Session'}
            </button>
            
            <button 
              onClick={resetTimer}
              className="w-full mt-3 text-white/20 hover:text-white/40 py-2 text-[10px] uppercase tracking-[0.2em] transition-all"
            >
              Reset Timer
            </button>

            <p className="text-[10px] text-white/40 mt-5 leading-relaxed">
              Focus mode is enabled. All notifications are suppressed until the timer expires.
            </p>
          </div>
        </div>
      </div>

      {/* Full Screen Lock Overlay */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg-dark/80 backdrop-blur-md"
          >
            <div className="text-center px-6">
              <span className="font-serif italic text-xl md:text-2xl text-accent mb-4 block">Deep Focus</span>
              <div className={cn("font-serif text-[100px] sm:text-[140px] md:text-[180px] leading-none font-light tracking-[-0.03em] tabular-nums mb-12", currentTheme.text)}>
                {formatTime(timeLeft)}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsLocked(false)}
                className="flex items-center gap-3 px-8 py-4 border border-white/10 rounded-full text-white/40 hover:text-white hover:border-white/20 transition-all group mx-auto"
              >
                <Unlock size={20} className="group-hover:text-accent transition-colors" />
                <span className="text-[11px] uppercase tracking-[0.2em]">Unlock Interface</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .writing-mode-vertical-rl { writing-mode: vertical-rl; }
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 10px;
          width: 10px;
          border-radius: 50%;
          background: #D4AF37;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
        }
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
      `}} />
    </div>
  );
}
