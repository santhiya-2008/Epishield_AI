import { useNavigate } from 'react-router-dom';
import { Headphones, ShieldCheck, HardDrive, Download, Mic, CheckCircle2 } from 'lucide-react';
import { VoiceStorageVault } from '../components/voice-storage-vault';
import './extended-pages.css';

export function VoiceStoragePage() {
  const navigate = useNavigate();

  return (
    <section className="epx-page" data-testid="page-voice-storage">
      <header className="epx-heading">
        <div>
          <div className="epx-eyebrow">OFFLINE AUDIO ARCHIVE</div>
          <h2>Voice Storage Vault</h2>
          <p>
            Review, play back, and export offline voice recordings stored in this browser after case reporting and voice chat sessions.
          </p>
        </div>
        <span className="epx-sample">BROWSER-LOCAL STORAGE</span>
      </header>

      {/* Main Storage Vault Component */}
      <VoiceStorageVault
        onSelectCase={() => {
          navigate('/case-reporting');
        }}
      />

      {/* Feature highlight cards */}
      <div className="epx-grid-3" style={{ marginTop: 18 }}>
        <article className="epx-card" style={{ padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#276878', marginBottom: 6 }}>
            <Mic size={16} />
            <h4 style={{ margin: 0, fontSize: 11, fontWeight: 700 }}>100% Offline Recording</h4>
          </div>
          <p style={{ margin: 0, color: '#749298', fontSize: 8.5, lineHeight: 1.55 }}>
            Captured directly using the browser’s native MediaRecorder API. No external speech servers or Gemini cloud voice are used.
          </p>
        </article>

        <article className="epx-card" style={{ padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#276878', marginBottom: 6 }}>
            <HardDrive size={16} />
            <h4 style={{ margin: 0, fontSize: 11, fontWeight: 700 }}>Persistent Local Storage</h4>
          </div>
          <p style={{ margin: 0, color: '#749298', fontSize: 8.5, lineHeight: 1.55 }}>
            All audio files are saved into browser IndexedDB. Your recordings remain intact across page refreshes and offline sessions.
          </p>
        </article>

        <article className="epx-card" style={{ padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#276878', marginBottom: 6 }}>
            <Download size={16} />
            <h4 style={{ margin: 0, fontSize: 11, fontWeight: 700 }}>Direct Audio Export</h4>
          </div>
          <p style={{ margin: 0, color: '#749298', fontSize: 8.5, lineHeight: 1.55 }}>
            Download any stored recording as a high-fidelity WebM audio file directly to your computer with full metadata preservation.
          </p>
        </article>
      </div>
    </section>
  );
}
