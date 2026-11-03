import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { BrowserRouter, Link as RouterLink, Navigate, Route, Routes, useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import heroImage from '../public-health-hero.jpg';
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, Bell,
  Bot, Check, CheckCircle2, ChevronDown, CircleHelp, ClipboardCheck, ClipboardList, CloudSun, Droplets,
  Eye, FileAudio, Filter, Headphones, HeartPulse, Home, Layers3, LockKeyhole, MapPin,
  Menu, Microscope, Pause, Play, Shield, ShieldCheck, Siren, SlidersHorizontal, Sparkles, Stethoscope, Volume2, VolumeX, Waves, X,
} from 'lucide-react';
import { PrototypeDataProvider, useDemoStore, type AlertRecord, type CaseReport, type CaseSeverity, type CaseStatus } from '@/lib/demo-store';
import { LiveRiskMap } from '@/components/live-risk-map';
import { CreateAccountPage } from '@/pages/create-account-page';
import { AgentCenterPage } from '@/pages/agent-center-page';
import { WaterIntelligencePage } from '@/pages/water-intelligence-page';
import { OutbreakAnalysisPage } from '@/pages/outbreak-analysis-page';
import { FieldVerificationPage } from '@/pages/field-verification-page';
import { SettingsPage } from '@/pages/settings-page';
import { VoiceStoragePage } from '@/pages/voice-storage-page';
import { VoiceRecorderWidget } from '@/components/voice-recorder-widget';
import { VoiceStorageVault } from '@/components/voice-storage-vault';
import { OfflineVoiceChatModal } from '@/components/offline-voice-chat-modal';
import { getAllVoiceRecords, saveVoiceRecord } from '@/lib/voice-storage';
import { extractSignalsFromVoice } from '@/lib/voice-translator';
import type { RecordingResult } from '@/lib/offline-voice-recorder';
import '@/pages/extended-pages.css';

const routes = [
  { path: '/dashboard', label: 'Overview', icon: Home },
  { path: '/risk-map', label: 'Risk map', icon: MapPin },
  { path: '/case-reporting', label: 'Case reporting', icon: HeartPulse },
  { path: '/voice-storage', label: 'Voice storage', icon: Headphones },
  { path: '/ai-agents', label: 'AI Agent Center', icon: Bot },
  { path: '/water-intelligence', label: 'Water intelligence', icon: Droplets },
  { path: '/outbreak-analysis', label: 'Outbreak analysis', icon: Activity },
  { path: '/response-center', label: 'Response center', icon: ClipboardCheck },
  { path: '/field-verification', label: 'Field verification', icon: ClipboardList },
  { path: '/analytics', label: 'Analytics', icon: Activity },
  { path: '/settings', label: 'Settings', icon: SlidersHorizontal },
];
const demoTag = <span className="sample-tag">SAMPLE DATA · PROTOTYPE</span>;

function Link({ href, ...props }: Omit<ComponentProps<typeof RouterLink>, 'to'> & { href: string }) {
  return <RouterLink to={href} {...props} />;
}

function useLocation(): [string, ReturnType<typeof useNavigate>] {
  const location = useRouterLocation();
  return [location.pathname, useNavigate()];
}

function ScrollToTop() {
  const { pathname } = useRouterLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }); }, [pathname]);
  return null;
}

function Brand({ light = false }: { light?: boolean }) {
  return <Link href="/" className={`brand ${light ? 'brand-light' : ''}`} data-testid="link-brand"><span className="brand-mark"><Shield size={20} strokeWidth={2.2} /></span><span>EPISHIELD<small>COMMUNITY HEALTH INTELLIGENCE</small></span></Link>;
}

function Button({ children, onClick, tone = 'blue', type = 'button' }: { children: ReactNode; onClick?: () => void; tone?: string; type?: 'button' | 'submit' }) {
  return <button type={type} onClick={onClick} className={`button button-${tone}`}>{children}</button>;
}

function Landing() {
  return <main className="landing">
    <header className="landing-nav"><Brand/><nav className="landing-links"><a href="#top">Home</a><a href="#about">About</a><a href="#flow">How It Works</a><a href="#contact">Contact</a></nav><Link href="/login" className="nav-login">Login <ArrowRight size={16}/></Link></header>
    <section id="top" className="hero hero-photo" style={{ backgroundImage: `linear-gradient(90deg,rgba(17,63,84,.85) 0%,rgba(20,79,101,.59) 48%,rgba(29,96,114,.18) 100%),url(${heroImage})` }}>
      <div className="hero-inner"><div className="hero-copy page-enter"><div className="eyebrow hero-eyebrow"><span className="eyebrow-dot"/> EPISHIELD</div><h1 className="display">AI-Powered Early Epidemic Detection &amp; Response System</h1><p className="hero-tagline">Detect Early. Respond Faster. Protect Communities.</p><p>EPISHIELD brings community health signals and environmental risk into one clear picture—so teams can move earlier, together.</p><div className="hero-actions"><Link href="/dashboard" className="button button-aqua">Explore EPISHIELD <ArrowRight size={17}/></Link><Link href="/login" className="button button-glass">Login <ArrowRight size={17}/></Link></div><div className="hero-note"><span className="hero-note-line"/> A prototype for stronger, earlier response.</div></div>
        <div className="hero-glass glass"><div className="glass-head"><span className="status-pip"/> SAMPLE RISK SIGNAL <span>ZONE A</span></div><div className="glass-risk"><b>86%</b><span>HIGH RISK</span></div><div className="glass-meter"><i/></div><div className="glass-foot"><span><Droplets size={15}/> Water risk</span><b>CRITICAL</b></div><div className="glass-insight">“Possible water-related outbreak pattern detected.”</div></div>
      </div><div className="hero-bottom"><span>ILLUSTRATIVE SAMPLE EXPERIENCE</span><span>DESIGNED FOR PUBLIC HEALTH TEAMS <ArrowRight size={14}/></span></div>
    </section>
    <section className="about-section section-wrap" id="about"><div className="section-heading"><div><div className="eyebrow">THE EPISHIELD APPROACH</div><h2 className="display">Four signals.<br/>One clearer picture.</h2></div><p>Public health risk rarely starts in one place. EPISHIELD helps teams connect the signs that matter and make an informed next move.</p></div><div className="about-grid">{[
      [Activity,'Disease Signals','Monitor unusual symptoms and community health patterns.','/village-community.jpeg'],
      [Waves,'Environmental Risk','Identify possible microbial and water-related contaminants.','/water-pathogens.jpeg'],
      [Microscope,'AI Detection','Analyze planetary & local signals to identify outbreak clusters.','/globe-network.jpeg'],
      [ArrowRight,'Early Response','Coordinate field tasks and clean water deployment rapidly.','/water-drop.jpeg'],
    ].map(([Icon,title,desc,image],i)=>{const I=Icon as typeof Activity;return <article className="about-card" key={String(title)}><img className="about-photo" src={String(image)} alt="" /><span className="card-index">0{i+1}</span><div className="icon-tile"><I size={22}/></div><h3>{title as string}</h3><p>{desc as string}</p><span className="card-rule"/></article>})}</div></section>
    <section id="flow" className="flow-section"><div className="section-wrap"><div className="flow-intro"><div className="eyebrow">FROM SIGNAL TO RESPONSE</div><h2 className="display">A path teams can follow.</h2><p>One connected workflow, designed to make the next step clearer.</p></div><div className="flow-track">{['DATA COLLECTION','AI ANALYSIS','RISK DETECTION','ALERT','RESPONSE'].map((step,i)=><div className="flow-step" key={step}><span className={`flow-node ${i===4?'final-node':''}`}>{String(i+1).padStart(2,'0')}</span><b>{step}</b>{i<4&&<span className="flow-connector"/>}</div>)}</div></div></section>
    <section className="preview-section"><div className="section-wrap preview-layout"><div className="preview-copy"><div className="eyebrow">A GLIMPSE INSIDE</div><h2 className="display">The signal,<br/>without the noise.</h2><p>A structured view of sample community and environmental indicators—designed to help teams interpret what they see.</p><Link href="/ai-intelligence" className="inline-link">Explore AI intelligence <ArrowRight size={16}/></Link></div><div className="preview-panel glass"><div className="preview-header"><div><span className="small-cap">RISK ASSESSMENT</span><h3>Zone A <span className="tag-high">HIGH RISK</span></h3></div>{demoTag}</div><div className="preview-main"><div className="preview-score"><b>86%</b><span>HIGH</span><div className="score-ring"><span/></div></div><div className="preview-stats">{[['Health Signals','HIGH'],['Water Risk','CRITICAL'],['Location Risk','HIGH'],['Case Growth','+24%']].map(([a,b])=><div className="preview-stat" key={a}><span>{a}</span><b>{b}</b></div>)}</div></div><div className="preview-alert"><div className="alert-icon"><AlertTriangle size={16}/></div><div><small>AI-GENERATED INSIGHT · SAMPLE</small><p>Possible water-related outbreak pattern detected in Zone A.</p></div><ArrowRight size={16}/></div></div></div></section>
    <section className="benefits-section section-wrap"><div className="benefits-top"><div><div className="eyebrow">WHY EPISHIELD</div><h2 className="display">Earlier clarity.<br/>Stronger action.</h2></div><p>From an emerging signal to a response that reaches the right people, at the right time.</p></div><div className="benefit-list">{[['01','Early Detection','Recognize syndromic patterns earlier across community health workers.','/village-community.jpeg'],['02','AI Risk Analysis','Global neural network analyzing geospatial & environmental vectors.','/globe-network.jpeg'],['03','Environmental Telemetry','Aerial watershed monitoring & pathogen tracking across rural zones.','/village-mist.jpeg'],['04','Water Protection','Sentinel sensors safeguarding public drinking supplies.','/water-drop.jpeg']].map(([n,t,d,image])=><article className={`benefit-card benefit-card-${n}`} key={n}>{image&&<img src={image} alt="" /> }<div><span>{n}</span><h3>{t}</h3><p>{d}</p></div><ArrowUpRight size={19}/></article>)}</div></section>
    <section id="contact" className="closing"><div className="closing-inner"><div className="eyebrow">EPISHIELD · A PUBLIC HEALTH PROTOTYPE</div><h2 className="display">Be Ready Before<br/><em>the Outbreak.</em></h2><p>Detect earlier. Respond faster. Protect communities.</p><div className="closing-actions"><Link href="/dashboard" className="button button-aqua">Explore EPISHIELD <ArrowRight size={17}/></Link><Link href="/login" className="button button-glass">Login <ArrowRight size={17}/></Link></div></div><footer><Brand light/><span>STATIC PROTOTYPE · ALL VALUES ARE SAMPLE DATA</span><a href="#top" onClick={e=>{e.preventDefault();window.scrollTo({top:0,behavior:'smooth'})}}>Back to top ↑</a></footer></section>
  </main>;
}

function Login() {
  const [, navigate] = useLocation();
  const { startDemoSession } = useDemoStore();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (isVideoPlaying) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsVideoPlaying(true)).catch(() => {});
    }
  };

  const toggleVideoMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isVideoMuted;
    setIsVideoMuted(!isVideoMuted);
  };

  return <main className="login-page">
    {/* Left Column: Animation Video Overview */}
    <div className="login-image login-video-container" data-testid="login-overview-video-panel">
      {/* Uploaded MP4 Animation Video Background */}
      <video
        ref={videoRef}
        className="login-video-element"
        autoPlay
        loop
        muted={isVideoMuted}
        playsInline
        poster="/village-mist.jpeg"
      >
        <source src="/login-animation.mp4" type="video/mp4" />
        <source src="/epishield-overview.mp4" type="video/mp4" />
      </video>

      {/* Cinematic Gradient Veil */}
      <div className="login-video-overlay" />

      {/* Interactive Content Overlay */}
      <div className="login-video-content">
        <div className="login-video-topbar">
          <Brand light />
          <div className="login-video-pill">
            <span className="login-live-dot" />
            <span>ANIMATED OVERVIEW</span>
          </div>
        </div>

        <div className="login-video-center">
          <div className="login-image-caption">
            <div className="eyebrow hero-eyebrow">
              <span className="eyebrow-dot" /> AI OUTBREAK INTELLIGENCE
            </div>
            <h1 className="display">
              Earlier signals.<br />
              Stronger communities.
            </h1>
            <p>
              EPISHIELD unites community syndromic health reports, sensor-verified water quality intelligence, and automated multi-agent risk assessment.
            </p>
          </div>

          {/* Video Control Buttons */}
          <div className="login-video-controls-row">
            <button
              type="button"
              className="login-video-ctrl-btn"
              onClick={toggleVideoPlay}
              title={isVideoPlaying ? 'Pause overview animation' : 'Play overview animation'}
              data-testid="button-toggle-login-video"
            >
              {isVideoPlaying ? <Pause size={13} /> : <Play size={13} />}
              <span>{isVideoPlaying ? 'Pause Overview' : 'Play Overview'}</span>
            </button>
            <button
              type="button"
              className="login-video-ctrl-btn"
              onClick={toggleVideoMute}
              title={isVideoMuted ? 'Unmute video audio' : 'Mute video audio'}
              data-testid="button-toggle-login-mute"
            >
              {isVideoMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              <span>{isVideoMuted ? 'Muted' : 'Audio On'}</span>
            </button>
          </div>

          {/* Floating System Feature Chips */}
          <div className="login-signal-chips">
            <div className="login-chip">
              <span className="chip-indicator active" />
              <div>
                <b>Multi-Agent Sentinels</b>
                <small>6 specialized AI agents analyzing syndromic clustering</small>
              </div>
            </div>
            <div className="login-chip">
              <span className="chip-indicator active" />
              <div>
                <b>Environmental Water Sensors</b>
                <small>Turbidity, pH &amp; biological pathogen surveillance</small>
              </div>
            </div>
            <div className="login-chip">
              <span className="chip-indicator active" />
              <div>
                <b>Offline Voice Recognition to Text</b>
                <small>Tamil &amp; English voice memos transcribed into structured reports</small>
              </div>
            </div>
          </div>
        </div>

        <div className="login-video-footer">
          <span className="photo-credit">
            EPISHIELD INTELLIGENCE · ANIMATED SYSTEM OVERVIEW
          </span>
          <span className="login-video-badge">
            PREVIEW OVERVIEW
          </span>
        </div>
      </div>
    </div>

    {/* Right Column: Prototype Sign In */}
    <section className="login-side"><div className="login-form-wrap">
      <Link href="/" className="back-link">← Back to home</Link>
      <div className="login-heading"><span className="icon-tile"><ShieldCheck size={22} /></span><div className="eyebrow">COMMAND CENTER</div><h2 className="display">Welcome back.</h2><p>Enter the sample experience to explore EPISHIELD.</p></div>
      <form onSubmit={(event) => { event.preventDefault(); startDemoSession(); navigate('/dashboard'); }}>
        <label>Email address<input data-testid="input-email" type="email" autoComplete="email" required /></label>
        <label>Password<input data-testid="input-password" type="password" autoComplete="current-password" required /></label>
        <Button type="submit">Enter demo workspace</Button>
      </form>
      <div className="prototype-disclaimer"><div><Eye size={17} /><b>Prototype access only</b></div><p>This form does not authenticate an account. The fields are not sent or stored; submitting opens a sample workspace.</p></div>
      <div className="login-privacy"><LockKeyhole size={14} /> No account or credentials are stored.</div>
      <p className="login-create-link">New to the demo? <Link href="/create-account">Create a demo profile</Link></p>
    </div></section>
  </main>;
}

function Shell({ children, title, subtitle }: {children: ReactNode; title: string; subtitle: string}) {
  const [location, navigate] = useLocation();
  const [mobileNav, setMobileNav] = useState(false);
  const [showVoiceChat, setShowVoiceChat] = useState(false);
  const [voiceRecordCount, setVoiceRecordCount] = useState(0);
  const { activeAlertCount, settings } = useDemoStore();
  const initials = settings.displayName.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'EP';

  useEffect(() => {
    let mounted = true;
    const updateCount = async () => {
      try {
        const records = await getAllVoiceRecords();
        if (mounted) setVoiceRecordCount(records.length);
      } catch {}
    };
    updateCount();
    window.addEventListener('epishield:voice-storage-change', updateCount);
    return () => {
      mounted = false;
      window.removeEventListener('epishield:voice-storage-change', updateCount);
    };
  }, []);

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <div className="sidebar-brand"><Brand /><button className="mobile-close" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={18} /></button></div>
      <div className="workspace-label">WORKSPACE <ChevronDown size={14} /></div>
      <div className="workspace-box"><span className="workspace-icon"><Activity size={17} /></span><span>{settings.teamName}<small>Sample environment</small></span><ChevronDown size={14} /></div>
      <div className="side-section-label">MONITORING</div>
      <nav className="side-nav" aria-label="Main navigation">
        {routes.map((route) => <Link key={route.path} href={route.path} onClick={() => setMobileNav(false)} className={`side-link ${location === route.path ? 'active' : ''}`} aria-current={location === route.path ? 'page' : undefined}>
          <route.icon size={17} /><span>{route.label}</span>
          {route.path === '/response-center' && <i className="side-badge">{activeAlertCount}</i>}
          {route.path === '/voice-storage' && <i className="side-badge">{voiceRecordCount}</i>}
        </Link>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="prototype-label"><span /> LOCAL DEMO<small>Sample data · Not live</small></div>
        <Link className="help-link" href="/"><CircleHelp size={16} /> Public site</Link>
        <Link className="user-mini" href="/settings"><span className="user-avatar">{initials}</span><span>{settings.displayName}<small>{settings.teamName}</small></span><ChevronDown size={15} /></Link>
      </div>
    </aside>
    <div className="workspace-main">
      <header className="app-topbar">
        <button className="mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={21} /></button>
        <div className="crumb">EPISHIELD <span>/</span> <b>{title}</b></div>
        <div className="topbar-right">
          <button
            type="button"
            onClick={() => setShowVoiceChat(true)}
            className="top-voice-chat-pill"
            title="Open Offline Health Voice Chat"
            data-testid="button-topbar-voice-chat"
          >
            <Bot size={13} /> <span>Voice Chat</span>
          </button>
          <Link
            href="/voice-storage"
            className="top-vault-pill"
            title="Open Voice Storage Vault"
            data-testid="button-topbar-voice-vault"
          >
            <Headphones size={13} /> <span>Voice Vault</span> <span className="top-vault-count">{voiceRecordCount}</span>
          </Link>
          <span className="top-sample"><i /> PROTOTYPE DATA</span>
          <Link href="/response-center" className="top-icon" aria-label="Open sample alerts"><Bell size={18} /><i /></Link>
          <span className="top-avatar">{initials}</span>
        </div>
      </header>
      <main className="dashboard-content page-enter">
        <div className="page-title">
          <div><div className="eyebrow">{subtitle}</div><h1 className="display">{title}</h1></div>
          {demoTag}
        </div>
        {children}
        <footer className="dashboard-footer">
          <span>EPISHIELD · LOCAL DEMO</span>
          <span>All indicators are sample values, not live information.</span>
        </footer>
      </main>
    </div>

    <OfflineVoiceChatModal
      isOpen={showVoiceChat}
      onClose={() => setShowVoiceChat(false)}
      onOpenStorageVault={() => {
        setShowVoiceChat(false);
        navigate('/voice-storage');
      }}
    />
  </div>;
}

function Metric({label,value,detail,tone='blue',icon:Icon}: {label:string;value:string;detail:string;tone?:string;icon:typeof Activity}) {
  return <article className="metric-card"><div className={`metric-icon ${tone}`}><Icon size={18}/></div><span>{label}</span><b className="display">{value}</b><small>{detail}</small></article>;
}
function Panel({title,meta,children,className=''}:{title:string;meta?:string;children:ReactNode;className?:string}) {
  return <section className={`panel ${className}`}><div className="panel-head"><h3>{title}</h3>{meta&&<span>{meta}</span>}</div>{children}</section>;
}

function timeAgo(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60_000));
  if (!Number.isFinite(minutes)) return 'Sample activity';
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1_440) return `${Math.floor(minutes / 60)}h ago`;
  return new Date(value).toLocaleDateString();
}

function Dashboard() {
  const { caseCount, activeAlertCount, cases, alerts, activities, settings } = useDemoStore();
  const [voiceCount, setVoiceCount] = useState(0);
  const newSubmissions = Math.max(0, cases.length - 5);
  const latestAlert = alerts.find((alert) => alert.status !== 'Resolved');
  const greetingName = settings.displayName.trim().split(/\s+/)[0] || 'response team';

  useEffect(() => {
    getAllVoiceRecords().then((records) => setVoiceCount(records.length)).catch(() => {});
  }, []);

  return <Shell title="Command Center" subtitle="COMMUNITY HEALTH INTELLIGENCE">
    <div className="welcome-line"><div><h2>Welcome, {greetingName}</h2><p>Here is the current illustrative picture across monitored zones.</p></div><span className="sample-date">SAMPLE SNAPSHOT · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
    <div className="metric-grid">
      <Metric label="HIGH RISK" value="86%" detail="Zone A · sample assessment" icon={AlertTriangle} tone="coral" />
      <Metric label="SUSPECTED CASES" value={String(caseCount)} detail={`${32 + newSubmissions} sample-period reports`} icon={HeartPulse} />
      <Metric label="STORED VOICE" value={String(voiceCount)} detail="Offline recordings in vault" icon={Headphones} tone="aqua" />
      <Metric label="ACTIVE ALERTS" value={String(activeAlertCount)} detail="Local prototype workflow" icon={Bell} tone="gold" />
    </div>
    <div className="dashboard-grid main-grid">
      <Panel title="Community risk overview" meta="SAMPLE · 6 ZONES" className="overview-panel">
        <div className="zone-list">{[['Zone A', 'High risk', '86%', 'coral'], ['Zone B', 'Elevated', '68%', 'gold'], ['Zone C', 'Moderate', '42%', 'blue'], ['Zone D', 'Elevated', '61%', 'gold']].map(([zone, risk, score, tone]) =>
          <Link href="/risk-map" className="zone-row" key={zone}><span className={`zone-dot ${tone}`} /><span><b>{zone}</b><small>{risk}</small></span><div className="zone-bar"><i style={{ width: score }} /></div><strong>{score}</strong><ArrowRight size={15} /></Link>
        )}</div>
        <Link className="panel-link" href="/risk-map">Open illustrative risk map <ArrowRight size={15} /></Link>
      </Panel>
      <Panel title="Priority alert" meta="SAMPLE ALERT">
        <div className="priority-alert">
          <div className="priority-top"><span className="tag-high">{latestAlert?.priority.toUpperCase() ?? 'NO OPEN ALERTS'}</span><span>{latestAlert?.zone.toUpperCase() ?? 'SAMPLE'}</span></div>
          <h4>{latestAlert?.title ?? 'All sample alerts reviewed'}</h4>
          <p>Illustrative indicators are prompts for human review, not a diagnosis or confirmed event.</p>
          <div className="priority-bottom"><span><Droplets size={15} /> Sample-only signals</span><Link href="/response-center">Review response <ArrowRight size={15} /></Link></div>
        </div>
      </Panel>
    </div>
    <div className="dashboard-grid lower-grid">
      <Panel title="Signal summary" meta="SAMPLE INDICATORS">
        <div className="signal-rows">{[['Health signals', 'High', 78], ['Water risk', 'Critical', 92], ['Location risk', 'High', 82]].map(([signal, risk, value]) =>
          <div className="signal-row" key={String(signal)}><span>{signal}</span><div className="mini-progress"><i style={{ width: `${value}%` }} /></div><b>{risk}</b></div>
        )}</div>
      </Panel>
      <Panel title="Recent activity" meta="SAVED IN THIS BROWSER">
        <div className="activity-feed">{activities.slice(0, 3).map((item) => {
          const icon = item.kind === 'task' ? <ClipboardCheck size={16} /> : item.kind === 'alert' ? <Bell size={16} /> : item.kind === 'agent' ? <Bot size={16} /> : <Stethoscope size={16} />;
          return <div key={item.id}><span className={`activity-icon ${item.kind === 'task' ? 'aqua' : 'blue'}`}>{icon}</span><p><b>{item.title}</b><small>{item.detail}</small></p><span>{timeAgo(item.at)}</span></div>;
        })}</div>
        <Link href="/response-center" className="panel-link">Open response center <ArrowRight size={15} /></Link>
      </Panel>
    </div>
  </Shell>;
}

function MapPage() {
  return <Shell title="Risk map" subtitle="GEOSPATIAL OVERVIEW">
    <div className="map-toolbar">
      <div><span className="map-label"><MapPin size={15} /> ILLUSTRATIVE REGION</span><span className="map-note">OpenStreetMap basemap · Fixed sample markers</span></div>
      <span className="sample-tag">NO LIVE HEALTH DATA</span>
    </div>
    <div className="map-layout">
      <LiveRiskMap />
      <aside className="zone-detail">
        <div className="detail-heading"><div><span className="eyebrow">SAMPLE ZONE PROFILE</span><h2 className="display">Zone A</h2></div><span className="risk-pill">86% · SAMPLE</span></div>
        <img className="zone-photo" src="/about-environment.jpg" alt="Field worker examining an illustrative water sample" />
        <p className="detail-copy">These fixed markers demonstrate how a team might review health and environmental signals. No case or sensor record is connected to a map point.</p>
        <div className="detail-metrics"><div><span>SAMPLE REPORTS</span><b>74</b></div><div><span>SAMPLE TREND</span><b className="coral-text">+24%</b></div></div>
        <div className="detail-alert"><AlertTriangle size={16} /><span>ILLUSTRATIVE SIGNAL · HUMAN REVIEW</span></div>
        <div className="anomaly-row"><span><Waves size={16} /> Sample turbidity reading</span><b>+38%</b></div>
        <div className="detail-insight"><small>NOT A LIVE ASSESSMENT</small><p>“Possible water-related pattern” is fictional demo copy, not a finding or diagnosis.</p></div>
        <Link href="/water-intelligence" className="button button-blue">Open sample water readings <ArrowRight size={15} /></Link>
        <Link href="/field-verification" className="panel-link">Create a local verification task <ArrowRight size={15} /></Link>
        <div className="map-disclaimer">The basemap uses OpenStreetMap tiles. Colored zones, sites, and readings use fixed fictional coordinates only.</div>
      </aside>
    </div>
  </Shell>;
}

function CasesPage() {
  const { cases, caseCount, submitCase, updateCaseStatus } = useDemoStore();
  const [activeTab, setActiveTab] = useState<'submit' | 'voice-vault' | 'summaries'>('submit');
  const [zone, setZone] = useState('Zone A');
  const [severity, setSeverity] = useState<CaseSeverity>('Moderate');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [attachedAudio, setAttachedAudio] = useState<RecordingResult | null>(null);
  const [voiceRecordsCount, setVoiceRecordsCount] = useState(0);
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All reports' | 'Priority reports'>('All reports');
  const symptomOptions = ['Fever', 'Diarrhea', 'Vomiting', 'Stomach pain', 'Rash'];
  const symptomSummary = symptomOptions.slice(0, 4).map((symptom) => ({
    symptom,
    count: cases.filter((report) => report.symptoms.includes(symptom)).length,
  }));
  const visibleCases = cases.filter((report) => {
    const matchesText = `${report.id} ${report.zone} ${report.symptoms.join(' ')} ${report.status}`.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = filter === 'All reports' || report.severity === 'High' || report.severity === 'Critical';
    return matchesText && matchesPriority;
  });

  useEffect(() => {
    let mounted = true;
    const fetchVoiceCount = async () => {
      try {
        const records = await getAllVoiceRecords();
        if (mounted) setVoiceRecordsCount(records.length);
      } catch {}
    };
    fetchVoiceCount();
    window.addEventListener('epishield:voice-storage-change', fetchVoiceCount);
    return () => {
      mounted = false;
      window.removeEventListener('epishield:voice-storage-change', fetchVoiceCount);
    };
  }, []);

  function toggleSymptom(symptom: string) {
    setSelectedSymptoms((current) => current.includes(symptom) ? current.filter((item) => item !== symptom) : [...current, symptom]);
  }

  function handleAudioRecorded(result: RecordingResult | null) {
    setAttachedAudio(result);
    if (result && (result.translatedText || result.transcript)) {
      const recognized = (result.translatedText || result.transcript || '').trim();
      if (recognized) {
        // Change voice recognition to text directly in notes
        setNotes((current) => {
          if (!current.trim()) return recognized;
          if (current.includes(recognized)) return current;
          return `${current}\n\n[Transcribed Voice]: ${recognized}`;
        });

        // Automatically extract symptoms and zone from voice text
        const fullSpeech = `${result.transcript || ''} ${result.translatedText || ''}`;
        const signals = extractSignalsFromVoice(fullSpeech);
        if (signals.symptoms.length > 0) {
          setSelectedSymptoms((current) => Array.from(new Set([...current, ...signals.symptoms])));
        }
        if (signals.zone && ['Zone A', 'Zone B', 'Zone C', 'Zone D'].includes(signals.zone)) {
          setZone(signals.zone);
        }
        if (signals.severity) {
          setSeverity(signals.severity);
        }

        setNotice('✨ Voice recognized and transcribed into notes! Symptoms and zone updated.');
      }
    }
  }

  async function handleFormSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (selectedSymptoms.length === 0) {
      setNotice('Select at least one symptom to submit a sample report.');
      return;
    }

    let savedVoiceId: string | undefined = undefined;
    if (attachedAudio) {
      try {
        const savedRecord = await saveVoiceRecord({
          title: `Field Voice Report · ${zone}`,
          durationSeconds: attachedAudio.durationSeconds,
          audioDataUrl: attachedAudio.dataUrl,
          audioMimeType: attachedAudio.mimeType,
          sizeBytes: attachedAudio.sizeBytes,
          source: 'case-reporting',
          zone,
          symptoms: selectedSymptoms,
          notes: notes.trim() || 'Offline audio field report attached.',
        });
        savedVoiceId = savedRecord.id;
      } catch (err) {
        console.warn('Could not save attached voice record to storage vault:', err);
      }
    }

    const report = submitCase({
      zone,
      symptoms: selectedSymptoms,
      severity,
      notes: notes.trim(),
      inputMode: attachedAudio ? 'voice' : 'manual',
      voiceRecordId: savedVoiceId,
      audioDataUrl: attachedAudio?.dataUrl,
      voiceDurationSeconds: attachedAudio?.durationSeconds,
    });

    setNotice(
      `${report.id} saved locally. ${
        savedVoiceId
          ? `Offline voice recording saved in Voice Storage Vault (#${savedVoiceId}).`
          : ''
      } ${severity === 'High' || severity === 'Critical' ? 'A sample response alert was also opened.' : ''}`
    );

    setSelectedSymptoms([]);
    setNotes('');
    setSeverity('Moderate');
    setAttachedAudio(null);
  }

  return <Shell title="Case reporting" subtitle="COMMUNITY HEALTH SIGNALS">
    <div className="metric-grid case-metrics">
      <Metric label="TOTAL SAMPLE CASES" value={String(caseCount)} detail="Illustrative platform summary" icon={HeartPulse} />
      <Metric label="NEW REPORTS" value={String(Math.max(0, cases.length - 5))} detail="Submitted in this browser" icon={ArrowUpRight} tone="aqua" />
      <Metric label="STORED VOICE" value={String(voiceRecordsCount)} detail="Offline recordings in vault" icon={Headphones} tone="blue" />
      <Metric label="ZONE A REPORTS" value={String(cases.filter((item) => item.zone === 'Zone A').length)} detail="Local demo records" icon={MapPin} tone="gold" />
    </div>

    {/* Case Reporting Navigation Tabs */}
    <div className="case-reporting-tabs" role="tablist">
      <button
        type="button"
        role="tab"
        className={`case-tab-button ${activeTab === 'submit' ? 'active' : ''}`}
        aria-selected={activeTab === 'submit'}
        onClick={() => setActiveTab('submit')}
        data-testid="tab-case-intake"
      >
        <HeartPulse size={14} /> Submit Case Report
      </button>
      <button
        type="button"
        role="tab"
        className={`case-tab-button ${activeTab === 'voice-vault' ? 'active' : ''}`}
        aria-selected={activeTab === 'voice-vault'}
        onClick={() => setActiveTab('voice-vault')}
        data-testid="tab-case-voice-vault"
      >
        <Headphones size={14} /> Voice Storage Vault <span className="case-tab-badge">{voiceRecordsCount}</span>
      </button>
      <button
        type="button"
        role="tab"
        className={`case-tab-button ${activeTab === 'summaries' ? 'active' : ''}`}
        aria-selected={activeTab === 'summaries'}
        onClick={() => setActiveTab('summaries')}
        data-testid="tab-case-summaries"
      >
        <ClipboardList size={14} /> Case Summaries <span className="case-tab-badge">{visibleCases.length}</span>
      </button>
    </div>

    {/* Tab: Voice Storage Vault */}
    {activeTab === 'voice-vault' && (
      <div className="page-enter">
        <VoiceStorageVault onSelectCase={() => setActiveTab('summaries')} />
      </div>
    )}

    {/* Tab: Submit Case Report */}
    {activeTab === 'submit' && (
      <>
        <div className="dashboard-grid cases-grid">
          <Panel title="Symptom distribution" meta="LOCAL SAMPLE REPORTS">
            <div className="symptom-chart">{symptomSummary.map(({ symptom, count }) => {
              const percent = cases.length ? Math.round(count / cases.length * 100) : 0;
              return <div className="symptom-line" key={symptom}><span>{symptom}</span><div className="symptom-track"><i style={{ width: `${percent}%` }} /></div><b>{percent}%</b></div>;
            })}</div>
            <div className="chart-foot">Share of fictional reports stored in this browser.</div>
          </Panel>
          <div className="cluster-card">
            <img className="symptom-photo" src="/village-community.jpeg" alt="Community health worker speaking with a community member in village" />
            <div className="cluster-icon"><Activity size={19} /></div><span className="eyebrow">PATTERN FLAG · SAMPLE</span><h3>Review signals together</h3>
            <div className="cluster-place"><MapPin size={15} /> Zone A <b>ILLUSTRATIVE</b></div>
            <p>Submitted case summaries appear here and in the local dashboard; they do not represent real patients.</p>
            <Link href="/ai-agents" className="panel-link">Open simulated agent workflow <ArrowRight size={15} /></Link>
          </div>
        </div>

        <div className="case-intake-layout">
          <Panel title="Submit a sample case report" meta="SAVED IN THIS BROWSER">
            <form className="case-intake-form" onSubmit={handleFormSubmit} data-testid="form-case-report">
              <div className="case-form-grid">
                <label>Sample zone<select value={zone} onChange={(event) => setZone(event.target.value)} data-testid="select-case-zone"><option>Zone A</option><option>Zone B</option><option>Zone C</option><option>Zone D</option></select></label>
                <label>Priority<select value={severity} onChange={(event) => setSeverity(event.target.value as CaseSeverity)} data-testid="select-case-severity"><option>Low</option><option>Moderate</option><option>High</option><option>Critical</option></select></label>
              </div>

              <fieldset className="case-symptom-fieldset"><legend>Symptoms in this fictional report</legend><div className="case-symptom-options">{symptomOptions.map((symptom) =>
                <label key={symptom}><input type="checkbox" checked={selectedSymptoms.includes(symptom)} onChange={() => toggleSymptom(symptom)} data-testid={`checkbox-symptom-${symptom.toLowerCase().replaceAll(' ', '-')}`} />{symptom}</label>
              )}</div></fieldset>

              <label>Notes <span className="case-field-hint">Do not enter real names, contact details, or identifying information.</span>
                <textarea value={notes} maxLength={500} onChange={(event) => setNotes(event.target.value)} placeholder="Add fictional, non-identifying context or spoke observations..." data-testid="input-case-notes" />
              </label>

              {/* Pure Offline Voice Recording Widget with Speech-to-Text */}
              <div>
                <span style={{ display: 'block', color: '#527481', fontSize: 10, fontWeight: 700, marginBottom: 5 }}>
                  Offline Voice Recording (Auto-Transcribes to Text)
                </span>
                <VoiceRecorderWidget onAudioRecorded={handleAudioRecorded} />
                {attachedAudio?.transcript && (
                  <div className="voice-text-sync-indicator" data-testid="indicator-voice-synced">
                    <CheckCircle2 size={13} color="#2b9986" />
                    <span>
                      Voice recognized: <em>"{attachedAudio.transcript}"</em> (Transcribed into notes &amp; symptoms)
                    </span>
                  </div>
                )}
              </div>

              <div className="case-form-submit">
                <button type="submit" className="button button-blue" data-testid="button-submit-case">
                  Submit sample report <ArrowRight size={15} />
                </button>
                <span role="status" aria-live="polite" data-testid="status-case-submit">{notice}</span>
              </div>
            </form>
          </Panel>
        </div>
      </>
    )}

    {/* Tab: Case Summaries */}
    {activeTab === 'summaries' && (
      <Panel title="Case summaries" meta="FICTIONAL RECORDS · LOCAL ONLY">
        <div className="table-actions">
          <span>{visibleCases.length} visible · {cases.length} stored in this browser</span>
          <div className="case-table-filters">
            <label className="sr-only" htmlFor="case-search">Search case summaries</label><input id="case-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search summaries" data-testid="input-case-search" />
            <label className="sr-only" htmlFor="case-filter">Filter case summaries</label><select id="case-filter" className="select-button" value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} data-testid="select-case-filter"><option>All reports</option><option>Priority reports</option></select>
          </div>
        </div>
        <div className="table-scroll"><table><thead><tr>{['Report', 'Zone', 'Symptoms', 'Priority', 'Voice Audio', 'Submitted', 'Review status'].map((heading) => <th key={heading}>{heading}</th>)}</tr></thead>
          <tbody>{visibleCases.map((report: CaseReport) => <tr key={report.id}>
            <td><b>{report.id}</b><small>{report.inputMode === 'sample' ? 'Seeded sample' : `${report.inputMode} entry`}</small></td>
            <td>{report.zone}</td><td>{report.symptoms.join(', ')}</td>
            <td><span className={`risk-label ${report.severity.toLowerCase()}`}>{report.severity}</span></td>
            <td>
              {report.inputMode === 'voice' || report.voiceRecordId || report.audioDataUrl ? (
                <button
                  type="button"
                  className="case-table-audio-btn"
                  onClick={() => setActiveTab('voice-vault')}
                  title="Play recorded offline voice in Voice Vault"
                  data-testid={`button-table-voice-${report.id}`}
                >
                  <FileAudio size={12} /> Play in Vault
                </button>
              ) : (
                <small style={{ color: '#9aabad' }}>None</small>
              )}
            </td>
            <td>{timeAgo(report.reportedAt)}</td>
            <td><select className="case-status-select" value={report.status} onChange={(event) => updateCaseStatus(report.id, event.target.value as CaseStatus)} aria-label={`Review status for ${report.id}`} data-testid={`select-case-status-${report.id}`}>
              <option>Review needed</option><option>Reviewed</option><option>Follow-up required</option>
            </select></td>
          </tr>)}</tbody>
        </table></div>
        <div className="table-disclaimer">These are fictional sample reports. Do not enter real health or identifying information. Records stay in this browser.</div>
      </Panel>
    )}
  </Shell>;
}

function AiPage() {
 const evidences=['Diarrhea cases increasing','Water turbidity anomaly','Related cases concentrated in Zone A','Abnormal environmental readings','Geographic overlap'];
 const recommendations=['Inspect Zone A water source','Deploy health response team','Collect water samples','Monitor new cases','Issue community advisory if confirmed'];
 return <Shell title="AI intelligence" subtitle="EXPLAINABLE RISK ASSESSMENT"><div className="ai-summary"><div className="ai-scorebox"><div className="eyebrow">SAMPLE ASSESSMENT</div><div className="ai-score display">86<span>%</span></div><div className="ai-risk"><span/> HIGH RISK</div><p>Illustrative model output for prototype demonstration only.</p></div><div className="ai-signalbox"><h3>Contributing indicators</h3><div className="contributor-list">{[['Health','HIGH',78],['Water','CRITICAL',94],['Location','HIGH',82],['Case Growth','+24%',72],['Environmental Anomaly','DETECTED',89]].map(([label,value,percent])=><div className="contributor" key={String(label)}><span>{label}</span><div><i style={{width:`${percent}%`}}/></div><b>{value}</b></div>)}</div></div><div className="ai-context"><span className="context-icon"><Waves size={19}/></span><span className="eyebrow">ASSESSMENT CONCLUSION</span><h3>Possible water-related outbreak pattern.</h3><p>Sample health and environmental indicators overlap in Zone A. This assessment is a prompt for review—not a diagnosis or confirmed event.</p><div className="confidence-note"><ShieldCheck size={16}/> Explainable sample indicators</div></div></div><div className="dashboard-grid ai-detail-grid"><Panel title="Evidence observed" meta="SAMPLE INPUTS"><ul className="evidence-list">{evidences.map(e=><li key={e}><span className="check-mark"><Check size={13}/></span>{e}</li>)}</ul></Panel><Panel title="Recommended next steps" meta="HUMAN REVIEW REQUIRED"><ol className="recommend-list">{recommendations.map((r,i)=><li key={r}><span>{String(i+1).padStart(2,'0')}</span>{r}</li>)}</ol><div className="recommend-note"><AlertTriangle size={15}/> Recommendations are illustrative. Confirm locally before action.</div></Panel></div></Shell>;
}

const responseStages: AlertRecord['status'][] = ['Open', 'Assigned', 'In progress', 'Resolved'];
const responseTeams = ['Unassigned', 'Health response team', 'Field team 01', 'Field team 02', 'Water review team', 'Community liaison'];

function ResponsePage() {
  const { alerts, tasks, activeAlertCount, updateAlert, updateTask } = useDemoStore();
  const primaryAlert = alerts.find((alert) => alert.status !== 'Resolved') ?? alerts[0];
  return <Shell title="Response center" subtitle="COORDINATED SAMPLE WORKFLOW">
    {primaryAlert ? <>
      <div className="response-alert">
        <div className="response-alert-icon"><Siren size={22} /></div>
        <div className="response-alert-copy"><span className="tag-high">{primaryAlert.priority.toUpperCase()} · SAMPLE ALERT</span><h2>{primaryAlert.title}</h2><p>{primaryAlert.zone} <span /> Illustrative workflow state: <b>{primaryAlert.status}</b></p></div>
        <div className="response-actions"><Button onClick={() => updateAlert(primaryAlert.id, { assignee: primaryAlert.assignee === 'Unassigned' ? 'Health response team' : primaryAlert.assignee, status: 'In progress' })} tone={primaryAlert.status === 'In progress' ? 'aqua' : 'blue'}>{primaryAlert.status === 'In progress' ? <><Check size={16} /> In progress</> : 'Start local response'}</Button><small>Changes stay in this browser. No one is contacted.</small></div>
      </div>
      <Panel title="Primary alert workflow" meta="LOCAL STATUS">
        <div className="workflow">{responseStages.map((status, index) => {
          const currentIndex = responseStages.indexOf(primaryAlert.status);
          return <button className={`workflow-stage ${index < currentIndex ? 'done' : ''} ${index === currentIndex ? 'current' : ''}`} key={status} onClick={() => updateAlert(primaryAlert.id, { status })} aria-pressed={primaryAlert.status === status} data-testid={`button-alert-stage-${status.toLowerCase().replaceAll(' ', '-')}`}>
            <span>{index < currentIndex ? <Check size={15} /> : String(index + 1).padStart(2, '0')}</span><b>{status}</b>{index < responseStages.length - 1 && <i />}
          </button>;
        })}</div>
        <div className="workflow-current"><span className="status-live-dot" /><b>Current sample status: {primaryAlert.status}</b><span>Select a stage to update the saved local alert.</span></div>
      </Panel>
    </> : <Panel title="No sample alerts" meta="LOCAL WORKFLOW"><p>Submit a fictional high-priority case report to create a local response alert.</p><Link href="/case-reporting" className="panel-link">Open case reporting <ArrowRight size={15} /></Link></Panel>}

    <div className="response-queue-header"><div><div className="eyebrow">ALERT QUEUE</div><h2 className="display">Response assignments</h2></div><span className="sample-tag">{activeAlertCount} ACTIVE · LOCAL ONLY</span></div>
    <div className="response-alert-list">{alerts.length === 0 ? <p>No alert records in this browser.</p> : alerts.map((alert) =>
      <article className="response-queue-card" key={alert.id} data-testid={`card-response-alert-${alert.id}`}>
        <div className="response-queue-main"><span className={`risk-label ${alert.priority.toLowerCase()}`}>{alert.priority}</span><h3>{alert.title}</h3><p>{alert.id} · {alert.zone} · {timeAgo(alert.createdAt)}</p></div>
        <label>Assign to<select value={alert.assignee} onChange={(event) => updateAlert(alert.id, { assignee: event.target.value })} data-testid={`select-alert-assignee-${alert.id}`}>{responseTeams.map((team) => <option key={team}>{team}</option>)}</select></label>
        <label>Status<select value={alert.status} onChange={(event) => updateAlert(alert.id, { status: event.target.value as AlertRecord['status'] })} data-testid={`select-alert-status-${alert.id}`}>{responseStages.map((status) => <option key={status}>{status}</option>)}</select></label>
      </article>
    )}</div>
    <div className="response-task-head"><div><div className="eyebrow">FIELD FOLLOW-THROUGH</div><h2 className="display">Linked verification tasks</h2></div><Link className="panel-link" href="/field-verification">Manage all field tasks <ArrowRight size={15} /></Link></div>
    <div className="response-task-grid">{tasks.slice(0, 3).map((task) =>
      <article className="response-task-card" key={task.id}><span className="response-task-status">{task.status}</span><h3>{task.title}</h3><p>{task.zone} · {task.assignee || 'Unassigned'}</p><label>Status<select value={task.status} onChange={(event) => updateTask(task.id, { status: event.target.value as typeof task.status })} data-testid={`select-response-task-${task.id}`}><option>Pending</option><option>Assigned</option><option>In progress</option><option>Verified</option></select></label></article>
    )}</div>
    <div className="response-disclaimer"><AlertTriangle size={15} /> This is a fictional workflow. Assignment and status changes remain local; no responders, services, or health systems are contacted.</div>
  </Shell>;
}

const chartSamples: Record<string, number[][]> = {
  '7 days': [
    [28, 34, 40, 33, 47, 57, 51, 68, 59, 73, 64, 82],
    [38, 42, 49, 47, 54, 61, 55, 66, 73, 69, 77, 81],
    [68, 64, 61, 59, 52, 55, 48, 43, 45, 37, 34, 29],
    [78, 74, 69, 72, 63, 59, 55, 52, 49, 46, 41, 38],
  ],
  '30 days': [
    [24, 30, 33, 39, 37, 47, 51, 49, 58, 55, 69, 77],
    [30, 34, 42, 44, 49, 54, 52, 62, 66, 72, 70, 80],
    [76, 72, 68, 66, 59, 62, 54, 51, 44, 48, 39, 34],
    [82, 76, 73, 69, 67, 61, 57, 54, 51, 47, 42, 39],
  ],
  '90 days': [
    [18, 22, 28, 34, 31, 43, 48, 55, 57, 65, 72, 86],
    [22, 27, 35, 41, 44, 53, 56, 62, 71, 74, 82, 89],
    [82, 77, 71, 73, 65, 60, 58, 51, 47, 42, 38, 31],
    [88, 83, 79, 74, 70, 67, 62, 58, 52, 49, 44, 40],
  ],
};

function MiniChart({ type = 'line', range = '30 days', variant = 0 }: { type?: string; range?: string; variant?: number }) {
  const values = chartSamples[range]?.[variant % 4] ?? chartSamples['30 days'][0];
  const coords = values.map((value, index) => `${(index * 400) / (values.length - 1)},${118 - value}`);
  const linePath = coords.map((point, index) => `${index === 0 ? 'M' : 'L'}${point}`).join(' ');
  const areaPath = `${linePath} L 400 130 L 0 130 Z`;
  const axisLabels = range === '7 days' ? ['DAY 01', 'DAY 03', 'DAY 05', 'DAY 07'] : range === '90 days' ? ['DAY 01', 'DAY 30', 'DAY 60', 'DAY 90'] : ['DAY 01', 'DAY 10', 'DAY 20', 'DAY 30'];
  return <div className={`mini-chart ${type === 'bars' ? 'bars-chart' : ''}`} data-testid={`chart-${type}-${range.replaceAll(' ', '-')}-${variant}`}>
    <div className="chart-grid" />
    {type === 'bars'
      ? <div className="bars">{values.map((value, index) => <i key={index} style={{ height: `${value}%` }} />)}</div>
      : <svg viewBox="0 0 400 130" preserveAspectRatio="none"><path className="chart-area" d={areaPath} /><path className="chart-line" d={linePath} /></svg>}
    <div className="chart-axis">{axisLabels.map((label) => <span key={label}>{label}</span>)}</div>
  </div>;
}

function Analytics() {
  const { cases, caseCount, activeAlertCount } = useDemoStore();
  const [range, setRange] = useState('30 days');
  const [priorityFilter, setPriorityFilter] = useState('All priorities');
  const cutoffDays = Number.parseInt(range, 10);
  const cutoff = Date.now() - cutoffDays * 24 * 60 * 60 * 1000;
  const filteredCases = cases.filter((item) => {
    const inRange = new Date(item.reportedAt).getTime() >= cutoff;
    const matchesPriority = priorityFilter === 'All priorities'
      || (priorityFilter === 'High and critical' && (item.severity === 'High' || item.severity === 'Critical'))
      || (priorityFilter === 'Critical only' && item.severity === 'Critical');
    return inRange && matchesPriority;
  });

  function exportCsv() {
    const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const rows = [
      ['Report ID', 'Zone', 'Symptoms', 'Priority', 'Review status', 'Reported at'],
      ...filteredCases.map((item) => [item.id, item.zone, item.symptoms.join('; '), item.severity, item.status, item.reportedAt]),
    ];
    const csv = rows.map((row) => row.map(escape).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `epishield-sample-cases-${range.replaceAll(' ', '-')}.csv`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <Shell title="Reports & analytics" subtitle="SAMPLE TREND EXPLORER">
    <div className="analytics-filter-bar">
      <div><label htmlFor="analytics-range">Time range</label><select id="analytics-range" value={range} onChange={(event) => setRange(event.target.value)} data-testid="select-analytics-range"><option>7 days</option><option>30 days</option><option>90 days</option></select></div>
      <div><label htmlFor="analytics-priority">Report priority</label><select id="analytics-priority" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} data-testid="select-analytics-priority"><option>All priorities</option><option>High and critical</option><option>Critical only</option></select></div>
      <span className="analytics-filter-count">{filteredCases.length} local sample records match</span>
      <button className="select-button" onClick={exportCsv} data-testid="button-export-csv"><ArrowDownRight size={15} /> Export filtered CSV</button>
    </div>
    <div className="analytics-kpis"><div><span>ILLUSTRATIVE BASELINE</span><b>86% <small>HIGH</small></b><p>{caseCount} sample-platform cases · not live data</p></div><ArrowRight size={21} /><div className="after-kpi"><span>SAMPLE RESPONSE SCENARIO</span><b>34% <small>LOW</small></b><p>Fictional trend after hypothetical response</p></div><div className="reduced-pill"><Activity size={17} /> {activeAlertCount} active local alerts</div></div>
    <div className="analytics-grid">
      <Panel title="Risk trend" meta={`SAMPLE · ${range.toUpperCase()}`}><MiniChart range={range} variant={0} /></Panel>
      <Panel title="Case growth" meta={`SAMPLE · ${range.toUpperCase()}`}><MiniChart range={range} variant={1} /></Panel>
      <Panel title="Environmental trends" meta={`SAMPLE · ${range.toUpperCase()}`}><MiniChart range={range} variant={2} /></Panel>
      <Panel title="Response time" meta={`SAMPLE · ${range.toUpperCase()}`}><MiniChart type="bars" range={range} variant={3} /></Panel>
      <Panel title="High-risk zones" meta="SAMPLE ZONE DISTRIBUTION"><div className="high-zones">{[['Zone A', 86], ['Zone B', 68], ['Zone C', 42], ['Zone D', 61]].map(([zone, value]) => <div key={String(zone)}><span>{zone}</span><div><i style={{ width: `${value}%` }} /></div><b>{value}%</b></div>)}</div></Panel>
      <Panel title="Sensor anomalies" meta="ILLUSTRATIVE INDICATORS">
        <div className="anomaly-card"><span className="anomaly-icon"><Waves size={18} /></span><div><b>Water turbidity</b><small>Sample reading · Zone A</small></div><strong>+38%</strong><span className="tag-high">SAMPLE</span></div>
        <div className="anomaly-card"><span className="anomaly-icon mild"><CloudSun size={18} /></span><div><b>Environmental reading</b><small>Sample reading · Zone B</small></div><strong>+11%</strong><span className="status-label">ILLUSTRATIVE</span></div>
      </Panel>
    </div>
    <div className="analytics-message"><span className="message-icon"><CheckCircle2 size={20} /></span><div><small>ILLUSTRATIVE OUTCOME · SAMPLE DATA</small><b>Hypothetical trend after a response scenario.</b><p>Before: 86% HIGH / SAMPLE CASES / SAMPLE ANOMALY <span>→</span> After: 34% LOW / HYPOTHETICAL TREND ONLY</p></div><span className="sample-tag">NOT A LIVE RESULT</span></div>
    <Panel title="Filtered sample reports" meta="CSV EXPORT CONTAINS THESE FIELDS">
      <div className="table-scroll"><table><thead><tr>{['Report', 'Zone', 'Symptoms', 'Priority', 'Status'].map((heading) => <th key={heading}>{heading}</th>)}</tr></thead><tbody>
        {filteredCases.map((item) => <tr key={item.id}><td><b>{item.id}</b></td><td>{item.zone}</td><td>{item.symptoms.join(', ')}</td><td>{item.severity}</td><td>{item.status}</td></tr>)}
      </tbody></table></div>
      <div className="table-disclaimer">CSV includes only fictional local records and excludes free-text notes.</div>
    </Panel>
  </Shell>;
}

function NotFound() { return <div className="not-found"><Brand/><h1 className="display">Page not found</h1><p>This prototype route is not available.</p><Link href="/dashboard" className="button button-blue">Open command center <ArrowRight size={16}/></Link></div> }

function App() {
  return <BrowserRouter>
    <ScrollToTop />
    <PrototypeDataProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<CreateAccountPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ai-agents" element={<Shell title="AI Agent Center" subtitle="SIMULATED SPECIALIST WORKFLOW"><AgentCenterPage /></Shell>} />
        <Route path="/risk-map" element={<MapPage />} />
        <Route path="/case-reporting" element={<CasesPage />} />
        <Route path="/voice-storage" element={<Shell title="Voice Storage Vault" subtitle="OFFLINE AUDIO RECORDINGS ARCHIVE"><VoiceStoragePage /></Shell>} />
        <Route path="/voice-vault" element={<Navigate to="/voice-storage" replace />} />
        <Route path="/water-intelligence" element={<Shell title="Water intelligence" subtitle="ILLUSTRATIVE ENVIRONMENTAL SIGNALS"><WaterIntelligencePage /></Shell>} />
        <Route path="/outbreak-analysis" element={<Shell title="Outbreak analysis" subtitle="NON-DIAGNOSTIC SAMPLE PATTERNS"><OutbreakAnalysisPage /></Shell>} />
        <Route path="/response-center" element={<ResponsePage />} />
        <Route path="/field-verification" element={<Shell title="Field verification" subtitle="LOCAL SAMPLE TASK MANAGEMENT"><FieldVerificationPage /></Shell>} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Shell title="Settings" subtitle="LOCAL DEMO PREFERENCES"><SettingsPage /></Shell>} />
        <Route path="/cases-symptoms" element={<Navigate to="/case-reporting" replace />} />
        <Route path="/ai-intelligence" element={<Navigate to="/ai-agents" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PrototypeDataProvider>
  </BrowserRouter>;
}

export default App;
