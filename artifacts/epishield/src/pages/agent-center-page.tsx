import { Activity, ArrowRight, Check, Clock3, Droplets, Globe2, HeartPulse, Layers3, Play, Radio, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AgentId } from '../lib/demo-store';
import { useDemoStore } from '../lib/demo-store';
import './extended-pages.css';

const agents: { id: AgentId; name: string; description: string; Icon: LucideIcon; output: string }[] = [
  { id: 'health-signals', name: 'Health Signals', description: 'Organizes fictional case summaries and symptom overlaps.', Icon: HeartPulse, output: 'Sample case signal summary' },
  { id: 'environmental-sentinel', name: 'Environmental Sentinel', description: 'Reviews illustrative water and environmental readings.', Icon: Droplets, output: 'Sample reading review' },
  { id: 'geographic-risk', name: 'Geographic Risk', description: 'Compares sample signals across demonstration zones.', Icon: Globe2, output: 'Zone comparison' },
  { id: 'outbreak-patterns', name: 'Outbreak Patterns', description: 'Surfaces possible co-occurrence patterns for human review.', Icon: Activity, output: 'Pattern review prompt' },
  { id: 'response-coordinator', name: 'Response Coordinator', description: 'Turns reviewed signals into suggested prototype tasks.', Icon: Layers3, output: 'Suggested response sequence' },
  { id: 'community-guidance', name: 'Community Guidance', description: 'Drafts non-clinical, illustrative communication prompts.', Icon: Users, output: 'Community guidance draft' },
];

export function AgentCenterPage() {
  const { agentRuns, runAgent, runAllAgents } = useDemoStore();
  return (
    <section className="epx-page" data-testid="page-agent-center">
      <header className="epx-heading">
        <div><div className="epx-eyebrow">COORDINATED SAMPLE WORKFLOW</div><h2>Six connected specialists</h2><p>Move a fictional signal through review, interpretation, and response planning.</p></div>
        <button className="epx-button epx-run-all" onClick={runAllAgents} data-testid="button-run-all-agents"><Play size={14} /> Run all specialists</button>
      </header>
      <div className="epx-note caution" data-testid="notice-agent-simulation"><Radio size={15} /><span>Simulation only. No live model connection, external service, or real surveillance feed is used. Outputs below describe the demo workflow, not confirmed findings.</span></div>
      <section className="epx-card" aria-label="Specialist workflow">
        <div className="epx-card-head"><h3>Connected review sequence</h3><span>ILLUSTRATIVE HANDOFFS</span></div>
        <div className="epx-agent-flow">
          {agents.map((agent, index) => <div key={agent.id} className="epx-agent-step" data-testid={`workflow-agent-${agent.id}`}>
            <span className="epx-agent-number">0{index + 1}</span><b>{agent.name}</b><small>{agent.output}</small>
          </div>)}
        </div>
      </section>
      <div className="epx-agent-grid">
        {agents.map(({ id, name, description, Icon, output }) => {
          const run = agentRuns[id];
          return <article className="epx-card epx-agent-card" key={id} data-testid={`card-agent-${id}`}>
            <div className="epx-agent-top"><span className="epx-agent-icon"><Icon size={18} /></span><span className="epx-status-pill">{run?.runCount ? 'SIMULATION RUN' : 'READY TO REVIEW'}</span></div>
            <h3>{name}</h3><p>{description}</p>
            <div className="epx-run-state" data-testid={`status-agent-${id}`}>{run?.runCount ? `Simulated ${run.runCount} ${run.runCount === 1 ? 'run' : 'runs'} · latest ${run.lastRunAt ? new Date(run.lastRunAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'just now'}` : `No runs yet · output: ${output}`}</div>
            <button className="epx-control" onClick={() => runAgent(id)} data-testid={`button-run-agent-${id}`}><Play size={12} /> Run this specialist <ArrowRight size={13} /></button>
          </article>;
        })}
      </div>
      <div className="epx-grid-2" style={{ marginTop: 13 }}>
        <section className="epx-card"><div className="epx-card-head"><h3>What a run changes</h3><span>LOCAL PROTOTYPE STATE</span></div><div className="epx-card-body">
          <div className="epx-water-reading"><span><strong>Run counters</strong><small>Incremented in this browser demo</small></span><Check size={15} color="#57958d" /></div>
          <div className="epx-water-reading"><span><strong>Workflow activity</strong><small>Records a simulated completion note</small></span><Check size={15} color="#57958d" /></div>
        </div></section>
        <div className="epx-note"><Clock3 size={15} /><span>Each specialist is shown as a distinct step in a connected workflow. Running an agent updates local demo activity only; it does not assess a person or issue a public-health alert.</span></div>
      </div>
    </section>
  );
}
