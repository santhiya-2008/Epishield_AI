import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type CaseSeverity = 'Low' | 'Moderate' | 'High' | 'Critical';
export type CaseStatus = 'Review needed' | 'Reviewed' | 'Follow-up required';
export type AlertStatus = 'Open' | 'Assigned' | 'In progress' | 'Resolved';
export type TaskStatus = 'Pending' | 'Assigned' | 'In progress' | 'Verified';
export type AgentId =
  | 'health-signals'
  | 'environmental-sentinel'
  | 'geographic-risk'
  | 'outbreak-patterns'
  | 'response-coordinator'
  | 'community-guidance';

export interface CaseReport {
  id: string;
  zone: string;
  symptoms: string[];
  severity: CaseSeverity;
  notes: string;
  status: CaseStatus;
  reportedAt: string;
  inputMode: 'manual' | 'voice' | 'sample';
  voiceRecordId?: string;
  audioDataUrl?: string;
  voiceDurationSeconds?: number;
}

export interface AlertRecord {
  id: string;
  title: string;
  zone: string;
  priority: CaseSeverity;
  assignee: string;
  status: AlertStatus;
  createdAt: string;
}

export interface FieldTask {
  id: string;
  title: string;
  zone: string;
  assignee: string;
  status: TaskStatus;
  dueDate: string;
  notes: string;
  photoDataUrl?: string;
  createdAt: string;
}

export interface TaskDraft {
  title: string;
  zone: string;
  assignee: string;
  dueDate: string;
  notes: string;
}

export interface UserSettings {
  displayName: string;
  teamName: string;
  highRiskAlerts: boolean;
  caseReviewAlerts: boolean;
  taskReminders: boolean;
  dailyDigest: boolean;
}

export interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  at: string;
  kind: 'case' | 'alert' | 'task' | 'agent' | 'settings';
}

export interface AgentRunState {
  runCount: number;
  lastRunAt: string | null;
}

export interface PrototypeData {
  cases: CaseReport[];
  alerts: AlertRecord[];
  tasks: FieldTask[];
  settings: UserSettings;
  activities: ActivityItem[];
  agentRuns: Record<AgentId, AgentRunState>;
  demoSession: boolean;
}

const STORAGE_KEY = 'epishield-demo-workspace-v1';
const SEED_CASES: CaseReport[] = [
  { id: 'CS-1048', zone: 'Zone A', symptoms: ['Fever', 'Diarrhea'], severity: 'High', notes: 'Illustrative sample report.', status: 'Review needed', reportedAt: '2026-10-29T09:18:00+05:30', inputMode: 'sample' },
  { id: 'CS-1047', zone: 'Zone A', symptoms: ['Diarrhea', 'Vomiting'], severity: 'Critical', notes: 'Illustrative sample report.', status: 'Follow-up required', reportedAt: '2026-10-29T08:54:00+05:30', inputMode: 'sample' },
  { id: 'CS-1046', zone: 'Zone B', symptoms: ['Fever', 'Stomach pain'], severity: 'Moderate', notes: 'Illustrative sample report.', status: 'Reviewed', reportedAt: '2026-10-29T08:21:00+05:30', inputMode: 'sample' },
  { id: 'CS-1045', zone: 'Zone C', symptoms: ['Fever'], severity: 'Low', notes: 'Illustrative sample report.', status: 'Reviewed', reportedAt: '2026-10-29T07:46:00+05:30', inputMode: 'sample' },
  { id: 'CS-1044', zone: 'Zone A', symptoms: ['Stomach pain', 'Diarrhea'], severity: 'High', notes: 'Illustrative sample report.', status: 'Review needed', reportedAt: '2026-10-29T07:12:00+05:30', inputMode: 'sample' },
];

const SEED_ALERTS: AlertRecord[] = [
  { id: 'AL-208', title: 'Review sample water-quality signal', zone: 'Zone A', priority: 'High', assignee: 'Unassigned', status: 'Open', createdAt: '2026-10-29T09:18:00+05:30' },
  { id: 'AL-207', title: 'Review symptom cluster summary', zone: 'Zone A', priority: 'Critical', assignee: 'Health response team', status: 'In progress', createdAt: '2026-10-29T08:54:00+05:30' },
  { id: 'AL-206', title: 'Check illustrative environmental reading', zone: 'Zone B', priority: 'Moderate', assignee: 'Field team 02', status: 'Assigned', createdAt: '2026-10-29T08:21:00+05:30' },
];

const SEED_TASKS: FieldTask[] = [
  { id: 'FV-031', title: 'Inspect sample water source', zone: 'Zone A', assignee: 'Field team 01', status: 'In progress', dueDate: '2026-10-30', notes: 'Illustrative verification task.', createdAt: '2026-10-29T09:18:00+05:30' },
  { id: 'FV-030', title: 'Review community health summary', zone: 'Zone A', assignee: 'Health response team', status: 'Assigned', dueDate: '2026-10-30', notes: 'Illustrative verification task.', createdAt: '2026-10-29T08:54:00+05:30' },
  { id: 'FV-029', title: 'Confirm sample reading labels', zone: 'Zone B', assignee: 'Field team 02', status: 'Verified', dueDate: '2026-10-29', notes: 'Illustrative verification task.', createdAt: '2026-10-29T08:21:00+05:30' },
];

const AGENT_IDS: AgentId[] = [
  'health-signals',
  'environmental-sentinel',
  'geographic-risk',
  'outbreak-patterns',
  'response-coordinator',
  'community-guidance',
];

const DEFAULT_DATA: PrototypeData = {
  cases: SEED_CASES,
  alerts: SEED_ALERTS,
  tasks: SEED_TASKS,
  settings: {
    displayName: 'EPISHIELD Demo',
    teamName: 'Community Health',
    highRiskAlerts: true,
    caseReviewAlerts: true,
    taskReminders: true,
    dailyDigest: false,
  },
  activities: [
    { id: 'ACT-01', title: 'Water inspection task updated', detail: 'Zone A · In progress · Sample workflow', at: '2026-10-29T09:18:00+05:30', kind: 'task' },
    { id: 'ACT-02', title: 'Health response review assigned', detail: 'Zone A · Sample workflow', at: '2026-10-29T08:54:00+05:30', kind: 'alert' },
    { id: 'ACT-03', title: 'Environmental reading reviewed', detail: 'Zone B · Sample data', at: '2026-10-29T08:21:00+05:30', kind: 'case' },
  ],
  agentRuns: Object.fromEntries(AGENT_IDS.map((id) => [id, { runCount: 0, lastRunAt: null }])) as Record<AgentId, AgentRunState>,
  demoSession: false,
};

function createId(prefix: string) {
  const suffix = globalThis.crypto?.randomUUID?.().slice(0, 8).toUpperCase() ?? Math.random().toString(36).slice(2, 10).toUpperCase();
  return `${prefix}-${suffix}`;
}

function createActivity(title: string, detail: string, kind: ActivityItem['kind']): ActivityItem {
  return { id: createId('ACT'), title, detail, kind, at: new Date().toISOString() };
}

function restoreData(): PrototypeData {
  if (typeof window === 'undefined') return DEFAULT_DATA;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw) as Partial<PrototypeData>;
    return {
      cases: Array.isArray(parsed.cases) ? parsed.cases : SEED_CASES,
      alerts: Array.isArray(parsed.alerts) ? parsed.alerts : SEED_ALERTS,
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : SEED_TASKS,
      settings: parsed.settings && typeof parsed.settings === 'object'
        ? { ...DEFAULT_DATA.settings, ...parsed.settings }
        : DEFAULT_DATA.settings,
      activities: Array.isArray(parsed.activities) ? parsed.activities : DEFAULT_DATA.activities,
      agentRuns: parsed.agentRuns && typeof parsed.agentRuns === 'object'
        ? { ...DEFAULT_DATA.agentRuns, ...parsed.agentRuns }
        : DEFAULT_DATA.agentRuns,
      demoSession: Boolean(parsed.demoSession),
    };
  } catch {
    return DEFAULT_DATA;
  }
}

interface PrototypeContextValue extends PrototypeData {
  caseCount: number;
  activeAlertCount: number;
  submitCase: (input: Omit<CaseReport, 'id' | 'reportedAt' | 'status'>) => CaseReport;
  updateCaseStatus: (id: string, status: CaseStatus) => void;
  updateAlert: (id: string, update: Partial<Pick<AlertRecord, 'assignee' | 'status'>>) => void;
  createTask: (draft: TaskDraft) => FieldTask;
  updateTask: (id: string, update: Partial<Pick<FieldTask, 'assignee' | 'status' | 'photoDataUrl' | 'notes'>>) => void;
  saveSettings: (update: Partial<UserSettings>) => void;
  runAgent: (id: AgentId) => void;
  runAllAgents: () => void;
  startDemoSession: (displayName?: string) => void;
  endDemoSession: () => void;
}

const PrototypeContext = createContext<PrototypeContextValue | null>(null);

export function PrototypeDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PrototypeData>(restoreData);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('EPISHIELD demo data could not be saved in this browser.', error);
    }
  }, [data]);

  const submitCase = useCallback((input: Omit<CaseReport, 'id' | 'reportedAt' | 'status'>) => {
    const report: CaseReport = {
      ...input,
      id: createId('CS'),
      reportedAt: new Date().toISOString(),
      status: 'Review needed',
    };
    const priorityAlert: AlertRecord | null = input.severity === 'High' || input.severity === 'Critical'
      ? {
          id: createId('AL'),
          title: 'Review submitted sample case report',
          zone: input.zone,
          priority: input.severity,
          assignee: 'Unassigned',
          status: 'Open',
          createdAt: report.reportedAt,
        }
      : null;
    setData((current) => ({
      ...current,
      cases: [report, ...current.cases],
      alerts: priorityAlert ? [priorityAlert, ...current.alerts] : current.alerts,
      activities: [
        createActivity('Sample case report submitted', `${input.zone} · ${input.severity} · ${input.inputMode} input`, 'case'),
        ...(priorityAlert ? [createActivity('Sample response alert opened', `${input.zone} · ${input.severity} priority`, 'alert')] : []),
        ...current.activities,
      ].slice(0, 24),
    }));

    // Dual-tier sync: send case report to backend storage
    if (typeof window !== 'undefined') {
      fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      }).catch(() => {});
    }

    return report;
  }, []);

  const updateCaseStatus = useCallback((id: string, status: CaseStatus) => {
    setData((current) => ({
      ...current,
      cases: current.cases.map((item) => item.id === id ? { ...item, status } : item),
      activities: [createActivity('Case review status changed', `${id} · ${status}`, 'case'), ...current.activities].slice(0, 24),
    }));
  }, []);

  const updateAlert = useCallback((id: string, update: Partial<Pick<AlertRecord, 'assignee' | 'status'>>) => {
    setData((current) => {
      const alert = current.alerts.find((item) => item.id === id);
      if (!alert) return current;
      const next = { ...alert, ...update };
      const detail = `${next.zone} · ${next.assignee} · ${next.status}`;
      return {
        ...current,
        alerts: current.alerts.map((item) => item.id === id ? next : item),
        activities: [createActivity('Response alert updated', detail, 'alert'), ...current.activities].slice(0, 24),
      };
    });
  }, []);

  const createTask = useCallback((draft: TaskDraft) => {
    const task: FieldTask = {
      ...draft,
      id: createId('FV'),
      status: draft.assignee ? 'Assigned' : 'Pending',
      createdAt: new Date().toISOString(),
    };
    setData((current) => ({
      ...current,
      tasks: [task, ...current.tasks],
      activities: [createActivity('Field verification task created', `${task.zone} · ${task.title}`, 'task'), ...current.activities].slice(0, 24),
    }));
    return task;
  }, []);

  const updateTask = useCallback((id: string, update: Partial<Pick<FieldTask, 'assignee' | 'status' | 'photoDataUrl' | 'notes'>>) => {
    setData((current) => {
      const task = current.tasks.find((item) => item.id === id);
      if (!task) return current;
      const next = { ...task, ...update };
      return {
        ...current,
        tasks: current.tasks.map((item) => item.id === id ? next : item),
        activities: [createActivity('Field verification task updated', `${next.zone} · ${next.title} · ${next.status}`, 'task'), ...current.activities].slice(0, 24),
      };
    });
  }, []);

  const saveSettings = useCallback((update: Partial<UserSettings>) => {
    setData((current) => ({
      ...current,
      settings: { ...current.settings, ...update },
      activities: [createActivity('Prototype preferences saved', 'Settings stored in this browser only', 'settings'), ...current.activities].slice(0, 24),
    }));
  }, []);

  const runAgent = useCallback((id: AgentId) => {
    setData((current) => {
      const run = current.agentRuns[id] ?? { runCount: 0, lastRunAt: null };
      return {
        ...current,
        agentRuns: { ...current.agentRuns, [id]: { runCount: run.runCount + 1, lastRunAt: new Date().toISOString() } },
        activities: [createActivity('Illustrative AI agent run completed', `${id} · simulated sample workflow`, 'agent'), ...current.activities].slice(0, 24),
      };
    });
  }, []);

  const runAllAgents = useCallback(() => {
    const at = new Date().toISOString();
    setData((current) => ({
      ...current,
      agentRuns: Object.fromEntries(AGENT_IDS.map((id) => {
        const run = current.agentRuns[id] ?? { runCount: 0, lastRunAt: null };
        return [id, { runCount: run.runCount + 1, lastRunAt: at }];
      })) as Record<AgentId, AgentRunState>,
      activities: [createActivity('Illustrative agent workflow completed', 'Six simulated agents · no live model connection', 'agent'), ...current.activities].slice(0, 24),
    }));
  }, []);

  const startDemoSession = useCallback((displayName?: string) => {
    setData((current) => ({
      ...current,
      demoSession: true,
      settings: displayName ? { ...current.settings, displayName } : current.settings,
    }));
  }, []);

  const endDemoSession = useCallback(() => {
    setData((current) => ({ ...current, demoSession: false }));
  }, []);

  const value = useMemo<PrototypeContextValue>(() => ({
    ...data,
    caseCount: 248 + Math.max(0, data.cases.length - SEED_CASES.length),
    activeAlertCount: Math.max(0, 12 + data.alerts.length - SEED_ALERTS.length - data.alerts.filter((item) => item.status === 'Resolved').length),
    submitCase,
    updateCaseStatus,
    updateAlert,
    createTask,
    updateTask,
    saveSettings,
    runAgent,
    runAllAgents,
    startDemoSession,
    endDemoSession,
  }), [data, submitCase, updateCaseStatus, updateAlert, createTask, updateTask, saveSettings, runAgent, runAllAgents, startDemoSession, endDemoSession]);

  return <PrototypeContext.Provider value={value}>{children}</PrototypeContext.Provider>;
}

export function useDemoStore() {
  const value = useContext(PrototypeContext);
  if (!value) throw new Error('useDemoStore must be used inside PrototypeDataProvider.');
  return value;
}

