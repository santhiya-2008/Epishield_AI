import { useMemo, useState } from 'react';
import { Activity, AlertTriangle, ArrowUpRight, Info, MapPin } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import './extended-pages.css';

type Pattern = { day: string; reports: number; symptomOverlap: number; environmentalIndex: number; zone: string };
const patternData: Pattern[] = [
  { day: 'Oct 01', reports: 7, symptomOverlap: 3, environmentalIndex: 28, zone: 'Zone A' },
  { day: 'Oct 04', reports: 9, symptomOverlap: 4, environmentalIndex: 31, zone: 'Zone A' },
  { day: 'Oct 07', reports: 11, symptomOverlap: 5, environmentalIndex: 36, zone: 'Zone A' },
  { day: 'Oct 10', reports: 15, symptomOverlap: 7, environmentalIndex: 52, zone: 'Zone A' },
  { day: 'Oct 13', reports: 19, symptomOverlap: 10, environmentalIndex: 71, zone: 'Zone A' },
  { day: 'Oct 16', reports: 23, symptomOverlap: 12, environmentalIndex: 67, zone: 'Zone A' },
  { day: 'Oct 19', reports: 28, symptomOverlap: 15, environmentalIndex: 79, zone: 'Zone A' },
  { day: 'Oct 22', reports: 24, symptomOverlap: 13, environmentalIndex: 70, zone: 'Zone A' },
  { day: 'Oct 25', reports: 20, symptomOverlap: 10, environmentalIndex: 61, zone: 'Zone A' },
  { day: 'Oct 28', reports: 16, symptomOverlap: 8, environmentalIndex: 53, zone: 'Zone A' },
  { day: 'Oct 01', reports: 4, symptomOverlap: 1, environmentalIndex: 22, zone: 'Zone B' },
  { day: 'Oct 04', reports: 5, symptomOverlap: 2, environmentalIndex: 24, zone: 'Zone B' },
  { day: 'Oct 07', reports: 7, symptomOverlap: 2, environmentalIndex: 26, zone: 'Zone B' },
  { day: 'Oct 10', reports: 8, symptomOverlap: 3, environmentalIndex: 30, zone: 'Zone B' },
  { day: 'Oct 13', reports: 10, symptomOverlap: 4, environmentalIndex: 34, zone: 'Zone B' },
  { day: 'Oct 16', reports: 9, symptomOverlap: 3, environmentalIndex: 32, zone: 'Zone B' },
  { day: 'Oct 19', reports: 12, symptomOverlap: 5, environmentalIndex: 39, zone: 'Zone B' },
  { day: 'Oct 22', reports: 11, symptomOverlap: 4, environmentalIndex: 36, zone: 'Zone B' },
  { day: 'Oct 25', reports: 8, symptomOverlap: 3, environmentalIndex: 31, zone: 'Zone B' },
  { day: 'Oct 28', reports: 7, symptomOverlap: 2, environmentalIndex: 27, zone: 'Zone B' },
];

export function OutbreakAnalysisPage() {
  const [range, setRange] = useState<'7' | '30' | '90'>('30');
  const [zone, setZone] = useState('All zones');
  const [indicator, setIndicator] = useState<'reports' | 'symptomOverlap' | 'environmentalIndex'>('reports');
  const visible = useMemo(() => {
    const rows = zone === 'All zones' ? patternData.filter((row) => row.zone === 'Zone A') : patternData.filter((row) => row.zone === zone);
    return range === '7' ? rows.slice(-3) : range === '30' ? rows : [...rows, ...rows.slice(-3)];
  }, [range, zone]);
  const comparison = useMemo(() => [
    { label: 'Health report pace', value: visible.at(-1)?.reports ?? 0, fill: '#579da0' },
    { label: 'Symptom overlap', value: visible.at(-1)?.symptomOverlap ?? 0, fill: '#d2ab69' },
    { label: 'Environment index', value: Math.round((visible.at(-1)?.environmentalIndex ?? 0) / 5), fill: '#7bb4b1' },
  ], [visible]);
  return (
    <section className="epx-page" data-testid="page-outbreak-analysis">
      <header className="epx-heading"><div><div className="epx-eyebrow">PATTERN REVIEW · SAMPLE SERIES</div><h2>Illustrative pattern review</h2><p>Compare illustrative symptom reports and environmental context over time, with human review kept at the center.</p></div><span className="epx-sample">NOT A DIAGNOSTIC TOOL</span></header>
      <div className="epx-note caution" data-testid="notice-outbreak-nondiagnostic"><AlertTriangle size={15} /><span>All figures are fictional demonstrations. Pattern overlap can help frame a review question; it cannot establish an outbreak, explain cause, diagnose illness, or replace local public-health judgment.</span></div>
      <div className="epx-kpis" style={{ marginTop: 13 }}>
        <article className="epx-card epx-kpi"><span>ILLUSTRATIVE REPORTS</span><b className="epx-kpi-icon"><Activity size={16} /></b><strong>248</strong><small>Fictional sample summaries</small></article>
        <article className="epx-card epx-kpi"><span>PATTERN REVIEW ZONE</span><b className="epx-kpi-icon"><MapPin size={16} /></b><strong>{zone === 'All zones' ? 'A + B' : zone}</strong><small>Demonstration geography</small></article>
        <article className="epx-card epx-kpi"><span>RECENT SAMPLE PACE</span><b className="epx-kpi-icon"><ArrowUpRight size={16} /></b><strong>{visible.at(-1)?.reports ?? 0} / period</strong><small>Not a real case count</small></article>
        <article className="epx-card epx-kpi"><span>REVIEW POSTURE</span><b className="epx-kpi-icon"><Info size={16} /></b><strong>Human-led</strong><small>Interpretation required</small></article>
      </div>
      <div className="epx-grid-2">
        <section className="epx-card">
          <div className="epx-card-head"><h3>Signals over time</h3><span>ILLUSTRATIVE INDEX</span></div>
          <div className="epx-card-body">
            <div className="epx-filter-row">
              <div className="epx-toolbar">
                <label>Zone <select className="epx-select" value={zone} onChange={(e) => setZone(e.target.value)} data-testid="select-outbreak-zone"><option>All zones</option><option>Zone A</option><option>Zone B</option></select></label>
                <label>Signal <select className="epx-select" value={indicator} onChange={(e) => setIndicator(e.target.value as typeof indicator)} data-testid="select-outbreak-indicator"><option value="reports">Report pace</option><option value="symptomOverlap">Symptom overlap</option><option value="environmentalIndex">Environmental index</option></select></label>
              </div>
              <div className="epx-toolbar" role="group" aria-label="Analysis time range">
                {[['7', '7 days'], ['30', '30 days'], ['90', '90 days']].map(([value, label]) => <button className="epx-control" key={value} aria-pressed={range === value} onClick={() => setRange(value as typeof range)} data-testid={`button-outbreak-range-${value}`}>{label}</button>)}
              </div>
            </div>
            <div className="epx-chart" data-testid="chart-outbreak-trend"><ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visible} margin={{ top: 10, right: 8, left: -17, bottom: 2 }}>
                <defs><linearGradient id="epxOutbreakFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#64aaa6" stopOpacity={0.25} /><stop offset="95%" stopColor="#64aaa6" stopOpacity={0.02} /></linearGradient></defs>
                <CartesianGrid stroke="#eaf0ef" strokeDasharray="3 4" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#91a2a4', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#91a2a4', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ border: '1px solid #dfeae8', borderRadius: 8, fontSize: 10 }} />
                <ReferenceLine y={indicator === 'reports' ? 20 : indicator === 'symptomOverlap' ? 10 : 60} stroke="#d6ad69" strokeDasharray="4 4" />
                <Area type="monotone" dataKey={indicator} name={indicator === 'reports' ? 'Sample report pace' : indicator === 'symptomOverlap' ? 'Symptom overlap' : 'Environmental index'} stroke="#4c9da0" strokeWidth={2.5} fill="url(#epxOutbreakFill)" activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer></div>
            <div className="epx-chart-foot">Signal values are invented examples. Dashed reference is a visual guide only, not a validated threshold.</div>
          </div>
        </section>
        <section className="epx-card">
          <div className="epx-card-head"><h3>Latest sample comparison</h3><span>RELATIVE INDEX · NOT A RISK SCORE</span></div>
          <div className="epx-card-body">
            <div className="epx-chart" style={{ height: 190 }} data-testid="chart-outbreak-comparison"><ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparison} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 0 }}>
                <CartesianGrid stroke="#eaf0ef" strokeDasharray="3 4" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#91a2a4', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="label" type="category" width={105} tick={{ fill: '#71888e', fontSize: 8 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ border: '1px solid #dfeae8', borderRadius: 8, fontSize: 10 }} />
                <Bar dataKey="value" name="Sample comparison" radius={[0, 5, 5, 0]} barSize={16}>{comparison.map((item) => <Cell key={item.label} fill={item.fill} />)}</Bar>
              </BarChart>
            </ResponsiveContainer></div>
            <div className="epx-risk-list">
              {[['Health signal', 72], ['Environmental context', 64], ['Geographic overlap', 58]].map(([label, value]) => <div className="epx-risk-item" key={String(label)}><span>{label}</span><div className="epx-risk-track"><i style={{ width: `${value}%` }} /></div><b>{value}%</b></div>)}
            </div>
            <div className="epx-chart-foot">These values are invented indicator weights for explaining the demo screen, not validated probabilities.</div>
          </div>
        </section>
      </div>
      <section className="epx-card" style={{ marginTop: 13 }}>
        <div className="epx-card-head"><h3>How to read this view</h3><span>HUMAN REVIEW REQUIRED</span></div>
        <div className="epx-card-body epx-grid-3">
          <div><span className="epx-status-pill">01 · CO-OCCURRENCE</span><p style={{ color: '#758b90', fontSize: 9, lineHeight: 1.65 }}>A rising sample report line alongside symptom overlap describes a pattern in this fictional dataset only.</p></div>
          <div><span className="epx-status-pill review">02 · CONTEXT, NOT CAUSE</span><p style={{ color: '#758b90', fontSize: 9, lineHeight: 1.65 }}>Environmental context is displayed for comparison. A visual association does not show that one signal caused another.</p></div>
          <div><span className="epx-status-pill">03 · VERIFY LOCALLY</span><p style={{ color: '#758b90', fontSize: 9, lineHeight: 1.65 }}>Any real-world concern requires appropriate sampling, qualified investigation, and established local procedures.</p></div>
        </div>
      </section>
    </section>
  );
}
