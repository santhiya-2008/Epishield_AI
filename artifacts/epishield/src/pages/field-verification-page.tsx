import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Camera, Check, ClipboardCheck, ImagePlus, MapPin, Plus, ShieldAlert } from 'lucide-react';
import type { FieldTask, TaskDraft, TaskStatus } from '../lib/demo-store';
import { useDemoStore } from '../lib/demo-store';
import './extended-pages.css';

const statuses: TaskStatus[] = ['Pending', 'Assigned', 'In progress', 'Verified'];
const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];
const teams = ['Field team 01', 'Field team 02', 'Health response team', 'Water review team'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function resizedImageData(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const maxSide = 1200;
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext('2d');
      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('This image could not be prepared in your browser.'));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.76);
      URL.revokeObjectURL(objectUrl);
      resolve(dataUrl);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('This image could not be opened.'));
    };
    image.src = objectUrl;
  });
}

export function FieldVerificationPage() {
  const { tasks, createTask, updateTask } = useDemoStore();
  const [draft, setDraft] = useState<TaskDraft>({ title: '', zone: 'Zone A', assignee: '', dueDate: '', notes: '' });
  const [message, setMessage] = useState('');
  const [photoErrors, setPhotoErrors] = useState<Record<string, string>>({});
  const formTitleRef = useRef<HTMLInputElement>(null);

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim() || !draft.zone || !draft.dueDate) {
      formTitleRef.current?.focus();
      return;
    }
    createTask({ ...draft, title: draft.title.trim(), notes: draft.notes.trim() });
    setDraft({ title: '', zone: 'Zone A', assignee: '', dueDate: '', notes: '' });
    setMessage('Field task added to this browser’s sample workflow.');
  }

  async function handlePhoto(task: FieldTask, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoErrors((current) => ({ ...current, [task.id]: 'Choose an image file.' }));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setPhotoErrors((current) => ({ ...current, [task.id]: 'Image exceeds 5 MB. Choose a smaller file.' }));
      return;
    }
    try {
      const photoDataUrl = await resizedImageData(file);
      updateTask(task.id, { photoDataUrl });
      setPhotoErrors((current) => ({ ...current, [task.id]: '' }));
    } catch {
      setPhotoErrors((current) => ({ ...current, [task.id]: 'Could not prepare this image in your browser.' }));
    }
  }

  return (
    <section className="epx-page" data-testid="page-field-verification">
      <header className="epx-heading"><div><div className="epx-eyebrow">LOCAL RESPONSE TASKS</div><h2>Verification queue</h2><p>Coordinate fictional verification work, adjust ownership and status, and attach a resized image to a sample task.</p></div><span className="epx-sample">{tasks.length} SAMPLE TASKS</span></header>
      <div className="epx-note caution"><ShieldAlert size={15} /><span>Use fictional task notes only. Do not upload images containing faces, names, addresses, records, or other personal information. Images are resized and saved as local demo data in this browser.</span></div>
      <section className="epx-card" style={{ marginTop: 13 }}>
        <div className="epx-card-head"><h3>Create verification task</h3><span>LOCAL PROTOTYPE WORKFLOW</span></div>
        <div className="epx-card-body">
          <form className="epx-task-form" onSubmit={handleCreate} data-testid="form-create-task">
            <label className="epx-field">Task title<input ref={formTitleRef} className="epx-input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} maxLength={90} required data-testid="input-task-title" /></label>
            <label className="epx-field">Zone<select className="epx-select" value={draft.zone} onChange={(e) => setDraft({ ...draft, zone: e.target.value })} data-testid="select-task-zone">{zones.map((zone) => <option key={zone}>{zone}</option>)}</select></label>
            <label className="epx-field">Assign to<select className="epx-select" value={draft.assignee} onChange={(e) => setDraft({ ...draft, assignee: e.target.value })} data-testid="select-task-assignee"><option value="">Unassigned</option>{teams.map((team) => <option key={team}>{team}</option>)}</select></label>
            <label className="epx-field">Due date<input className="epx-input" type="date" value={draft.dueDate} onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })} required data-testid="input-task-due-date" /></label>
            <label className="epx-field" style={{ gridColumn: '1 / -1' }}>Task notes (fictional only)<textarea className="epx-textarea" value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} maxLength={240} data-testid="input-task-notes" /></label>
            <button className="epx-button" type="submit" data-testid="button-create-task"><Plus size={14} /> Add sample task</button>
          </form>
          <div role="status" aria-live="polite" className="epx-chart-foot" data-testid="status-task-created">{message}</div>
        </div>
      </section>
      <div className="epx-filter-row" style={{ marginTop: 16, marginBottom: 9 }}><div><div className="epx-eyebrow">TASK REGISTER</div><strong style={{ display: 'block', marginTop: 5, color: '#426370', font: "700 14px 'Manrope'" }}>Verification queue</strong></div><span className="epx-sample">SAMPLE CONTENT ONLY</span></div>
      <div className="epx-task-list" data-testid="list-field-tasks">
        {tasks.length === 0 ? <section className="epx-card epx-card-body" data-testid="empty-field-tasks"><ClipboardCheck size={20} color="#6ba59e" /><h3 style={{ margin: '8px 0 4px', color: '#456874', fontSize: 12 }}>No tasks in this demo yet</h3><p style={{ margin: 0, color: '#899a9e', fontSize: 9 }}>Create a fictional task above to begin a local sample workflow.</p></section> :
          tasks.map((task) => <article className="epx-card epx-task-card" key={task.id} data-testid={`card-field-task-${task.id}`}>
            <div className="epx-task-main">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}><h3>{task.title}</h3><span className={`epx-status-pill ${task.status === 'Pending' ? 'review' : ''}`}>{task.status.toUpperCase()}</span></div>
              <div className="epx-task-meta"><span><MapPin size={12} style={{ verticalAlign: 'middle' }} /> {task.zone}</span><span>Due {task.dueDate || 'not set'}</span><span>Task {task.id}</span><span>{task.assignee || 'Unassigned'}</span></div>
              {task.notes && <p style={{ marginTop: 9 }}>{task.notes}</p>}
              {task.photoDataUrl && <img className="epx-task-photo" src={task.photoDataUrl} alt={`Resized illustrative attachment for ${task.title}`} data-testid={`image-task-photo-${task.id}`} />}
              <div style={{ marginTop: 10 }}>
                <label className="epx-control" htmlFor={`photo-${task.id}`}><ImagePlus size={13} /> {task.photoDataUrl ? 'Replace sample image' : 'Attach sample image'} <Camera size={13} /></label>
                <input id={`photo-${task.id}`} type="file" accept="image/*" onChange={(event) => void handlePhoto(task, event)} data-testid={`input-task-photo-${task.id}`} style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden' }} aria-label={`Upload image for ${task.title}`} />
                {photoErrors[task.id] && <span role="alert" style={{ display: 'block', marginTop: 5, color: '#b96851', fontSize: 8 }}>{photoErrors[task.id]}</span>}
              </div>
            </div>
            <div className="epx-task-controls">
              <label className="epx-field">Assignment<select className="epx-select" value={task.assignee} onChange={(e) => updateTask(task.id, { assignee: e.target.value })} data-testid={`select-assignee-${task.id}`}><option value="">Unassigned</option>{teams.map((team) => <option key={team}>{team}</option>)}</select></label>
              <label className="epx-field">Status<select className="epx-select" value={task.status} onChange={(e) => updateTask(task.id, { status: e.target.value as TaskStatus })} data-testid={`select-status-${task.id}`}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
              {task.status === 'Verified' && <span className="epx-status-pill"><Check size={11} /> VERIFIED</span>}
            </div>
          </article>)
        }
      </div>
    </section>
  );
}
