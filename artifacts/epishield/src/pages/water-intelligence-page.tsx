import { useMemo, useState } from 'react';
import { Activity, Droplets, Info, Waves } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import './extended-pages.css';

type Reading = { day: string; turbidity: number; ph: number; temperature: number; zone: string };
const readings: Reading[] = [
  { day: 'Oct 01', turbidity: 3.2, ph: 7.1, temperature: 23.1, zone: 'Zone A' },
  { day: 'Oct 04', turbidity: 3.8, ph: 7.0, temperature: 23.4, zone: 'Zone A' },
  { day: 'Oct 07', turbidity: 4.1, ph: 7.2, temperature: 23.7, zone: 'Zone A' },
  { day: 'Oct 10', turbidity: 5.8, ph: 7.1, temperature: 24.0, zone: 'Zone A' },
  { day: 'Oct 13', turbidity: 7.6, ph: 6.9, temperature: 24.4, zone: 'Zone A' },
  { day: 'Oct 16', turbidity: 6.9, ph: 7.0, temperature: 24.2, zone: 'Zone A' },
  { day: 'Oct 19', turbidity: 8.1, ph: 6.8, temperature: 24.8, zone: 'Zone A' },
  { day: 'Oct 22', turbidity: 7.1, ph: 7.0, temperature: 24.5, zone: 'Zone A' },
  { day: 'Oct 25', turbidity: 6.4, ph: 7.1, temperature: 24.1, zone: 'Zone A' },
  { day: 'Oct 28', turbidity: 5.7, ph: 7.2, temperature: 23.9, zone: 'Zone A' },
  { day: 'Oct 01', turbidity: 2.4, ph: 7.3, temperature: 22.8, zone: 'Zone B' },
  { day: 'Oct 04', turbidity: 2.8, ph: 7.2, temperature: 22.9, zone: 'Zone B' },
  { day: 'Oct 07', turbidity: 3.0, ph: 7.4, temperature: 23.2, zone: 'Zone B' },
  { day: 'Oct 10', turbidity: 3.4, ph: 7.3, temperature: 23.4, zone: 'Zone B' },
  { day: 'Oct 13', turbidity: 3.1, ph: 7.2, temperature: 23.1, zone: 'Zone B' },
  { day: 'Oct 16', turbidity: 3.9, ph: 7.1, temperature: 23.6, zone: 'Zone B' },
  { day: 'Oct 19', turbidity: 4.2, ph: 7.3, temperature: 23.8, zone: 'Zone B' },
  { day: 'Oct 22', turbidity: 3.6, ph: 7.4, temperature: 23.5, zone: 'Zone B' },
  { day: 'Oct 25', turbidity: 3.3, ph: 7.2, temperature: 23.3, zone: 'Zone B' },
  { day: 'Oct 28', turbidity: 2.9, ph: 7.3, temperature: 23.0, zone: 'Zone B' },
];

export function WaterIntelligencePage() {
  const [range, setRange] = useState<'7' | '30' | '90'>('30');
  const [zone, setZone] = useState('Zone A');
  const [metric, setMetric] = useState<'turbidity' | 'ph' | 'temperature'>('turbidity');
  const days = Number(range);
  const filtered = useMemo(() => {
    const selected = readings.filter((row) => row.zone === zone);
    return days === 7 ? selected.slice(-3) : days === 30 ? selected : [...selected, ...selected.slice(-3)];
  }, [days, zone]);
  const latest = filtered[filtered.length - 1];
  const labels = { turbidity: 'Turbidity', ph: 'pH', temperature: 'Temperature' };
  const units = { turbidity: 'NTU', ph: 'pH', temperature: '°C' };
  return (
    <section className="epx-page" data-testid="page-water-intelligence">
      <header className="epx-heading"><div><div className="epx-eyebrow">ENVIRONMENTAL SAMPLE SIGNALS</div><h2>Reading history</h2><p>Explore fictional water-quality readings and how they vary across the demonstration region.</p></div><span className="epx-sample">ILLUSTRATIVE READINGS</span></header>
      <div className="epx-note" data-testid="notice-water-sample"><Info size={15} /><span>All values are invented sample data, not sensor telemetry or laboratory results. Threshold marks are visual reference points for this prototype only—not safety standards or diagnostic guidance.</span></div>
      <div className="epx-kpis" style={{ marginTop: 13 }}>
        <article className="epx-card epx-kpi"><span>LAST SAMPLE · TURBIDITY</span><b className="epx-kpi-icon"><Droplets size={16} /></b><strong>{latest?.turbidity.toFixed(1)} <small>NTU</small></strong><small>Illustrative reading · {zone}</small></article>
        <article className="epx-card epx-kpi"><span>LAST SAMPLE · PH</span><b className="epx-kpi-icon"><Activity size={16} /></b><strong>{latest?.ph.toFixed(1)}</strong><small>Illustrative scale value</small></article>
        <article className="epx-card epx-kpi"><span>LAST SAMPLE · TEMPERATURE</span><b className="epx-kpi-icon"><Waves size={16} /></b><strong>{latest?.temperature.toFixed(1)} <small>°C</small></strong><small>Illustrative reading</small></article>
        <article className="epx-card epx-kpi"><span>REVIEW FLAG</span><b className="epx-kpi-icon"><Info size={16} /></b><strong>{(latest?.turbidity ?? 0) >= 6 ? 'Review' : 'Observe'}</strong><small>Prototype display rule only</small></article>
      </div>
      <section className="epx-card">
        <div className="epx-card-head"><h3>Reading history</h3><span>FICTIONAL SAMPLE SERIES</span></div>
        <div className="epx-card-body">
          <div className="epx-filter-row">
            <div className="epx-toolbar">
              <label>Zone <select className="epx-select" value={zone} onChange={(e) => setZone(e.target.value)} data-testid="select-water-zone"><option>Zone A</option><option>Zone B</option></select></label>
              <label>Measure <select className="epx-select" value={metric} onChange={(e) => setMetric(e.target.value as typeof metric)} data-testid="select-water-measure"><option value="turbidity">Turbidity</option><option value="ph">pH</option><option value="temperature">Temperature</option></select></label>
            </div>
            <div className="epx-toolbar" role="group" aria-label="Reading time range">
              {[['7', '7 days'], ['30', '30 days'], ['90', '90 days']].map(([value, label]) => <button key={value} className="epx-control" aria-pressed={range === value} onClick={() => setRange(value as typeof range)} data-testid={`button-water-range-${value}`}>{label}</button>)}
            </div>
          </div>
          <div className="epx-chart" data-testid="chart-water-readings"><ResponsiveContainer width="100%" height="100%">
            <LineChart data={filtered} margin={{ top: 8, right: 12, left: -17, bottom: 2 }}>
              <CartesianGrid stroke="#eaf0ef" strokeDasharray="3 4" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#91a2a4', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis domain={metric === 'ph' ? [6, 8] : metric === 'temperature' ? [21, 27] : [0, 10]} tick={{ fill: '#91a2a4', fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ border: '1px solid #dfeae8', borderRadius: 8, fontSize: 10 }} formatter={(value: number) => [`${value.toFixed(1)} ${units[metric]}`, labels[metric]]} />
              {metric === 'turbidity' && <ReferenceLine y={6} stroke="#d6ad69" strokeDasharray="4 4" />}
              <Line type="monotone" dataKey={metric} name={labels[metric]} stroke="#4c9da0" strokeWidth={2.5} dot={{ r: 3, fill: '#4c9da0', strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer></div>
          <div className="epx-chart-foot">Showing {filtered.length} sample points for {zone} across {days} days · {labels[metric]} ({units[metric]}) · no live sensor connection</div>
        </div>
      </section>
      <div className="epx-grid-2" style={{ marginTop: 13 }}>
        <section className="epx-card"><div className="epx-card-head"><h3>Latest sample readings</h3><span>DEMONSTRATION VALUES</span></div><div className="epx-card-body">
          {[
            ['Turbidity', `${latest?.turbidity.toFixed(1)} NTU`, 'Reference line is a prototype display cue', (latest?.turbidity ?? 0) >= 6],
            ['pH', latest?.ph.toFixed(1) ?? '—', 'Illustrative reading only', false],
            ['Temperature', `${latest?.temperature.toFixed(1)} °C`, 'Illustrative reading only', false],
          ].map(([title, value, detail, flagged]) => <div key={String(title)} className="epx-water-reading"><span><strong>{title}</strong><small>{detail}</small></span><span className={`epx-reading-value ${flagged ? 'alert' : ''}`}>{String(value)}</span></div>)}
        </div></section>
        <div className="epx-note caution"><Info size={15} /><span>A displayed deviation is not proof of contamination. Interpretation depends on validated sampling, local standards, and qualified review. This prototype makes no health or safety determination.</span></div>
      </div>
    </section>
  );
}
