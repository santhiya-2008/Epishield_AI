import { useEffect, useState, type FormEvent } from 'react';
import { Bell, Check, CircleHelp, LockKeyhole, Save, ShieldCheck, UserRound } from 'lucide-react';
import type { UserSettings } from '../lib/demo-store';
import { useDemoStore } from '../lib/demo-store';
import './extended-pages.css';

const notifications: { key: keyof Pick<UserSettings, 'highRiskAlerts' | 'caseReviewAlerts' | 'taskReminders' | 'dailyDigest'>; title: string; detail: string }[] = [
  { key: 'highRiskAlerts', title: 'High-priority sample alerts', detail: 'Local reminders for prototype high-priority states' },
  { key: 'caseReviewAlerts', title: 'Case review reminders', detail: 'A prompt when illustrative reports need review' },
  { key: 'taskReminders', title: 'Field task reminders', detail: 'Reminders for tasks in this browser workspace' },
  { key: 'dailyDigest', title: 'Daily sample summary', detail: 'A compact digest of local prototype activity' },
];

export function SettingsPage() {
  const { settings, saveSettings } = useDemoStore();
  const [draft, setDraft] = useState<UserSettings>(settings);
  const [savedMessage, setSavedMessage] = useState('');
  useEffect(() => setDraft(settings), [settings]);

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveSettings({ displayName: draft.displayName.trim(), teamName: draft.teamName.trim(), highRiskAlerts: draft.highRiskAlerts, caseReviewAlerts: draft.caseReviewAlerts, taskReminders: draft.taskReminders, dailyDigest: draft.dailyDigest });
    setSavedMessage('Preferences saved in this browser.');
  }

  function toggle(key: typeof notifications[number]['key']) {
    setDraft((current) => ({ ...current, [key]: !current[key] }));
    setSavedMessage('');
  }

  return (
    <section className="epx-page" data-testid="page-settings">
      <header className="epx-heading"><div><div className="epx-eyebrow">WORKSPACE PREFERENCES</div><h2>Profile and notifications</h2><p>Set the profile label and reminder preferences used by this local demonstration workspace.</p></div><span className="epx-sample">BROWSER-LOCAL</span></header>
      <div className="epx-note"><LockKeyhole size={15} /><span>Preferences stay in this browser’s demo store. EPISHIELD does not connect to notification services or send messages from these settings.</span></div>
      <form onSubmit={handleSave} className="epx-settings-layout" style={{ marginTop: 13 }} data-testid="form-settings">
        <div className="epx-card epx-settings-form">
          <h3><UserRound size={15} style={{ verticalAlign: 'middle', marginRight: 7, color: '#548e96' }} />Workspace profile</h3>
          <div className="epx-settings-fields">
            <label className="epx-field">Display name<input className="epx-input" value={draft.displayName} maxLength={60} onChange={(e) => { setDraft({ ...draft, displayName: e.target.value }); setSavedMessage(''); }} required data-testid="input-settings-display-name" /></label>
            <label className="epx-field">Team name<input className="epx-input" value={draft.teamName} maxLength={60} onChange={(e) => { setDraft({ ...draft, teamName: e.target.value }); setSavedMessage(''); }} required data-testid="input-settings-team-name" /></label>
          </div>
          <h3 style={{ marginTop: 24 }}><Bell size={15} style={{ verticalAlign: 'middle', marginRight: 7, color: '#548e96' }} />Notification preferences</h3>
          <div className="epx-switch-list">
            {notifications.map(({ key, title, detail }) => <div className="epx-switch-row" key={key}>
              <span><b>{title}</b><small>{detail}</small></span>
              <button type="button" role="switch" aria-checked={draft[key]} className="epx-switch" onClick={() => toggle(key)} aria-label={`${title}: ${draft[key] ? 'on' : 'off'}`} data-testid={`switch-${key}`}><i /></button>
            </div>)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 17 }}>
            <button type="submit" className="epx-button" data-testid="button-save-settings"><Save size={14} /> Save preferences</button>
            <span role="status" aria-live="polite" style={{ color: '#4d8a7c', fontSize: 9 }} data-testid="status-settings-saved">{savedMessage}</span>
          </div>
        </div>
        <aside className="epx-card epx-side-info">
          <span className="epx-agent-icon"><ShieldCheck size={18} /></span>
          <h3 style={{ marginTop: 13 }}>A prototype, by design</h3>
          <p>Profile labels and reminder toggles are stored with the demo workspace in local browser storage. They do not configure a real account or delivery channel.</p>
          <div className="epx-water-reading"><span><strong>External services</strong><small>Not connected</small></span><Check size={14} color="#57958d" /></div>
          <div className="epx-water-reading"><span><strong>Message delivery</strong><small>Not enabled</small></span><Check size={14} color="#57958d" /></div>
          <div className="epx-note" style={{ marginTop: 14 }}><CircleHelp size={14} /><span>Switches are local preference examples; no notifications are sent.</span></div>
        </aside>
      </form>
    </section>
  );
}
