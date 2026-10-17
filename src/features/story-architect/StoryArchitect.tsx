import { Fragment, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BookOpen, CheckCircle2, Compass, Download, Globe2, HelpCircle, Layers3, Plus, ShieldCheck, Trash2, Upload } from 'lucide-react';
import { ACT_NAMES, JOURNEY, WORLD_KINDS } from './journey';
import { exportProject, hasOutline, importProject, makeBeat, makeProject, makeSample, makeWorld, MAX_IMPORT_BYTES, reviewProject, type Beat, type Project, type WorldEntry } from './model';
import { useWorkspace } from './useWorkspace';
import './StoryArchitect.css';

type Tab = 'journey' | 'world' | 'review';
function download(text: string, name: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function Field({ label, value, onChange, hint, placeholder, multiline = true }: { label: string; value: string; onChange: (s: string) => void; hint?: string; placeholder?: string; multiline?: boolean }) {
  return <label className="sa-field"><span>{label}</span>{multiline
    ? <textarea value={value} onChange={e => onChange(e.target.value)} maxLength={100000} placeholder={placeholder} />
    : <input value={value} onChange={e => onChange(e.target.value)} maxLength={100000} placeholder={placeholder} />}{hint && <small>{hint}</small>}</label>;
}
function Axis({ name, tone, children }: { name: string; tone: string; children: ReactNode }) {
  return <section><div className={`sa-axis-title sa-axis-${tone}`}><i />{name}</div>{children}</section>;
}
function PressureCurve({ beats }: { beats: Beat[] }) {
  const active = beats.filter(b => b.included);
  const marked = active.filter(b => b.pressure !== null);
  if (!marked.length) return <p className="sa-note" style={{ marginTop: 16 }}>Add your own pressure estimates to see the curve. Nothing is scored automatically.</p>;
  const x = (i: number) => 12 + i / Math.max(active.length - 1, 1) * 196;
  const y = (p: number) => 76 - p * .6;
  return <svg className="sa-tension" viewBox="0 0 220 100" role="img" aria-label="Author-entered pressure by included beat, from 0 to 100. Unrated beats are gaps.">
    {[16, 46, 76].map(v => <line key={v} x1="10" x2="210" y1={v} y2={v} stroke="hsl(240 15% 18%)" strokeDasharray="3 4" />)}
    {active.map((b, i) => <Fragment key={b.id}>
      {i > 0 && b.pressure !== null && active[i - 1].pressure !== null && <line x1={x(i - 1)} y1={y(active[i - 1].pressure!)} x2={x(i)} y2={y(b.pressure)} stroke="hsl(var(--primary))" strokeWidth="2" />}
      {b.pressure !== null && <circle cx={x(i)} cy={y(b.pressure)} r="3" fill="hsl(var(--primary))"><title>{b.title}: {b.pressure}/100</title></circle>}
    </Fragment>)}
    <text x="10" y="96">FIRST BEAT</text><text x="210" y="96" textAnchor="end">LAST BEAT</text>
  </svg>;
}

export default function StoryArchitect() {
  const store = useWorkspace();
  const { project, workspace } = store;
  const [pending, setPending] = useState<Project | null>(null);
  const [notice, setNotice] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const full = workspace.projects.length >= 30;
  const prepare = (raw: string) => {
    try { setPending(importProject(raw)); setNotice(''); }
    catch (e) { setNotice(e instanceof Error ? e.message : 'Import failed. No existing story was changed.'); }
  };
  const backup = () => {
    try { download(exportProject(project), `celsius-${project.title.replace(/[^a-z0-9]+/gi, '-').slice(0, 70) || 'story'}.json`); }
    catch { setNotice('This story could not be exported. Export the saved data instead.'); }
  };
  return <div className="sa">
    <div className="sa-eyebrow">Celsius / Story Architect · Preview</div>
    <header className="sa-head"><div><h1>Build a world that pushes back.</h1><p className="sa-sub">One workspace for your hero’s choices, inner change, opposition, and the world that makes every decision matter.</p></div><span className={`sa-save ${store.saved ? '' : 'bad'}`} role="status"><CheckCircle2 size={13} />{store.saved ? 'Saved on this device' : 'Not saved to this device'}</span></header>
    {store.error && <section className="sa-warning" role="alert"><p>{store.error}</p><div className="sa-tools" style={{ border: 0, paddingBottom: 0 }}>
      <button className="sa-btn" onClick={backup}>Export unsaved story</button>
      <button className="sa-btn" onClick={() => { try { const raw = window.localStorage.getItem('celsius-story-architect-v1'); if (raw !== null) download(raw, 'celsius-saved-workspace-recovery.json'); else setNotice('No saved data is available in this browser.'); } catch { setNotice('Browser storage cannot be accessed. Export the unsaved story.'); } }}>Export saved data</button>
      <button className="sa-btn" onClick={() => { if (window.confirm('Reload the saved workspace and discard edits held only in this tab? Export those edits first.')) store.reload(); }}>Reload saved workspace</button>
      <button className="sa-btn" onClick={() => { if (window.confirm('Keep a recovery copy of the saved workspace, then replace it with the workspace currently shown?')) store.recover(); }}>Recover local saving</button>
    </div></section>}
    <div className="sa-tools">
      <select className="sa-project-select" aria-label="Current story" value={workspace.activeId} onChange={e => store.selectProject(e.target.value)}>{workspace.projects.map(p => <option value={p.id} key={p.id}>{p.title || 'Untitled story'}{p.sample ? ' · Study sample' : ''}</option>)}</select>
      <button className="sa-btn primary" disabled={full} onClick={() => store.addProject(makeProject())}><Plus size={14} />New story</button>
      <button className="sa-btn" disabled={full} onClick={() => store.addProject(makeSample())}><BookOpen size={14} />Explore a sample</button>
      <button className="sa-btn" disabled={full} onClick={() => fileInput.current?.click()}><Upload size={14} />Import JSON</button>
      <button className="sa-btn" onClick={backup}><Download size={14} />Export story</button>
      <Link className="sa-btn" to="/narrative-engine">Existing engine <ArrowRight size={14} /></Link>
      <input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={async e => {
        const file = e.target.files?.[0]; e.target.value = '';
        if (!file) return;
        if (file.size > MAX_IMPORT_BYTES) { setNotice('Choose a JSON export smaller than 5 MB.'); return; }
        try { prepare(await file.text()); } catch { setNotice('The file could not be read. No existing story was changed.'); }
      }} />
    </div>
    {full && <p className="sa-note" style={{ marginTop: 12 }}>The local workspace limit is 30 stories. Export backups before creating another workspace.</p>}
    {notice && <p className="sa-warning" role="alert" style={{ marginTop: 16 }}>{notice}</p>}
    {pending && <section className="sa-card" style={{ marginTop: 20 }} aria-labelledby="sa-import-title"><h2 id="sa-import-title">Review import: {pending.title}</h2><p className="sa-sub">{pending.beats.filter(hasOutline).length} outlined beats · {pending.worlds.length} world elements · {pending.legacyScenes.length} preserved legacy scenes. Imported as a new story; your existing projects and the original engine are unchanged. Legacy beat mappings are suggestions to review.</p><div className="sa-tools" style={{ border: 0, paddingBottom: 0 }}><button className="sa-btn primary" disabled={full} onClick={() => { store.addProject(pending); setPending(null); }}>Import as new story</button><button className="sa-btn" onClick={() => setPending(null)}>Cancel import</button></div></section>}
    <ProjectEditor key={project.id} project={project} onChange={store.updateProject} onLegacyImport={() => {
      try { const raw = window.localStorage.getItem('narrative-engine-data'); if (raw) prepare(raw); else setNotice('No existing engine draft was found on this device and domain. Export JSON from your existing engine, then import it here.'); }
      catch { setNotice('The existing engine’s local data could not be read. Export its JSON instead.'); }
    }} canImport={!full} />
    <footer className="sa-footer">The Hero’s Journey is an optional lens associated with Christopher Vogler’s adaptation of Joseph Campbell. These original prompts allow reordered, omitted, and custom beats; act boundaries are editable. <a href="https://reedsy.com/blog/guide/story-structure/heros-journey/" target="_blank" rel="noreferrer">Structure reference</a> · <Link to="/narrative-engine/guide">Existing Celsius guide</Link><br />This preview stores Story Architect projects in this browser only—not in cloud storage. Export regularly. It does not change your original engine drafts, characters, or established story canon.</footer>
  </div>;
}

function ProjectEditor({ project: p, onChange, onLegacyImport, canImport }: { project: Project; onChange: (p: Project) => void; onLegacyImport: () => void; canImport: boolean }) {
  const [tab, setTab] = useState<Tab>('journey');
  const [selected, setSelected] = useState(p.beats[0].id);
  const [worldId, setWorldId] = useState(p.worlds[0]?.id || '');
  const beat = p.beats.find(b => b.id === selected) || p.beats[0];
  const world = p.worlds.find(w => w.id === worldId) || p.worlds[0];
  const guide = JOURNEY.find(g => g.id === beat.template);
  const active = p.beats.filter(b => b.included);
  const outlined = active.filter(hasOutline).length;
  const signals = reviewProject(p);
  const patch = (values: Partial<Project>) => onChange({ ...p, ...values });
  const updateBeat = (values: Partial<Beat>) => patch({ beats: p.beats.map(b => b.id === beat.id ? { ...b, ...values } : b) });
  const updateWorld = (values: Partial<WorldEntry>) => patch({ worlds: p.worlds.map(w => w.id === world.id ? { ...w, ...values } : w) });
  const addWorld = () => { const w = makeWorld(); patch({ worlds: [...p.worlds, w] }); setWorldId(w.id); };
  const move = (delta: number) => {
    const index = p.beats.findIndex(b => b.id === beat.id);
    const target = index + delta;
    if (target < 0 || target >= p.beats.length) return;
    const beats = [...p.beats]; [beats[index], beats[target]] = [beats[target], beats[index]];
    patch({ beats });
  };
  return <>
    <nav className="sa-tabs" aria-label="Story Architect views">{([
      ['journey', 'Story journey', Compass, active.length], ['world', 'World atlas', Globe2, p.worlds.length], ['review', 'Review desk', ShieldCheck, signals.length],
    ] as const).map(([id, title, Icon, count]) => <button key={id} className={tab === id ? 'active' : ''} aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)}><Icon size={16} />{title}<span className="sa-count">{count}</span></button>)}</nav>
    {p.sample && <p className="sa-sample">Study sample: The Last Tide is original demonstration material, not part of your existing story canon.</p>}
    {tab === 'journey' && <div className="sa-layout">
      <nav className="sa-rail" aria-label="Story beats">{p.beats.map((b, i) => <Fragment key={b.id}>
        {(i === 0 || p.beats[i - 1].act !== b.act) && <p className="sa-act">Act {b.act} / {p.lens === 'journey' ? ACT_NAMES[b.act - 1] : 'Custom sequence'}</p>}
        <button className={`sa-step ${beat.id === b.id ? 'selected' : ''} ${b.included ? '' : 'excluded'}`} aria-current={beat.id === b.id ? 'step' : undefined} onClick={() => setSelected(b.id)}><span className="sa-num">{String(i + 1).padStart(2, '0')}</span><span className="sa-step-title">{b.title || 'Untitled beat'}</span>{hasOutline(b) && <span className="sa-dot" aria-label="Outline recorded" />}</button>
      </Fragment>)}<button className="sa-btn sa-add" style={{ marginTop: 18 }} disabled={p.beats.length >= 100} onClick={() => { const b = makeBeat(); patch({ beats: [...p.beats, b] }); setSelected(b.id); }}><Plus size={13} />Custom beat</button></nav>
      <div>
        <section className="sa-card">
          <div className="sa-meta"><span className="sa-badge">Act {beat.act}</span><span className="sa-eyebrow">{p.lens === 'journey' ? 'Hero’s Journey lens' : 'Freeform / three-act lens'}</span></div>
          <h2 style={{ marginTop: 14 }}>{beat.title || 'Untitled beat'}</h2>
          <p className="sa-sub">{p.lens === 'journey' ? guide?.purpose || 'Create a beat that serves this story.' : 'Keep what works. Change the order, act, or purpose without losing your notes.'}</p>
          <div className="sa-meta" style={{ marginTop: 15 }}><button className="sa-btn sa-icon" aria-label="Move beat earlier" disabled={p.beats[0].id === beat.id} onClick={() => move(-1)}><ArrowUp size={14} /></button><button className="sa-btn sa-icon" aria-label="Move beat later" disabled={p.beats[p.beats.length - 1].id === beat.id} onClick={() => move(1)}><ArrowDown size={14} /></button><label className="sa-check" style={{ margin: 0 }}><input type="checkbox" checked={beat.included} onChange={e => updateBeat({ included: e.target.checked })} />Include this beat</label></div>
          {!beat.included && <p className="sa-callout">This beat is omitted from progress and review. Its notes remain saved.</p>}
          <div className="sa-grid2"><Field label="Beat title" value={beat.title} multiline={false} onChange={title => updateBeat({ title })} /><label className="sa-field"><span>Act placement</span><select value={beat.act} onChange={e => updateBeat({ act: Number(e.target.value) })}><option value={1}>Act I</option><option value={2}>Act II</option><option value={3}>Act III</option></select></label></div>
          {p.lens === 'journey' && guide && <div className="sa-guide"><div className="sa-eyebrow">A useful challenge</div><p className="sa-note" style={{ marginTop: 7 }}>{guide.trap}</p></div>}
          <Axis name="A / External drive" tone="a"><Field label="What happens?" value={beat.plot} onChange={plot => updateBeat({ plot })} placeholder={guide?.plot || 'The event, goal, obstacle, and outcome.'} /></Axis>
          <Axis name="B / Internal resistance" tone="b"><Field label="What shifts inside the protagonist?" value={beat.internal} onChange={internal => updateBeat({ internal })} placeholder={guide?.inner || 'A belief is tested, changed, or deliberately defended.'} /></Axis>
          <Axis name="C / Opposition intelligence" tone="c"><Field label="How does the opposition respond?" value={beat.opposition} onChange={opposition => updateBeat({ opposition })} placeholder="What does the opposing person, institution, or force want—and do next?" /></Axis>
          <Axis name="World / Rules and consequences" tone="w"><Field label="What makes this beat belong to this world?" value={beat.world} onChange={world => updateBeat({ world })} placeholder={guide?.world || 'Name the rule, environment, or institution that changes the choice.'} />
            {p.worlds.length ? <fieldset style={{ marginTop: 14 }}><legend className="sa-note">Link world elements</legend>{p.worlds.map(w => <label className="sa-check" key={w.id}><input type="checkbox" checked={beat.worldIds.includes(w.id)} onChange={e => updateBeat({ worldIds: e.target.checked ? [...beat.worldIds, w.id] : beat.worldIds.filter(id => id !== w.id) })} />{w.name || 'Untitled element'} <span className="sa-count">{w.status}</span></label>)}</fieldset> : <button className="sa-btn" style={{ marginTop: 12 }} onClick={() => setTab('world')}><Plus size={13} />Build your first world element</button>}
            {beat.worldIds.some(id => !p.worlds.some(w => w.id === id)) && <button className="sa-btn" style={{ marginTop: 10 }} onClick={() => updateBeat({ worldIds: beat.worldIds.filter(id => p.worlds.some(w => w.id === id)) })}>Remove missing world references</button>}
          </Axis>
        </section>
        <section className="sa-card"><h3>The causal chain</h3><p className="sa-sub">Because something happened, someone chooses—and the situation changes.</p><Field label="Because of the previous beat…" value={beat.because} onChange={because => updateBeat({ because })} placeholder="Why does this follow? For nonlinear stories, record the intended contrast or connection." /><div className="sa-grid2"><Field label="The protagonist chooses…" value={beat.decision} onChange={decision => updateBeat({ decision })} placeholder="Record a decision, including a deliberate refusal to act." /><Field label="Therefore / the cost is…" value={beat.consequence} onChange={consequence => updateBeat({ consequence })} placeholder="What can no longer stay the same?" /></div>
          <label className="sa-field"><span>Dramatic pressure · {beat.pressure === null ? 'Not rated' : `${beat.pressure} / 100`}</span><input className="sa-range" type="range" min="0" max="100" value={beat.pressure ?? 0} onChange={e => updateBeat({ pressure: Number(e.target.value) })} /><small>Your estimate—not an automated quality score.</small></label>{beat.pressure !== null && <button className="sa-btn" style={{ marginTop: 8 }} onClick={() => updateBeat({ pressure: null })}>Clear estimate</button>}
          <div className="sa-bottom-nav"><button className="sa-btn" disabled={p.beats[0].id === beat.id} onClick={() => setSelected(p.beats[p.beats.findIndex(b => b.id === beat.id) - 1].id)}><ArrowLeft size={14} />Previous beat</button><button className="sa-btn primary" disabled={p.beats[p.beats.length - 1].id === beat.id} onClick={() => setSelected(p.beats[p.beats.findIndex(b => b.id === beat.id) + 1].id)}>Next beat<ArrowRight size={14} /></button></div>
        </section>
      </div>
      <aside className="sa-aside"><section className="sa-card"><div className="sa-eyebrow">Your story at a glance</div><div className="sa-stats"><div><b>{outlined}<span> / {active.length}</span></b><span>included beats outlined</span></div><div><b>{p.worlds.length}</b><span>world elements</span></div></div><div className="sa-meter" role="progressbar" aria-label="Included beats with an external outline" aria-valuenow={outlined} aria-valuemin={0} aria-valuemax={active.length || 1}><div style={{ width: `${active.length ? outlined / active.length * 100 : 0}%` }} /></div><p className="sa-note">This measures recorded outlines, not story quality.</p><PressureCurve beats={p.beats} /><p className="sa-note">Pressure curve · your estimates</p></section>
        <section className="sa-card"><h3>Story foundation</h3><Field label="Working title" value={p.title} multiline={false} onChange={title => patch({ title })} /><Field label="Premise" value={p.premise} onChange={premise => patch({ premise })} placeholder="Someone wants something, but something stands in the way." /><Field label="Protagonist" value={p.protagonist} multiline={false} onChange={protagonist => patch({ protagonist })} /><Field label="External want" value={p.want} onChange={want => patch({ want })} /><Field label="Starting belief" value={p.belief} onChange={belief => patch({ belief })} /><Field label="Need / belief under test" value={p.need} onChange={need => patch({ need })} /><label className="sa-field"><span>Character arc</span><select value={p.arc} onChange={e => patch({ arc: e.target.value as Project['arc'] })}><option value="growth">Growth / transformation</option><option value="fall">Fall / tragic decline</option><option value="steadfast">Steadfast / flat arc</option><option value="open">Open / unresolved</option></select></label><Field label="Opposition" value={p.antagonist} multiline={false} onChange={antagonist => patch({ antagonist })} /><Field label="Opposition goal" value={p.oppositionGoal} onChange={oppositionGoal => patch({ oppositionGoal })} /><Field label="Thematic question / proposition" value={p.theme} onChange={theme => patch({ theme })} /><label className="sa-field"><span>Structure lens</span><select aria-label="Structure lens" value={p.lens} onChange={e => patch({ lens: e.target.value as Project['lens'] })}><option value="journey">Hero’s Journey</option><option value="freeform">Freeform / three-act</option></select><small>Switching never deletes your notes.</small></label></section>
        <section className="sa-card"><h3>Bring your existing work</h3><p className="sa-sub">Copy the narrative fields currently saved by the original engine on this domain. This does not import its separately stored scenes.</p><button className="sa-btn" style={{ marginTop: 16 }} disabled={!canImport} onClick={onLegacyImport}><Layers3 size={14} />Import engine fields</button><p className="sa-note" style={{ marginTop: 12 }}>{Object.keys(p.legacyFields).length} original fields and {p.legacyScenes.length} legacy scenes preserved in this story’s JSON backup. Legacy scenes are not editable in this preview.</p></section>
      </aside>
    </div>}
    {tab === 'world' && <div className="sa-worlds"><aside><div className="sa-eyebrow">The world, with consequences</div><p className="sa-sub">A place, a rule, a cost. Then put it in the hero’s way.</p><button className="sa-btn primary" disabled={p.worlds.length >= 200} style={{ marginTop: 18 }} onClick={addWorld}><Plus size={14} />Add world element</button>{p.worlds.map(w => <button key={w.id} className={`sa-world-button ${world?.id === w.id ? 'selected' : ''}`} onClick={() => setWorldId(w.id)} aria-current={world?.id === w.id ? 'true' : undefined}>{w.name || 'Untitled element'}<small>{w.kind} · {w.status} · {active.filter(b => b.worldIds.includes(w.id)).length} linked beats</small></button>)}</aside>
      {world ? <section className="sa-card"><div className="sa-meta"><span className="sa-badge">{world.kind}</span><span className="sa-note">{world.status === 'approved' ? 'Author-approved canon' : 'Draft / not established canon'}</span></div><h2 style={{ marginTop: 15 }}>{world.name || 'Untitled element'}</h2><div className="sa-grid2"><Field label="Element name" value={world.name} multiline={false} onChange={name => updateWorld({ name })} /><label className="sa-field"><span>Element type</span><select value={world.kind} onChange={e => updateWorld({ kind: e.target.value as WorldEntry['kind'] })}>{WORLD_KINDS.map(k => <option key={k}>{k}</option>)}</select></label></div><Field label="Description / what the audience encounters" value={world.description} onChange={description => updateWorld({ description })} /><Field label="Rule / what this makes possible or impossible" value={world.rule} onChange={rule => updateWorld({ rule })} placeholder="Who has access, what is limited, and what cannot happen?" /><div className="sa-grid2"><Field label="Cost / who pays" value={world.cost} onChange={cost => updateWorld({ cost })} placeholder="Power, survival, privilege, or knowledge should have consequences." /><Field label="Established exceptions / their limits" value={world.exception} onChange={exception => updateWorld({ exception })} placeholder="Record exceptions before relying on them to resolve a conflict." /></div><label className="sa-check"><input type="checkbox" checked={world.status === 'approved'} onChange={e => updateWorld({ status: e.target.checked ? 'approved' : 'draft' })} />I approve this as canon for this story</label><div className="sa-callout">Approval is your editorial decision. The review desk checks recorded links and missing fields; it does not automatically prove that prose obeys these rules.</div><h3 style={{ marginTop: 24 }}>Used in the story</h3>{p.beats.filter(b => b.worldIds.includes(world.id)).map(b => <button className="sa-btn" style={{ margin: '10px 8px 0 0' }} key={b.id} onClick={() => { setSelected(b.id); setTab('journey'); }}>{b.title}{b.included ? '' : ' · omitted'}<ArrowRight size={13} /></button>)}{!p.beats.some(b => b.worldIds.includes(world.id)) && <p className="sa-sub">No linked beats yet. Link this element from any beat in Story journey.</p>}<button className="sa-btn" style={{ marginTop: 28 }} onClick={() => { if (window.confirm(`Remove “${world.name}” and its beat links? Export a backup first; this cannot be undone here.`)) { patch({ worlds: p.worlds.filter(w => w.id !== world.id), beats: p.beats.map(b => ({ ...b, worldIds: b.worldIds.filter(id => id !== world.id) })) }); setWorldId(''); } }}><Trash2 size={13} />Remove world element</button></section> : <section className="sa-empty"><Globe2 size={32} style={{ margin: '0 auto 15px', color: 'hsl(var(--accent))' }} /><h2>Make the setting matter.</h2><p className="sa-sub" style={{ margin: '12px auto 0' }}>Start with one place, faction, or law. Define its cost, then connect it to a character’s decision.</p><button className="sa-btn primary" onClick={addWorld}>Create a world element</button></section>}
    </div>}
    {tab === 'review' && <section className="sa-preview"><div className="sa-card"><div className="sa-eyebrow">Editorial questions, not a verdict</div><h2 style={{ marginTop: 12 }}>Does each choice leave a mark?</h2><p className="sa-sub">These are transparent, rule-based checks of your notes and links—not AI analysis or a quality score. Quiet scenes, withheld choices, and nonlinear connections can all be intentional. Unwritten and omitted beats are not judged.</p><div className="sa-stats"><div><b>{signals.filter(s => s.level === 'question').length}</b><span>questions to consider</span></div><div><b>{signals.filter(s => s.level === 'check').length}</b><span>record checks</span></div></div></div>{signals.length === 0 ? <div className="sa-callout">No checks were triggered by the currently recorded content. This is not a certification of completeness or continuity.</div> : signals.map(s => <button className="sa-signal" key={s.id} onClick={() => { if (s.beatId) { setSelected(s.beatId); setTab('journey'); } else if (s.worldId) { setWorldId(s.worldId); setTab('world'); } }}><HelpCircle size={18} /><div><strong>{s.title}</strong><p>{s.detail}</p><span className="sa-eyebrow" style={{ display: 'block', marginTop: 10 }}>Open {s.beatId ? 'beat' : 'world element'} →</span></div></button>)}</section>}
  </>;
}
