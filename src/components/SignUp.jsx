import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap, Briefcase, FlaskConical, PenLine, BookOpen, BookMarked,
  User, BarChart2, BarChart3, PieChart, Code2, Scale, Layers, Sparkles,
  Stethoscope, Camera, Music, ChefHat, Newspaper, Heart, FileText,
  Mic, Video, Star, FilePen, MessageSquare, Monitor, Server, Database,
  Smartphone, Gamepad2, GitBranch, Bug, Shield, Cloud, Network,
  Brain, Palette, Package, Megaphone, DollarSign, Microscope,
  LayoutDashboard, Pencil, ClipboardCheck, Users
} from 'lucide-react';
import { authService } from '../api/authService';
import { userService } from '../api/userService';
import Alert from './globals/Alert';
import Toast from './globals/Toast';

// ── Audio helpers (Web Audio API, no files needed) ──────────────────────────
let _audioCtx = null;
function ac() {
  if (!_audioCtx || _audioCtx.state === 'closed') {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

function playCardSelect() {
  try {
    const ctx = ac();
    // Two ascending notes — "confirmed selection" feel
    [[0, 560], [0.07, 840]].forEach(([delay, freq]) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ctx.currentTime + delay;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.start(t);
      osc.stop(t + 0.12);
    });
  } catch (_) {}
}

function playButtonClick() {
  try {
    const ctx  = ac();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.07);
    gain.gain.setValueAtTime(0.14, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch (_) {}
}

function playCheckTick() {
  try {
    const ctx  = ac();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  } catch (_) {}
}
import { SocialButton } from './SocialButtons';

const ROLE_META = {
  // Education
  student:                  { Icon: GraduationCap  },
  teacher:                  { Icon: BookOpen        },
  lecturer:                 { Icon: BookMarked      },
  educator:                 { Icon: BookOpen        },
  professor:                { Icon: BookMarked      },
  tutor:                    { Icon: GraduationCap   },

  // Content & Media
  creator:                  { Icon: Sparkles        },
  contentcreator:           { Icon: Sparkles        },
  blogger:                  { Icon: FileText        },
  journalist:               { Icon: Newspaper       },
  podcaster:                { Icon: Mic             },
  vlogger:                  { Icon: Video           },
  influencer:               { Icon: Star            },
  editor:                   { Icon: FilePen         },
  reviewer:                 { Icon: MessageSquare   },
  writer:                   { Icon: PenLine         },
  copywriter:               { Icon: Pencil          },
  author:                   { Icon: PenLine         },

  // Engineering / Dev
  developer:                { Icon: Code2           },
  engineer:                 { Icon: Code2           },
  softwaredeveloper:        { Icon: Code2           },
  softwareengineer:         { Icon: Code2           },
  frontenddeveloper:        { Icon: Monitor         },
  backenddeveloper:         { Icon: Server          },
  fullstackdeveloper:       { Icon: Layers          },
  mobiledeveloper:          { Icon: Smartphone      },
  gamedeveloper:            { Icon: Gamepad2        },
  devopsengineer:           { Icon: GitBranch       },
  qaengineer:               { Icon: Bug             },
  securityengineer:         { Icon: Shield          },
  cloudengineer:            { Icon: Cloud           },
  blockchaindeveloper:      { Icon: Network         },

  // Data & AI
  datascientist:            { Icon: FlaskConical    },
  dataanalyst:              { Icon: BarChart2       },
  dataengineer:             { Icon: Database        },
  aiengineer:               { Icon: Brain           },
  machinelearningengineer:  { Icon: Brain           },
  analyst:                  { Icon: BarChart2       },
  businessanalyst:          { Icon: BarChart3       },
  researcher:               { Icon: Microscope      },

  // Design
  designer:                 { Icon: Palette         },
  graphicdesigner:          { Icon: Palette         },
  uxdesigner:               { Icon: LayoutDashboard },
  uidesigner:               { Icon: Monitor         },
  productdesigner:          { Icon: Package         },

  // Business / Professional
  professional:             { Icon: Briefcase       },
  projectmanager:           { Icon: ClipboardCheck  },
  productmanager:           { Icon: Package         },
  marketing:                { Icon: Megaphone       },
  marketer:                 { Icon: Megaphone       },
  finance:                  { Icon: DollarSign      },
  accountant:               { Icon: DollarSign      },
  lawyer:                   { Icon: Scale           },

  // Health
  doctor:                   { Icon: Stethoscope     },
  nurse:                    { Icon: Heart           },

  // Other
  photographer:             { Icon: Camera          },
  musician:                 { Icon: Music           },
  chef:                     { Icon: ChefHat         },
  nonprofit:                { Icon: Heart           },
  hr:                       { Icon: Users           },
};

function getRoleMeta(type) {
  const key = type.toLowerCase().replace(/_/g, '');
  return ROLE_META[key] || { Icon: User };
}

function formatLabel(type) {
  return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const LEFT_CONTENT = {
  1: {
    line1: 'First, tell us',
    line2: 'who you are.',
    sub: 'Your role helps us personalise the experience from day one.',
  },
  2: {
    line1: "Now, let's make",
    line2: 'it yours.',
    sub: 'Your details stay private and fully under your control.',
  },
  3: {
    line1: 'One last',
    line2: 'step.',
    sub: "You're moments away from your creative workspace.",
  },
};

function FloatingInput({ id, label, type = 'text', value, onChange, children }) {
  return (
    <div className="relative pt-5 pb-1">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder=" "
        className="peer w-full bg-transparent border-0 border-b border-slate-200 focus:border-purple-500 focus:outline-none focus:ring-0 text-slate-800 text-sm py-1.5 transition-colors duration-200"
      />
      <label
        htmlFor={id}
        className="absolute left-0 top-5 text-slate-400 text-sm pointer-events-none transition-all duration-200
          peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-placeholder-shown:font-normal
          peer-focus:!top-0 peer-focus:!text-[10px] peer-focus:!text-purple-500 peer-focus:!font-semibold peer-focus:!uppercase peer-focus:!tracking-wider
          peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-slate-400 peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wider"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function EmailStatus({ email }) {
  const checks = [
    { label: 'Has @',          pass: /@/.test(email)                        },
    { label: 'Has domain',     pass: /^[^@]+@[^@]+\.[^@]{2,}$/.test(email) },
    { label: 'No spaces',      pass: !/\s/.test(email)                      },
    { label: 'Valid format',   pass: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) },
  ];
  const score   = checks.filter(c => c.pass).length;
  const isValid = score === 4;

  const color = isValid ? '#10b981' : score >= 2 ? '#f59e0b' : '#ef4444';
  const label = isValid ? 'Valid email' : score >= 2 ? 'Almost there' : 'Invalid format';

  return (
    <div style={{ animation: 'stepIn 0.2s ease-out' }}>
      <div className="flex gap-1 mb-1.5">
        {checks.map((c, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: c.pass ? color : '#e2e8f0' }}
          />
        ))}
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color }}>
        {label}
      </p>
    </div>
  );
}

function PasswordStrength({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const meta = [
    { label: 'Weak',   color: '#ef4444' },
    { label: 'Fair',   color: '#f59e0b' },
    { label: 'Good',   color: '#3b82f6' },
    { label: 'Strong', color: '#10b981' },
  ];
  const { label, color } = meta[Math.max(score - 1, 0)];

  return (
    <div>
      <div className="flex gap-1 mb-1.5">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-400"
            style={{ backgroundColor: i < score ? color : '#e2e8f0' }}
          />
        ))}
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: score > 0 ? color : '#94a3b8' }}>
        {score > 0 ? label : 'Enter a password'}
      </p>
    </div>
  );
}

export default function SignUp() {
  const [step, setStep]           = useState(1);
  const [stepKey, setStepKey]     = useState(0);
  const [leftKey, setLeftKey]     = useState(0);
  const [formData, setFormData]   = useState({ full_name: '', email: '', password: '', type: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [success, setSuccess]     = useState(null);
  const [userTypes, setUserTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);

  useEffect(() => {
    const fetchUserTypes = async () => {
      try {
        const response = await userService.getUserTypes();
        const types = response.data || response;
        if (Array.isArray(types)) setUserTypes(types);
      } catch (err) {
        console.error('Failed to load user types:', err);
      } finally {
        setLoadingTypes(false);
      }
    };
    fetchUserTypes();
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const goToStep = (next) => {
    setError(null);
    setStepKey(k => k + 1);
    setLeftKey(k => k + 1);
    setStep(next);
  };

  const handleNext = () => {
    playButtonClick();
    if (step === 1) {
      if (!formData.type) {
        setError({ message: 'Please select your role to continue.' });
        return;
      }
    }
    if (step === 2) {
      if (!formData.full_name.trim()) {
        setError({ message: 'Please enter your full name.' });
        return;
      }
      if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
        setError({ message: 'Please enter a valid email address.' });
        return;
      }
    }
    goToStep(step + 1);
  };

  const handleBack = () => { playButtonClick(); goToStep(step - 1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.password) {
      setError({ message: 'Please create a password.' });
      return;
    }
    if (!agreeToTerms) {
      setError({ message: 'You must agree to the Terms and Privacy Policy.' });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await authService.signup({ ...formData, agreeToTerms });
      setSuccess({ message: response.message || 'Success! Please check your email to verify your account.' });
    } catch (err) {
      let details = [];
      if (err?.errors) details = Object.values(err.errors).flat();
      setError({ message: err?.message || 'An error occurred during signup', details });
    } finally {
      setLoading(false);
    }
  };

  const progress = (step / 3) * 100;
  const lc = LEFT_CONTENT[step];

  return (
    <main className="w-full max-w-6xl mx-auto flex flex-col md:flex-row overflow-hidden bg-white min-h-[85vh]">

      {/* ── Left decorative section ── */}
      <section
        className="hidden md:flex flex-1 relative p-12 overflow-hidden items-center justify-center border-r border-stone-200"
        style={{
          backgroundColor: '#fdfaf3',
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.02) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      >
        <div className="relative z-10 w-full max-w-lg">
          <div className="relative h-[400px] mb-8">

            {/* Main card */}
            <div
              className="absolute inset-0 bg-white paper-scrap transform rotate-1 p-8 flex flex-col justify-center"
              style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))', border: '1px solid #e7e2d5' }}
            >
              {/* Dynamic tagline — re-keyed on step change */}
              <div key={leftKey} style={{ animation: 'stepIn 0.45s ease-out' }}>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 leading-tight">
                  {lc.line1}
                  <br />
                  <span className="italic text-purple-600">{lc.line2}</span>
                </h1>
                <p className="text-slate-500 text-[15px] font-normal">{lc.sub}</p>
              </div>

              {/* Step pills */}
              <div className="flex gap-2 mt-8">
                {[1, 2, 3].map(s => (
                  <div
                    key={s}
                    className="h-1.5 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: s === step ? '32px' : '8px',
                      backgroundColor: s <= step ? '#7c3aed' : '#e2e8f0',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Yellow pentagon accent */}
            <div
              className="absolute -top-10 -right-4 w-32 h-32 flex items-center justify-center transform rotate-12"
              style={{ backgroundColor: '#ffedbc', filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))', border: '1px solid #e7e2d5', clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }}
            >
              <span className="material-symbols-outlined text-4xl text-amber-600">edit_note</span>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-2 h-2 rounded-full bg-slate-400 shadow-inner" />
            </div>

            {/* Testimonial sticky note */}
            <div
              className="absolute -bottom-6 -left-6 w-40 h-28 bg-pink-100 p-4 transform -rotate-3"
              style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))', border: '1px solid #e7e2d5', clipPath: 'polygon(0% 2%, 2% 0%, 98% 1%, 100% 3%, 99% 97%, 97% 100%, 3% 99%, 0% 98%)' }}
            >
              <div className="tape absolute -top-4 left-1/2 -translate-x-1/2" style={{ background: 'rgba(255,255,255,0.4)', width: '60px', height: '20px', transform: 'rotate(-15deg)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', backdropFilter: 'blur(1px)' }} />
              <p className="font-handwritten text-[15px] leading-none text-rose-800 pt-2">"This app changed my whole workflow..."</p>
              <div className="flex items-center gap-2 mt-2">
                <img
                  alt="Sam O."
                  className="w-6 h-6 rounded-full border border-rose-200"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8Xu1OjV5L3VKF6dwYX_LVs0lUBVgEl1Sx4GZuWU6dUCKTUS_XQh8zRjTZZeJUri_YHl0bjKdpUKlVdVq3RxPasgqwThglTNPNhmd8XNNCTgYhjRspL6nKRF9M7e41p3z74BDxIcbegQoXDl86RONwEg-n8DrL3n5Gl_4I3uf8GWyGZ6YOJFK08FWIFKSs6VsLduzQCXF2AtEpTxkh7t4y5O7yDRV448fhgFjR7BRgjsD9q4_0ev69zQaKbFhzs8ufQzi6K-b2LFHU"
                />
                <span className="text-[10px] uppercase tracking-wider font-bold text-rose-700">Sam O.</span>
              </div>
            </div>

            {/* Green circle */}
            <div
              className="absolute top-20 -right-12 w-24 h-24 rounded-full flex items-center justify-center transform -rotate-6"
              style={{ backgroundColor: '#dcfce7', filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))', border: '1px solid #e7e2d5' }}
            >
              <span className="material-symbols-outlined text-3xl text-emerald-600">auto_awesome</span>
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full shadow-md" />
            </div>

            {/* Blue card */}
            <div
              className="absolute bottom-10 -right-8 w-36 h-48 p-4 transform rotate-6"
              style={{ backgroundColor: '#e0e7ff', filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))', border: '1px solid #e7e2d5', clipPath: 'polygon(0% 2%, 2% 0%, 98% 1%, 100% 3%, 99% 97%, 97% 100%, 3% 99%, 0% 98%)' }}
            >
              <div className="w-full h-24 bg-indigo-200/50 rounded-sm mb-2" />
              <div className="space-y-1">
                <div className="h-1 w-full bg-indigo-300/30" />
                <div className="h-1 w-4/5 bg-indigo-300/30" />
                <div className="h-1 w-full bg-indigo-300/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Right form section ── */}
      <section className="flex-1 flex flex-col justify-center bg-white relative overflow-hidden">

        {/* Progress bar */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-slate-100">
          <div
            className="h-full bg-purple-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-8 md:p-16 w-full">
          <div className="max-w-md mx-auto w-full">

            {/* Step counter + back button */}
            <div className="flex items-center gap-2 mb-6 md:mb-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center justify-center w-7 h-7 rounded-full border border-slate-200 text-slate-400 hover:border-purple-300 hover:text-purple-600 transition-colors mr-1"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>arrow_back</span>
                </button>
              )}
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Step {step} of 3</span>
            </div>

            {/* Animated step content */}
            <div key={stepKey} style={{ animation: 'stepIn 0.3s ease-out' }}>

              {/* ── Step 1: Role picker ── */}
              {step === 1 && (
                <>
                  <header className="mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">I am a...</h2>
                    <p className="text-slate-400 text-[13px]">Choose the role that best describes you.</p>
                  </header>

                  {error && <div className="mb-4"><Alert type="error" message={error.message} /></div>}

                  {loadingTypes ? (
                    <div className="grid grid-cols-3 gap-2">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-[60px] bg-slate-50 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-y-auto custom-scrollbar pr-1" style={{ maxHeight: '260px' }}>
                    <div className="grid grid-cols-3 gap-2">
                      {userTypes.map((type, i) => {
                        const { Icon } = getRoleMeta(type);
                        const isSelected = formData.type === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              playCardSelect();
                              setFormData(prev => ({ ...prev, type }));
                              setError(null);
                            }}
                            className="relative flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-lg border text-center transition-all duration-200 active:scale-[0.96]"
                            style={{
                              animation: 'fadeUp 0.4s ease-out both',
                              animationDelay: `${i * 35}ms`,
                              borderColor: isSelected ? '#7c3aed' : '#f1f5f9',
                              backgroundColor: isSelected ? '#faf5ff' : '#fafafa',
                              boxShadow: isSelected ? '0 0 0 1.5px #7c3aed' : '0 1px 2px rgba(0,0,0,0.04)',
                            }}
                          >
                            <Icon size={16} color={isSelected ? '#7c3aed' : '#94a3b8'} />
                            <p className="text-[10px] font-semibold leading-tight" style={{ color: isSelected ? '#6d28d9' : '#475569' }}>
                              {formatLabel(type)}
                            </p>
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-3 h-3 bg-purple-600 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-white" style={{ fontSize: '9px', fontVariationSettings: "'FILL' 1" }}>check</span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!formData.type || loadingTypes}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm active:scale-[0.98]"
                      style={{ boxShadow: formData.type ? '0 8px 20px -4px rgba(124,58,237,0.35)' : 'none' }}
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {/* ── Step 2: Account details ── */}
              {step === 2 && (
                <>
                  <header className="mb-6 md:mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Your details</h2>
                    <p className="text-slate-400 text-[13px]">How should we address you?</p>
                  </header>

                  <SocialButton />

                  <div className="relative flex py-4 items-center">
                    <div className="flex-grow border-t border-slate-100" />
                    <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">or email</span>
                    <div className="flex-grow border-t border-slate-100" />
                  </div>

                  {error && <div className="mb-4"><Alert type="error" message={error.message} /></div>}

                  <div className="space-y-5">
                    <FloatingInput
                      id="full_name"
                      label="Full Name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                    />
                    <div>
                      <FloatingInput
                        id="email"
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                      {formData.email && (
                        <div className="mt-2">
                          <EmailStatus email={formData.email} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-8">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm active:scale-[0.98]"
                      style={{ boxShadow: '0 8px 20px -4px rgba(124,58,237,0.35)' }}
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {/* ── Step 3: Password + Terms ── */}
              {step === 3 && (
                <form onSubmit={handleSubmit}>
                  <header className="mb-6 md:mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Secure your account</h2>
                    <p className="text-slate-400 text-[13px]">Create a strong password to protect your workspace.</p>
                  </header>

                  {error && <div className="mb-4"><Alert type="error" message={error.message} details={error.details} /></div>}

                  <div className="space-y-5">
                    {/* Password field */}
                    <div className="relative pt-5 pb-1">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder=" "
                        className="peer w-full bg-transparent border-0 border-b border-slate-200 focus:border-purple-500 focus:outline-none focus:ring-0 text-slate-800 text-sm py-1.5 pr-8 transition-colors duration-200"
                      />
                      <label
                        htmlFor="password"
                        className="absolute left-0 top-5 text-slate-400 text-sm pointer-events-none transition-all duration-200
                          peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-placeholder-shown:font-normal
                          peer-focus:!top-0 peer-focus:!text-[10px] peer-focus:!text-purple-500 peer-focus:!font-semibold peer-focus:!uppercase peer-focus:!tracking-wider
                          peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-slate-400 peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wider"
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-0 bottom-2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>

                    {formData.password && (
                      <div style={{ animation: 'stepIn 0.25s ease-out' }}>
                        <PasswordStrength password={formData.password} />
                      </div>
                    )}

                    {/* Terms */}
                    <label className="flex items-start gap-3 cursor-pointer group pt-1">
                      <div className="relative mt-0.5 flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={agreeToTerms}
                          onChange={e => { playCheckTick(); setAgreeToTerms(e.target.checked); }}
                          className="sr-only"
                        />
                        <div
                          className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200"
                          style={{
                            backgroundColor: agreeToTerms ? '#7c3aed' : '#fff',
                            borderColor: agreeToTerms ? '#7c3aed' : '#cbd5e1',
                          }}
                        >
                          {agreeToTerms && (
                            <span className="material-symbols-outlined text-white" style={{ fontSize: '12px', fontVariationSettings: "'FILL' 1" }}>check</span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 leading-relaxed">
                        I agree to the{' '}
                        <a href="/privacy" className="text-purple-600 font-semibold hover:underline">Privacy Policy</a>
                        {' '}and{' '}
                        <a href="/privacy" className="text-purple-600 font-semibold hover:underline">Data Security</a>
                        {' '}terms.
                      </span>
                    </label>
                  </div>

                  <div className="mt-8">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 active:scale-[0.98]"
                      style={{ boxShadow: '0 8px 20px -4px rgba(124,58,237,0.35)' }}
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating account...
                        </>
                      ) : 'Create Free Account'}
                    </button>
                  </div>
                </form>
              )}

            </div>

            {/* Footer */}
            <footer className="mt-8 text-center">
              <p className="text-slate-400 text-xs">
                Already have an account?{' '}
                <Link to="/signin" className="text-purple-600 font-semibold hover:underline font-handwritten text-sm ml-0.5">
                  Log in here
                </Link>
              </p>
            </footer>

          </div>
        </div>
      </section>

      <Toast message={success?.message} type="success" onClose={() => setSuccess(null)} />
    </main>
  );
}
