import {
  Activity,
  ArrowRight,
  CircleAlert,
  Clock3,
  ShieldCheck,
  Waves,
} from 'lucide-react';
import type { ReactNode } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const palette = {
  ocean: '#287ba0',
  aqua: '#55aaa2',
  deep: '#245f76',
  coral: '#d98770',
  gold: '#d2a766',
  mist: '#dce9e9',
  text: '#83979c',
};

const riskTrend = [
  { period: 'Illustrative −5', risk: 42 },
  { period: 'Illustrative −4', risk: 48 },
  { period: 'Illustrative −3', risk: 57 },
  { period: 'Illustrative −2', risk: 68 },
  { period: 'Illustrative −1', risk: 78 },
  { period: 'Before response', risk: 86 },
  { period: 'Illustrative +1', risk: 69 },
  { period: 'Illustrative +2', risk: 54 },
  { period: 'Illustrative +3', risk: 43 },
  { period: 'After response', risk: 34 },
];

const caseGrowth = [
  { period: 'Illustrative −5', cases: 18 },
  { period: 'Illustrative −4', cases: 25 },
  { period: 'Illustrative −3', cases: 37 },
  { period: 'Illustrative −2', cases: 49 },
  { period: 'Illustrative −1', cases: 63 },
  { period: 'Before response', cases: 74 },
  { period: 'Illustrative +1', cases: 72 },
  { period: 'Illustrative +2', cases: 67 },
  { period: 'Illustrative +3', cases: 59 },
  { period: 'After response', cases: 51 },
];

const environment = [
  { period: 'Illustrative −4', water: 62, humidity: 57, temperature: 48 },
  { period: 'Illustrative −3', water: 70, humidity: 64, temperature: 52 },
  { period: 'Illustrative −2', water: 77, humidity: 72, temperature: 59 },
  { period: 'Illustrative −1', water: 84, humidity: 79, temperature: 65 },
  { period: 'Before response', water: 91, humidity: 86, temperature: 71 },
  { period: 'Illustrative +1', water: 80, humidity: 75, temperature: 64 },
  { period: 'Illustrative +2', water: 69, humidity: 66, temperature: 57 },
  { period: 'After response', water: 58, humidity: 55, temperature: 50 },
];

const responseTime = [
  { action: 'Alert review', minutes: 18 },
  { action: 'Field dispatch', minutes: 32 },
  { action: 'Water check', minutes: 24 },
  { action: 'Community notice', minutes: 41 },
  { action: 'Follow-up', minutes: 27 },
];

const zones = [
  { zone: 'North inlet', level: 86 },
  { zone: 'Market quarter', level: 72 },
  { zone: 'East canal', level: 61 },
  { zone: 'Harbor edge', level: 49 },
  { zone: 'South basin', level: 36 },
];

const anomalies = [
  { period: 'Illustrative −3', events: 1 },
  { period: 'Illustrative −2', events: 2 },
  { period: 'Illustrative −1', events: 4 },
  { period: 'Before response', events: 7 },
  { period: 'Illustrative +1', events: 5 },
  { period: 'Illustrative +2', events: 3 },
  { period: 'After response', events: 1 },
];

type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; color?: string; dataKey?: string }>;
  label?: string | number;
  suffix?: string;
};

function ChartTooltip({ active, payload, label, suffix = '' }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip-box">
      <div className="tooltip-title">{label}</div>
      {payload.map((item, index) => (
        <div className="tooltip-row" key={`${item.dataKey ?? item.name}-${index}`}>
          <i className="tooltip-dot" style={{ background: item.color ?? palette.ocean }} />
          <span>{item.name}</span>
          <strong>{item.value}{suffix}</strong>
        </div>
      ))}
    </div>
  );
}

function ChartCard({
  title,
  note,
  index,
  wide = false,
  children,
}: {
  title: string;
  note: string;
  index: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={`chart-card${wide ? ' wide' : ''}`} aria-label={`${title} chart`}>
      <header className="chart-head">
        <div>
          <h2>{title}</h2>
          <p>{note}</p>
        </div>
        <span className="chart-index">{index}</span>
      </header>
      {children}
      <div className="chart-footer">Prototype / sample values · illustrative only, not actual measurements</div>
    </section>
  );
}

const axisProps = {
  tick: { fill: palette.text, fontSize: 10 },
  axisLine: { stroke: palette.mist },
  tickLine: false as const,
};

function formatPeriod(value: string | number) {
  return String(value)
    .replace('Illustrative ', '')
    .replace('Before response', 'Before')
    .replace('After response', 'After');
}

function App() {
  return (
    <main className="dashboard page-enter">
      <div className="shell">
        <header className="topline">
          <div className="brand" aria-label="EPISHIELD Analytics">
            <span className="brand-mark"><ShieldCheck size={22} strokeWidth={1.8} /></span>
            <div className="brand-name">EPISHIELD<small>ANALYTICS</small></div>
          </div>
          <div className="source-pill"><i />LOCAL PROTOTYPE VIEW</div>
        </header>

        <section className="headline">
          <div>
            <div className="kicker">Response impact · illustrative scenario</div>
            <h1>Risk, before and after response.</h1>
            <p>A static visual summary of a sample EPISHIELD scenario.</p>
          </div>
          <div className="sample-chip"><span />PROTOTYPE / SAMPLE DATA</div>
        </section>

        <section className="outcome-band" aria-label="Before and after response outcomes">
          <div className="outcome-side">
            <div className="outcome-label">Before response</div>
            <div className="outcome-value"><strong>86%</strong><span>HIGH</span></div>
            <p className="outcome-note">74 CASES · ANOMALY DETECTED</p>
          </div>
          <div className="outcome-arrow"><ArrowRight size={17} /></div>
          <div className="outcome-side">
            <div className="outcome-label">After response</div>
            <div className="outcome-value"><strong>34%</strong><span>LOW</span></div>
            <p className="outcome-note">CASE GROWTH REDUCED</p>
          </div>
          <div className="outcome-caption"><b>Risk reduced after response actions.</b> Sample readings are normalizing.</div>
        </section>

        <section className="metrics" aria-label="Scenario highlights">
          <div className="metric">
            <span className="metric-mark"><Activity size={18} /></span>
            <div><small>Peak illustrative risk</small><strong>86% · High</strong><em>Before response</em></div>
          </div>
          <div className="metric">
            <span className="metric-mark"><CircleAlert size={18} /></span>
            <div><small>Scenario case count</small><strong>74 cases</strong><em>Sample peak before response</em></div>
          </div>
          <div className="metric">
            <span className="metric-mark"><Waves size={18} /></span>
            <div><small>Sensor scenario</small><strong>Normalizing</strong><em>Illustrative anomaly pattern</em></div>
          </div>
        </section>

        <div className="chart-grid">
          <ChartCard title="Risk Trend" note="Illustrative risk index · relative scale" index="01" wide>
            <div className="chart-wrap tall">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={riskTrend} margin={{ top: 8, right: 12, left: -12, bottom: 5 }}>
                  <defs>
                    <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={palette.ocean} stopOpacity={0.26} />
                      <stop offset="100%" stopColor={palette.ocean} stopOpacity={0.025} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#eaf0ef" strokeDasharray="3 5" />
                  <XAxis dataKey="period" {...axisProps} interval={2} tickFormatter={formatPeriod} />
                  <YAxis {...axisProps} domain={[0, 100]} tickFormatter={(value: number) => `${value}%`} />
                  <Tooltip content={<ChartTooltip suffix="%" />} isAnimationActive={false} cursor={{ stroke: '#93b9bd', strokeDasharray: '3 3' }} />
                  <ReferenceLine x="Before response" stroke={palette.coral} strokeDasharray="4 4" />
                  <Area dataKey="risk" name="Risk index" type="monotone" stroke={palette.ocean} strokeWidth={2.5} fill="url(#riskFill)" activeDot={{ r: 5, fill: palette.ocean, stroke: '#fff', strokeWidth: 2 }} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Case Growth" note="Illustrative cumulative scenario cases" index="02">
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={caseGrowth} margin={{ top: 8, right: 9, left: -18, bottom: 3 }}>
                  <CartesianGrid vertical={false} stroke="#eaf0ef" strokeDasharray="3 5" />
                  <XAxis dataKey="period" {...axisProps} interval={2} tickFormatter={formatPeriod} />
                  <YAxis {...axisProps} />
                  <Tooltip content={<ChartTooltip suffix=" cases" />} isAnimationActive={false} cursor={{ stroke: '#93b9bd', strokeDasharray: '3 3' }} />
                  <ReferenceLine x="Before response" stroke={palette.coral} strokeDasharray="4 4" />
                  <Line dataKey="cases" name="Sample cases" type="monotone" stroke={palette.aqua} strokeWidth={2.5} dot={{ r: 3, fill: palette.aqua, stroke: '#fff', strokeWidth: 1.5 }} activeDot={{ r: 5 }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Environmental Trends" note="Illustrative normalized index · higher is more elevated" index="03">
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={environment} margin={{ top: 8, right: 8, left: -18, bottom: 3 }}>
                  <CartesianGrid vertical={false} stroke="#eaf0ef" strokeDasharray="3 5" />
                  <XAxis dataKey="period" {...axisProps} interval={2} tickFormatter={formatPeriod} />
                  <YAxis {...axisProps} domain={[0, 100]} />
                  <Tooltip content={<ChartTooltip />} isAnimationActive={false} cursor={{ stroke: '#93b9bd', strokeDasharray: '3 3' }} />
                  <Line dataKey="water" name="Water index" type="monotone" stroke={palette.ocean} strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
                  <Line dataKey="humidity" name="Humidity index" type="monotone" stroke={palette.aqua} strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
                  <Line dataKey="temperature" name="Temperature index" type="monotone" stroke={palette.gold} strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-footer" style={{ borderTop: 0, paddingTop: 0 }}>Series: Water index · Humidity index · Temperature index</div>
          </ChartCard>

          <ChartCard title="Response Time" note="Illustrative minutes by response step" index="04">
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={responseTime} margin={{ top: 8, right: 8, left: -18, bottom: 2 }}>
                  <CartesianGrid vertical={false} stroke="#eaf0ef" strokeDasharray="3 5" />
                  <XAxis dataKey="action" {...axisProps} interval={0} angle={-18} textAnchor="end" height={50} tick={{ fill: palette.text, fontSize: 9 }} />
                  <YAxis {...axisProps} tickFormatter={(value: number) => `${value}m`} />
                  <Tooltip content={<ChartTooltip suffix=" min" />} isAnimationActive={false} cursor={false} />
                  <Bar dataKey="minutes" name="Illustrative duration" fill={palette.ocean} fillOpacity={0.83} radius={[5, 5, 0, 0]} isAnimationActive={false}>
                    {responseTime.map((item, index) => <Cell key={item.action} fill={index === 3 ? palette.aqua : palette.ocean} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="High-Risk Zones" note="Illustrative relative risk index by sample zone" index="05">
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zones} layout="vertical" margin={{ top: 4, right: 15, left: 4, bottom: 4 }}>
                  <CartesianGrid horizontal={false} stroke="#eaf0ef" strokeDasharray="3 5" />
                  <XAxis type="number" domain={[0, 100]} {...axisProps} tickFormatter={(value: number) => `${value}%`} />
                  <YAxis type="category" dataKey="zone" width={94} {...axisProps} />
                  <Tooltip content={<ChartTooltip suffix="%" />} isAnimationActive={false} cursor={{ fill: '#f0f7f6' }} />
                  <Bar dataKey="level" name="Relative risk index" radius={[0, 5, 5, 0]} isAnimationActive={false}>
                    {zones.map((zone, index) => <Cell key={zone.zone} fill={index === 0 ? palette.coral : index < 3 ? palette.ocean : '#89c9bf'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Sensor Anomalies" note="Illustrative anomaly flags · sample sequence" index="06" wide>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={anomalies} margin={{ top: 10, right: 12, left: -12, bottom: 5 }}>
                  <defs>
                    <linearGradient id="anomalyFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={palette.coral} stopOpacity={0.22} />
                      <stop offset="100%" stopColor={palette.coral} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#eaf0ef" strokeDasharray="3 5" />
                  <XAxis dataKey="period" {...axisProps} interval={1} tickFormatter={formatPeriod} />
                  <YAxis {...axisProps} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip suffix=" flags" />} isAnimationActive={false} cursor={{ stroke: '#93b9bd', strokeDasharray: '3 3' }} />
                  <ReferenceLine x="Before response" stroke={palette.coral} strokeDasharray="4 4" />
                  <Area dataKey="events" name="Sample anomaly flags" type="monotone" stroke={palette.coral} strokeWidth={2.5} fill="url(#anomalyFill)" activeDot={{ r: 5, fill: palette.coral, stroke: '#fff', strokeWidth: 2 }} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <footer className="footer">
          <span><b>EPISHIELD Analytics</b> · static prototype companion</span>
          <span>All values are prototype/sample data; chart points are illustrative, not actual measurements.</span>
          <span><Clock3 size={12} style={{ verticalAlign: '-2px', marginRight: 5 }} />No live data connection</span>
        </footer>
      </div>
    </main>
  );
}

export default App;
