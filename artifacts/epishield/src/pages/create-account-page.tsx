import { useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, Shield, ShieldCheck } from 'lucide-react';
import { useDemoStore } from '../lib/demo-store';
import './extended-pages.css';

export function CreateAccountPage() {
  const { startDemoSession } = useDemoStore();
  const navigate = useNavigate();
  const nameRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const name = nameRef.current?.value.trim() ?? '';
    if (!name) {
      nameRef.current?.focus();
      return;
    }
    startDemoSession(name);
    setMessage(`Welcome, ${name}. Your sample workspace is ready.`);
    form.reset();
    navigate('/dashboard');
  }

  return (
    <main className="epx-account" data-testid="page-create-account">
      <section className="epx-account-story">
        <Link to="/" className="epx-account-brand" data-testid="link-account-brand">
          <span className="epx-account-brand-mark"><Shield size={20} /></span>
          <span>EPISHIELD<small>COMMUNITY HEALTH INTELLIGENCE</small></span>
        </Link>
        <div className="epx-account-copy">
          <div className="epx-eyebrow">A CLEARER VIEW, TOGETHER</div>
          <h1>Make room for an earlier response.</h1>
          <p>Explore how illustrative community signals, environmental readings, and coordinated tasks can fit into one calm working picture.</p>
        </div>
        <div className="epx-account-footer">PROTOTYPE WORKSPACE · FICTIONAL DEMONSTRATION DATA</div>
      </section>
      <section className="epx-account-side">
        <form className="epx-account-form" onSubmit={handleSubmit} noValidate data-testid="form-create-account">
          <span className="epx-account-brand-mark"><ShieldCheck size={19} /></span>
          <div className="epx-eyebrow" style={{ marginTop: 15 }}>START A LOCAL DEMO</div>
          <h2>Create your profile</h2>
          <p>This form opens a browser-based sample experience. It does not create an account or authenticate anyone.</p>
          <label className="epx-field" htmlFor="epx-account-name">Display name
            <input ref={nameRef} id="epx-account-name" name="displayName" type="text" autoComplete="name" maxLength={60} required data-testid="input-account-name" />
          </label>
          <button className="epx-button" type="submit" data-testid="button-start-demo">Start sample workspace <ArrowRight size={15} /></button>
          <div className="epx-form-message" role="status" aria-live="polite" data-testid="status-account-created">{message}</div>
          <div className="epx-account-privacy"><Eye size={13} style={{ verticalAlign: 'middle', marginRight: 5 }} /> No account or authentication is created. Only the display name starts a local demo session; no credentials are requested.</div>
          <p style={{ margin: '16px 0 0', textAlign: 'center', fontSize: 9 }}>
            Already exploring? <Link to="/login" data-testid="link-account-login" style={{ color: '#347f91', fontWeight: 700 }}>Open the sample sign-in</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
