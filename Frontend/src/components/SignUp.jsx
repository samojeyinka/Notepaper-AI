import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap, Briefcase, FlaskConical, PenLine, BookOpen, BookMarked,
  User, BarChart2, BarChart3, Code2, Scale, Layers, Sparkles,
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
import { SocialButton } from './SocialButtons';
import AuthShell from './auth/AuthShell';

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
  } catch { /* audio is best-effort */ }
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
  } catch { /* audio is best-effort */ }
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
  } catch { /* audio is best-effort */ }
}

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
    sub: 'Your role helps us tailor the experience from day one.',
  },
  2: {
    line1: "Now, let's make",
    line2: 'it yours.',
    sub: 'Your details stay private and fully under your control.',
  },
  3: {
    line1: 'One last',
    line2: 'step.',
    sub: "You're moments away from your own notebook.",
  },
};

// ── Input ────────────────────────────────────────────────────────────────────
const inputBase =
  'w-full  border bg-white px-4 py-3 text-[15px] text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-plum-200 focus:border-plum-400 transition-colors';

function Field({ id, label, type = 'text', value, onChange, placeholder, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-semibold text-stone-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={inputBase}
        />
        {children}
      </div>
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

  const color = isValid ? '#059669' : score >= 2 ? '#d97706' : '#dc2626';
  const label = isValid ? 'Valid email' : score >= 2 ? 'Almost there' : 'Invalid format';

  return (
    <div className="mt-2.5">
      <div className="flex gap-1 mb-1.5">
        {checks.map((c, i) => (
          <div
            key={i}
            className="h-1 flex-1  transition-all duration-300"
            style={{ backgroundColor: c.pass ? color : '#e7e5e4' }}
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
    { label: 'Weak',   color: '#dc2626' },
    { label: 'Fair',   color: '#d97706' },
    { label: 'Good',   color: '#2563eb' },
    { label: 'Strong', color: '#059669' },
  ];
  const { label, color } = meta[Math.max(score - 1, 0)];

  return (
    <div>
      <div className="flex gap-1 mb-1.5">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="h-1 flex-1  transition-all duration-400"
            style={{ backgroundColor: i < score ? color : '#e7e5e4' }}
          />
        ))}
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: score > 0 ? color : '#a8a29e' }}>
        {score > 0 ? label : 'Enter a password'}
      </p>
    </div>
  );
}

export default function SignUp() {
  const [step, setStep]           = useState(1);
  const [stepKey, setStepKey]     = useState(0);
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
      setFormData({ full_name: '', email: '', password: '', type: '' });
      setAgreeToTerms(false);
      goToStep(1);
    } catch (err) {
      let details = [];
      if (err?.errors) details = Object.values(err.errors).flat();
      setError({ message: err?.message || 'An error occurred during signup', details });
    } finally {
      setLoading(false);
    }
  };

  const primaryBtn =
    'w-full bg-stone-900 hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5  transition-colors text-[15px] flex items-center justify-center gap-2';

  const lc = LEFT_CONTENT[step];

  return (
    <>
      <AuthShell
        aside={{
          title: [lc.line1, lc.line2],
          sub: lc.sub,
          step,
          totalSteps: 3,
        }}
      >
              {/* Step counter + back */}
              <div className="flex items-center gap-3 mb-6">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    aria-label="Go back"
                    className="flex items-center justify-center w-8 h-8  border border-stone-200 text-stone-500 hover:border-plum-300 hover:text-plum-700 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  </button>
                )}
                <span className="text-[12px] font-bold text-stone-300 uppercase tracking-widest">
                  Step {step} of 3
                </span>
              </div>

              {/* Animated step content */}
              <div key={stepKey} style={{ animation: 'fadeUp 0.35s ease-out' }}>

                {/* ── Step 1: Role picker ── */}
                {step === 1 && (
                  <>
                    <header className="mb-6">
                      <p className="eyebrow text-plum-700 mb-3">Create your account</p>
                      <h1 className="font-display-serif text-3xl md:text-4xl font-semibold tracking-tight text-stone-900">
                        I am a&hellip;
                      </h1>
                      <p className="text-stone-500 text-[15px] mt-2">Choose the role that best describes you.</p>
                    </header>

                    {error && <div className="mb-4"><Alert type="error" message={error.message} /></div>}

                    {loadingTypes ? (
                      <div className="grid grid-cols-3 gap-2.5">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="h-[76px] bg-stone-100  animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-y-auto custom-scrollbar pr-1" style={{ maxHeight: '260px' }}>
                        <div className="grid grid-cols-3 gap-2.5">
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
                                className={`relative flex flex-col items-center justify-center gap-2 p-3  border text-center transition-all duration-200 active:scale-[0.97] ${
                                  isSelected
                                    ? 'border-plum-500 bg-plum-50 shadow-[0_0_0_1.5px_#6c4ea6]'
                                    : 'border-stone-200 bg-stone-50/60 hover:border-stone-300'
                                }`}
                                style={{ animation: 'fadeUp 0.35s ease-out both', animationDelay: `${Math.min(i, 12) * 30}ms` }}
                              >
                                <Icon size={17} color={isSelected ? '#6c4ea6' : '#a8a29e'} />
                                <p className="text-[11px] font-semibold leading-tight" style={{ color: isSelected ? '#583d8b' : '#57534e' }}>
                                  {formatLabel(type)}
                                </p>
                                {isSelected && (
                                  <span className="absolute top-2 right-2 w-4 h-4  bg-plum-700 text-white flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="mt-6">
                      <button type="button" onClick={handleNext} disabled={!formData.type || loadingTypes} className={primaryBtn}>
                        Continue
                      </button>
                    </div>
                  </>
                )}

                {/* ── Step 2: Account details ── */}
                {step === 2 && (
                  <>
                    <header className="mb-6">
                      <p className="eyebrow text-plum-700 mb-3">Your details</p>
                      <h1 className="font-display-serif text-3xl md:text-4xl font-semibold tracking-tight text-stone-900">
                        How should we address you?
                      </h1>
                    </header>

                    <SocialButton />

                    <div className="relative flex py-3 items-center">
                      <div className="flex-grow border-t border-stone-100" />
                      <span className="flex-shrink mx-4 text-stone-400 text-[11px] font-semibold uppercase tracking-widest">
                        or continue with email
                      </span>
                      <div className="flex-grow border-t border-stone-100" />
                    </div>

                    {error && <div className="mb-4"><Alert type="error" message={error.message} /></div>}

                    <div className="space-y-5">
                      <Field id="full_name" label="Full name" value={formData.full_name} onChange={handleInputChange} placeholder="e.g. Amara Bello" />
                      <div>
                        <Field id="email" label="Email address" type="email" value={formData.email} onChange={handleInputChange} placeholder="you@yourdomain.com" />
                        {formData.email && <EmailStatus email={formData.email} />}
                      </div>
                    </div>

                    <div className="mt-7">
                      <button type="button" onClick={handleNext} className={primaryBtn}>
                        Continue
                      </button>
                    </div>
                  </>
                )}

                {/* ── Step 3: Password + Terms ── */}
                {step === 3 && (
                  <form onSubmit={handleSubmit}>
                    <header className="mb-6">
                      <p className="eyebrow text-plum-700 mb-3">Secure your account</p>
                      <h1 className="font-display-serif text-3xl md:text-4xl font-semibold tracking-tight text-stone-900">
                        Choose a password
                      </h1>
                      <p className="text-stone-500 text-[15px] mt-2">Something strong you&rsquo;ll remember.</p>
                    </header>

                    {error && <div className="mb-4"><Alert type="error" message={error.message} details={error.details} /></div>}

                    <div className="space-y-5">
                      <div>
                        <Field
                          id="password"
                          label="Password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Min. 8 characters, with a number and a symbol"
                        >
                          <button
                            type="button"
                            onClick={() => setShowPassword(v => !v)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              {showPassword ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                        </Field>
                        {formData.password && <PasswordStrength password={formData.password} />}
                      </div>

                      <label className="flex items-start gap-3 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={agreeToTerms}
                          onChange={e => { playCheckTick(); setAgreeToTerms(e.target.checked); }}
                          className="sr-only"
                        />
                        <span
                          className={`w-[18px] h-[18px] mt-0.5  border-2 flex items-center justify-center transition-colors shrink-0 ${
                            agreeToTerms ? 'bg-plum-700 border-plum-700' : 'bg-white border-stone-300'
                          }`}
                        >
                          {agreeToTerms && (
                            <span className="material-symbols-outlined text-white text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                          )}
                        </span>
                        <span className="text-[13px] text-stone-500 leading-relaxed">
                          I agree to the{' '}
                          <Link to="/terms" className="text-plum-700 font-semibold hover:text-plum-600">Terms of Service</Link>
                          {' '}and{' '}
                          <Link to="/privacy" className="text-plum-700 font-semibold hover:text-plum-600">Privacy Policy</Link>.
                        </span>
                      </label>
                    </div>

                    <div className="mt-7">
                      <button type="submit" disabled={loading} className={primaryBtn}>
                        {loading ? (
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white  animate-spin" />
                        ) : (
                          <>
                            Create free account
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

              </div>

              {/* Footer */}
              <footer className="mt-8 text-center">
                <p className="text-stone-500 text-[14px]">
                  Already have an account?{' '}
                  <Link to="/signin" className="text-plum-700 font-semibold hover:text-plum-600 link-underline">
                    Log in here
                  </Link>
                </p>
              </footer>
      </AuthShell>

      <Toast message={success?.message} type="success" onClose={() => setSuccess(null)} />
    </>
  );
}
