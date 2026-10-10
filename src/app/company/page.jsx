'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Intersection Observer Hook ───
function useInView(options = {}) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, isInView];
}

// ─── Animated Counter ───
function AnimatedCounter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [ref, isInView] = useInView();

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Typewriter Effect ───
function Typewriter({ words, speed = 100, pause = 2000 }) {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          setText(currentWord.substring(0, charIndex + 1));
          setCharIndex((prev) => prev + 1);

          if (charIndex + 1 === currentWord.length) {
            setTimeout(() => setIsDeleting(true), pause);
          }
        } else {
          setText(currentWord.substring(0, charIndex - 1));
          setCharIndex((prev) => prev - 1);

          if (charIndex === 0) {
            setIsDeleting(false);
            setWordIndex((prev) => (prev + 1) % words.length);
          }
        }
      },
      isDeleting ? speed / 2 : speed
    );

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, wordIndex, words, speed, pause]);

  return (
    <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
      {text}
      <span className="animate-pulse text-teal-400">|</span>
    </span>
  );
}

// ─── Floating Particles ───
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-20"
          style={{
            width: `${Math.random() * 6 + 2}px`,
            height: `${Math.random() * 6 + 2}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `${['#14b8a6', '#10b981', '#06b6d4', '#34d399'][Math.floor(Math.random() * 4)]}`,
            animation: `float-particle ${Math.random() * 10 + 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── 3D Tilt Card ───
function TiltCard({ children, className = '' }) {
  const cardRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-all duration-300 ease-out ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
}

// ─── Animated Section Wrapper ───
function AnimatedSection({ children, className = '', delay = 0, direction = 'up' }) {
  const [ref, isInView] = useInView();

  const directionStyles = {
    up: 'translate-y-12',
    down: '-translate-y-12',
    left: 'translate-x-12',
    right: '-translate-x-12',
    scale: 'scale-90',
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className} ${
        isInView ? 'opacity-100 translate-y-0 translate-x-0 scale-100' : `opacity-0 ${directionStyles[direction]}`
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════
export default function CompanyPage() {
  const [activeTab, setActiveTab] = useState('patients');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [headerSolid, setHeaderSolid] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setHeaderSolid(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const keyFeatures = [
    {
      icon: '⚡',
      badge: 'Zero Friction',
      title: 'Offline Slip Referral System',
      description:
        'Enter offline superintendent referral slips directly without complex validation. Immediate hospital allocation with zero wait times.',
      gradient: 'from-amber-400 to-orange-500',
      bg: 'bg-amber-50',
    },
    {
      icon: '🩺',
      badge: 'Clinical Care',
      title: 'Doctor Consultations & E-Prescriptions',
      description:
        'Structured consultation notes, diagnoses, and categorised prescriptions (Initial, Interim, Final, Follow-up) tied to patient records.',
      gradient: 'from-teal-400 to-emerald-500',
      bg: 'bg-teal-50',
    },
    {
      icon: '☁️',
      badge: 'Fast & Secure',
      title: 'Cloudflare R2 Diagnostic Cloud',
      description:
        'Encrypted, lightning-fast storage for lab reports, CT/MRI scans, and prescription documents (PDF, JPG, PNG, WEBP).',
      gradient: 'from-cyan-400 to-blue-500',
      bg: 'bg-cyan-50',
    },
    {
      icon: '📱',
      badge: 'Mobile First',
      title: 'Patient Wellness Portal',
      description:
        'Mobile-first health dashboard for active referrals, medication schedules, diagnostic reports, and consultation timelines.',
      gradient: 'from-emerald-400 to-green-500',
      bg: 'bg-emerald-50',
    },
    {
      icon: '🛡️',
      badge: 'Multi-Tier Security',
      title: '6-Tier Role-Based Access Control',
      description:
        'Granular permissions for Super Admin, Sudo Admin, Area Managers, Support Staff, Hospital Staff, and Patients.',
      gradient: 'from-violet-400 to-purple-500',
      bg: 'bg-violet-50',
    },
    {
      icon: '📊',
      badge: 'Live Auditing',
      title: 'Real-Time Journey & Audit Logs',
      description:
        'Every referral event, status update, doctor note, and file upload is logged chronologically for full accountability.',
      gradient: 'from-rose-400 to-pink-500',
      bg: 'bg-rose-50',
    },
  ];

  const roleHighlights = {
    patients: {
      title: 'For Patients',
      subtitle: 'Effortless health tracking & referral activation',
      emoji: '🏥',
      features: [
        { text: 'Instant self-registration with ID Card & phone number', icon: '🪪' },
        { text: 'Activate offline superintendent referral slips in 2 taps', icon: '📋' },
        { text: 'Real-time referral progress & hospital assignment tracking', icon: '📍' },
        { text: 'Digital prescription viewer with dosage instructions', icon: '💊' },
        { text: 'Download lab test results, X-Rays, and MRI scans instantly', icon: '🔬' },
        { text: 'Complete consultation and doctor advice history', icon: '📖' },
      ],
      ctaText: 'Open Patient Portal',
      ctaLink: '/login',
    },
    hospitals: {
      title: 'For Hospitals & Doctors',
      subtitle: 'Streamlined patient intake & clinical documentation',
      emoji: '👨‍⚕️',
      features: [
        { text: '1-click patient check-in via referral slip or ID', icon: '✅' },
        { text: 'Structured consultation logger with diagnoses & treatment plans', icon: '📝' },
        { text: 'Digital prescription generator (Initial / Interim / Final / Follow-up)', icon: '💊' },
        { text: 'Order lab tests and upload diagnostic scans/PDFs via Cloudflare R2', icon: '☁️' },
        { text: 'Schedule follow-up visits and complete referral journeys', icon: '📅' },
        { text: 'Real-time department queue & patient history view', icon: '📊' },
      ],
      ctaText: 'Hospital Staff Login',
      ctaLink: '/login',
    },
    managers: {
      title: 'For Area Managers & Admins',
      subtitle: 'Full visibility, analytics, and operational governance',
      emoji: '📈',
      features: [
        { text: 'Area-wise referral distribution & hospital load balancing', icon: '🗺️' },
        { text: 'Multi-hospital performance analytics & turnaround times', icon: '📊' },
        { text: 'Intake registration for patients with offline slip assignments', icon: '🪪' },
        { text: 'Comprehensive audit trails for compliance and reporting', icon: '🔍' },
        { text: 'Department management, hospital onboarding & staff control', icon: '🏗️' },
        { text: 'Support ticket triage & issue resolution desk', icon: '🎫' },
      ],
      ctaText: 'Admin Dashboard Login',
      ctaLink: '/login',
    },
  };

  const steps = [
    {
      num: '01',
      title: 'Referral Slip Issued',
      desc: 'Superintendent issues an offline referral slip or patient self-registers online.',
      icon: '📄',
      color: 'from-teal-500 to-teal-600',
    },
    {
      num: '02',
      title: 'Hospital & Department Match',
      desc: 'Code is entered into SUSALI with instant hospital and department selection.',
      icon: '🏥',
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      num: '03',
      title: 'Doctor Visit & Scans',
      desc: 'Hospital performs consultation, uploads diagnostic scans & writes digital Rx.',
      icon: '🩺',
      color: 'from-cyan-500 to-cyan-600',
    },
    {
      num: '04',
      title: 'Digital Records on App',
      desc: 'Patient accesses all prescriptions, scan PDFs, and visit notes on their phone.',
      icon: '📱',
      color: 'from-teal-600 to-emerald-700',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 overflow-x-hidden selection:bg-teal-500 selection:text-white">
      {/* Global Animations CSS */}
      <style jsx global>{`
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        @keyframes float-medium {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-3deg); }
        }

        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }

        @keyframes slide-up-bounce {
          0% { transform: translateY(30px); opacity: 0; }
          60% { transform: translateY(-5px); opacity: 1; }
          100% { transform: translateY(0); }
        }

        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 5s ease-in-out infinite; }
        .animate-gradient-x { 
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite; 
        }
        .animate-shimmer { animation: shimmer 2s infinite; }
        .animate-pulse-ring { animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; }

        .stagger-1 { animation-delay: 100ms; }
        .stagger-2 { animation-delay: 200ms; }
        .stagger-3 { animation-delay: 300ms; }
        .stagger-4 { animation-delay: 400ms; }

        /* Smooth scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #14b8a6; border-radius: 999px; }
      `}</style>

      {/* ─── Header ─── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          headerSolid
            ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-slate-900/5 border-b border-slate-200/60'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-teal-600/25 group-hover:shadow-teal-600/40 group-hover:scale-110 transition-all duration-300">
              S
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-teal-700 to-emerald-700 bg-clip-text text-transparent">
              SUSALI
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            <a href="#features" className="px-3 py-2 text-sm font-semibold text-slate-600 hover:text-teal-700 transition-colors">
              Features
            </a>
            <a href="#workflow" className="px-3 py-2 text-sm font-semibold text-slate-600 hover:text-teal-700 transition-colors">
              How It Works
            </a>
            <a href="#roles" className="px-3 py-2 text-sm font-semibold text-slate-600 hover:text-teal-700 transition-colors">
              For Users
            </a>
            <div className="w-px h-6 bg-slate-200 mx-2" />
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-xl transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 rounded-xl shadow-md shadow-teal-600/20 hover:shadow-lg hover:shadow-teal-600/30 transition-all hover:scale-105"
            >
              Register Free
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-teal-50 transition-colors"
          >
            <div className="flex flex-col gap-1.5">
              <span className={`block w-5 h-0.5 bg-slate-700 rounded transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-slate-700 rounded transition-all duration-300 ${mobileMenuOpen ? 'opacity-0 scale-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-slate-700 rounded transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`md:hidden transition-all duration-500 ease-out overflow-hidden ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-white/95 backdrop-blur-xl border-t border-slate-200 px-4 py-6 space-y-2">
            {['features', 'workflow', 'roles'].map((id) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-all capitalize"
              >
                {id === 'workflow' ? 'How It Works' : id === 'roles' ? 'For Users' : id}
              </a>
            ))}
            <div className="pt-3 flex gap-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-3 text-sm font-bold text-teal-700 bg-teal-50 rounded-xl">
                Sign In
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-3 text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl shadow-md">
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Parallax orbs */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br from-teal-200/50 to-emerald-200/50 blur-3xl pointer-events-none"
          style={{ top: '10%', left: '20%', transform: `translateY(${scrollY * 0.15}px)` }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-br from-cyan-200/40 to-teal-200/40 blur-3xl pointer-events-none"
          style={{ bottom: '10%', right: '15%', transform: `translateY(${scrollY * -0.1}px)` }}
        />
        <div
          className="absolute w-[300px] h-[300px] rounded-full bg-gradient-to-br from-emerald-200/30 to-green-200/30 blur-3xl pointer-events-none"
          style={{ top: '50%', left: '60%', transform: `translateY(${scrollY * 0.08}px)` }}
        />

        <FloatingParticles />

        {/* Floating decorative shapes */}
        <div className="absolute top-32 left-10 sm:left-20 w-14 h-14 rounded-2xl bg-teal-400/10 border border-teal-400/20 animate-float-slow" />
        <div className="absolute top-48 right-10 sm:right-32 w-10 h-10 rounded-full bg-emerald-400/10 border border-emerald-400/20 animate-float-medium" />
        <div className="absolute bottom-40 left-16 w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 animate-float-slow" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection delay={0}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-teal-200 text-teal-800 text-xs font-bold mb-8 shadow-sm">
              <span className="relative flex w-2.5 h-2.5">
                <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                <span className="relative rounded-full w-2.5 h-2.5 bg-emerald-500" />
              </span>
              Healthcare Referral & Hospital Care Network
            </div>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Connecting Healthcare
              <br />
              <Typewriter
                words={['Patients', 'Doctors', 'Hospitals', 'Communities']}
                speed={120}
                pause={2500}
              />
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={400}>
            <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              SUSALI bridges offline medical referrals with modern digital hospital workflows,
              high-speed Cloudflare R2 diagnostic storage, and a mobile-first patient wellness experience.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={600}>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="group relative w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-sm rounded-2xl shadow-xl shadow-teal-600/25 hover:shadow-2xl hover:shadow-teal-600/35 active:scale-95 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Get Started as Patient
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-2xl border border-slate-200 shadow-lg shadow-slate-900/5 hover:shadow-xl transition-all active:scale-95"
              >
                Portal Login →
              </Link>
            </div>
          </AnimatedSection>

          {/* Metrics */}
          <AnimatedSection delay={800}>
            <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
              {[
                { value: 100, suffix: '%', label: 'Paperless Referrals', icon: '📄' },
                { value: 1, suffix: 's', label: 'Scan Load Speed', prefix: '< ', icon: '⚡' },
                { value: 6, suffix: '', label: 'Security Roles', icon: '🛡️' },
                { value: 24, suffix: '/7', label: 'Patient Access', icon: '📱' },
              ].map((m, i) => (
                <div
                  key={i}
                  className="group bg-white/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-teal-100/70 shadow-sm hover:shadow-lg hover:shadow-teal-600/5 hover:border-teal-300 transition-all duration-300 hover:-translate-y-1"
                >
                  <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">{m.icon}</span>
                  <p className="text-2xl sm:text-3xl font-black text-teal-700">
                    {m.prefix || ''}<AnimatedCounter end={m.value} />{m.suffix}
                  </p>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-1">{m.label}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs font-medium text-slate-400">Scroll to explore</span>
          <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section id="features" className="py-20 sm:py-28 bg-white border-y border-slate-200/60 relative">
        <FloatingParticles />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-4 py-1.5 rounded-full border border-teal-200">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                Platform Features
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mt-4">
                Engineered for Modern Healthcare
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-500">
                Everything needed to process referrals, consult patients, store diagnostics, and deliver care.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {keyFeatures.map((f, idx) => (
              <AnimatedSection key={idx} delay={idx * 100} direction={idx % 2 === 0 ? 'left' : 'right'}>
                <TiltCard>
                  <div className={`group relative rounded-3xl p-6 sm:p-7 border border-slate-200/80 hover:border-teal-300 bg-white hover:shadow-2xl hover:shadow-teal-600/8 transition-all duration-500 h-full flex flex-col`}>
                    {/* Shimmer on hover */}
                    <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer" />
                    </div>

                    <div className="relative z-10 flex-1">
                      <div className="flex items-center justify-between mb-5">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                          {f.icon}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${f.bg} text-slate-700 border border-slate-200/50`}>
                          {f.badge}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors duration-300">
                        {f.title}
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {f.description}
                      </p>
                    </div>

                    <div className="relative z-10 mt-5 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-teal-700 group-hover:text-teal-800 transition-colors">
                      <span>Explore feature</span>
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </TiltCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="workflow" className="py-20 sm:py-28 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-950 text-white relative overflow-hidden">
        <FloatingParticles />

        {/* Glow orbs */}
        <div className="absolute w-96 h-96 rounded-full bg-teal-500/10 blur-3xl top-0 left-0 pointer-events-none" />
        <div className="absolute w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl bottom-0 right-0 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-teal-300 bg-teal-900/70 px-4 py-1.5 rounded-full border border-teal-700/50">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                End-to-End Workflow
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mt-4">
                How SUSALI Powers Healthcare
              </h2>
              <p className="mt-3 text-sm sm:text-base text-teal-200/60">
                From offline slip issuance to hospital discharge and digital mobile access.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {steps.map((step, idx) => (
              <AnimatedSection key={idx} delay={idx * 150} direction="up">
                <div className="group relative bg-white/5 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-white/10 hover:border-teal-400/50 hover:bg-white/10 transition-all duration-500 h-full">
                  {/* Connector line */}
                  {idx < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-teal-400/50 to-transparent" />
                  )}

                  {/* Glowing number */}
                  <div className="relative mb-4">
                    <span className="text-5xl font-black text-teal-400/20 group-hover:text-teal-400/40 transition-colors duration-500">
                      {step.num}
                    </span>
                    <div className="absolute -top-1 -left-1">
                      <span className="absolute w-3 h-3 rounded-full bg-teal-400/30 animate-pulse-ring" />
                      <span className="relative block w-3 h-3 rounded-full bg-teal-400" />
                    </div>
                  </div>

                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-teal-100/60 mt-2 leading-relaxed">{step.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Role Tabs ─── */}
      <section id="roles" className="py-20 sm:py-28 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-4 py-1.5 rounded-full border border-teal-200">
                Tailored Experiences
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mt-4">
                Built for Every Stakeholder
              </h2>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            {/* Tab Selector */}
            <div className="flex p-1.5 bg-slate-200/70 rounded-2xl max-w-lg mx-auto mb-10">
              {Object.keys(roleHighlights).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-300 relative ${
                    activeTab === tab
                      ? 'bg-white text-teal-800 shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-1 bg-teal-500 rounded-full" />
                  )}
                  <span className="block text-lg mb-0.5">{roleHighlights[tab].emoji}</span>
                  {tab === 'patients' ? 'Patients' : tab === 'hospitals' ? 'Hospitals' : 'Admins'}
                </button>
              ))}
            </div>
          </AnimatedSection>

          {/* Tab Content */}
          <div
            key={activeTab}
            className="bg-white rounded-3xl p-6 sm:p-10 border border-teal-100 shadow-2xl shadow-teal-900/5"
            style={{ animation: 'slide-up-bounce 0.5s ease-out' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <span className="text-3xl">{roleHighlights[activeTab].emoji}</span>
                  {roleHighlights[activeTab].title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {roleHighlights[activeTab].subtitle}
                </p>
              </div>

              <Link
                href={roleHighlights[activeTab].ctaLink}
                className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-xl transition-all self-start sm:self-auto hover:scale-105 active:scale-95"
              >
                {roleHighlights[activeTab].ctaText}
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              {roleHighlights[activeTab].features.map((feat, i) => (
                <div
                  key={i}
                  className="group flex items-start gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-teal-50/40 to-emerald-50/20 border border-teal-100/60 hover:border-teal-300 hover:shadow-md hover:shadow-teal-600/5 transition-all duration-300 hover:-translate-y-0.5"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <span className="text-xl group-hover:scale-125 transition-transform duration-300 mt-0.5">
                    {feat.icon}
                  </span>
                  <span className="text-xs sm:text-sm text-slate-700 font-medium leading-snug">
                    {feat.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="relative py-16 sm:py-24 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 text-white overflow-hidden">
        <FloatingParticles />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black">
              Ready to streamline healthcare?
            </h2>
            <p className="text-teal-100 text-sm sm:text-base mt-3 max-w-xl mx-auto">
              Access your patient account or hospital portal with secure role-based login.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="group px-8 py-4 bg-white text-teal-800 hover:bg-teal-50 font-bold text-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95"
              >
                Register as New Patient ✨
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-teal-800/50 hover:bg-teal-800/70 text-white font-bold text-sm rounded-2xl border border-white/20 hover:border-white/40 transition-all hover:scale-105 active:scale-95 backdrop-blur-sm"
              >
                Sign In to Account →
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                S
              </div>
              <div>
                <span className="font-bold text-white text-sm">SUSALI Healthcare</span>
                <p className="text-[10px] text-slate-500">Referral Management System</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs">
              <Link href="/company" className="hover:text-teal-400 transition-colors">Features</Link>
              <Link href="/login" className="hover:text-teal-400 transition-colors">Login</Link>
              <Link href="/register" className="hover:text-teal-400 transition-colors">Register</Link>
            </div>

            <p className="text-[10px] text-slate-600">
              © {new Date().getFullYear()} SUSALI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}