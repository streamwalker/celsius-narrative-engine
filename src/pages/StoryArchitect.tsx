import { useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, ArrowUpRight, BookOpen, Check, ChevronRight, Compass, Copy, Download, FileText, Flag, Globe2, Layers, Plus, ShieldCheck, Sparkles, Trash2, Upload, Workflow } from 'lucide-react';
import { toast } from 'sonner';
import { DNA, GUIDE_SOURCE, LANES, STAGES, STRUCTURES, WORLD_KINDS, type Structure } from '@/lib/architect/templates';
import { beatCoverage, coverage, deleteBeat, deleteWorld, duplicateProject, importProject, MAX_IMPORT_BYTES, moveBeat, newBeat, newProject, newScene, newWorld, parseWorkspace, reviewProject, sampleProject, serializeProject, storyBrief, uid, type Beat, type Project, type World } from '@/lib/architect/model';
import { useWorkspace } from '@/lib/architect/useWorkspace';
import '@/components/architect/architect.css';

type Tab = 'story' | 'journey' | 'world' | 'scenes' | 'review';
const TABS = [{ id: 'story', label: 'Story DNA', icon: Compass }, { id: 'journey', label: 'Journey', icon: Workflow }, { id: 'world', label: 'World bible', icon: Globe2 }, { id: 'scenes', label: 'Scenes', icon: Layers }, { id: 'review', label: 'Review', icon: ShieldCheck }] as const;
function download(text: string, filename: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function Field({ label, value, onChange, hint, small = false }: { label: string; value: string; onChange: (v: string) => void; hint?: string; small?: boolean }) {
  return <label className="sa-field"><span>{label}</span>{small ? <input aria-label={label} maxLength={100000} value={value} onChange={e => onChange(e.target.value)} placeholder={hint} /> : <textarea aria-label={label} maxLength={100000} value={value} onChange={e => onChange(e.target.value)} placeholder={hint} rows={3} />}</label>;
}
function Empty({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return <div className="sa-empty">{icon}<h3>{title}</h3><div>{children}</div></div>;
}

export default function StoryArchitect() {
  const { workspace, setWorkspace, error, savedAt, recoveryRaw } = useWorkspace();
  const p = workspace.projects.find(p => p.id === workspace.activeId) || workspace.projects[0];
  const [tab, setTab] = useState<Tab>('story');
  const [beatId, setBeatId] = useState('');
  const [worldId, setWorldId] = useState('');
  const [search, setSearch] = useState('');
  const [structure, setStructure] = useState<Structure>('hero');
  const fileInput = useRef<HTMLInputElement>(null);
  const beat = p.beats.find(b => b.id === beatId) || p.beats[0];
  const world = p.worlds.find(w => w.id === worldId) || p.worlds[0];
  const stats = coverage(p), checks = reviewProject(p);
  const filename = (p.title || 'untitled').replace(/[^a-z0-9_-]+/gi, '-').slice(0, 60);
  const update = (change: (p: Project) => Project) => setWorkspace(w => ({ ...w, projects: w.projects.map(v => v.id === p.id ? { ...change(v), updatedAt: new Date().toISOString() } : v) }));
  const updateFields = (key: string, value: string) => update(p => ({ ...p, fields: { ...p.fields, [key]: value } }));
  const editBeat = (change: Partial<Beat>) => beat && update(p => ({ ...p, beats: p.beats.map(b => b.id === beat.id ? { ...b, ...change } : b) }));
  const editWorld = (change: Partial<World>) => world && update(p => ({ ...p, worlds: p.worlds.map(w => w.id === world.id ? { ...w, ...change } : w) }));
  const addProjects = (projects: Project[]) => {
    if (workspace.projects.length + projects.length > 100) { toast.error('This local workspace supports up to 100 projects.'); return false; }
    setWorkspace(w => ({ ...w, activeId: projects[0].id, projects: [...w.projects, ...projects] }));
    setBeatId(''); setWorldId(''); setSearch(''); setTab('story');
    return true;
  };
  const addBeat = () => {
    if (p.beats.length >= 250) { toast.error('Maximum 250 beats per project.'); return; }
    const b = newBeat('New beat', beat?.act || 1); update(p => ({ ...p, beats: [...p.beats, b] })); setBeatId(b.id); setTab('journey');
  };
  const addWorld = () => {
    if (p.worlds.length >= 500) { toast.error('Maximum 500 world entries per project.'); return; }
    const w = newWorld(); update(p => ({ ...p, worlds: [...p.worlds, w] })); setWorldId(w.id); setSearch(''); setTab('world');
  };
  const addScene = (fromBeat?: Beat) => {
    if (p.scenes.length >= 2500) { toast.error('Maximum 2,500 scenes per project.'); return; }
    const s = newScene(fromBeat); s.data.sceneNumber = p.scenes.length + 1;
    update(p => ({ ...p, scenes: [...p.scenes, s] })); setTab('scenes'); toast.success('Editable scene created from your notes. No AI was used.');
  };
  const loadImport = async (file?: File) => {
    if (!file) return;
    try {
      if (file.size > MAX_IMPORT_BYTES) throw new Error('Please import a JSON file smaller than 5 MB.');
      const raw = await file.text();
      const maybe = JSON.parse(raw);
      if (maybe && maybe.version === 1 && Array.isArray(maybe.projects)) {
        const loaded = parseWorkspace(raw);
        if (!addProjects(loaded.projects.map(p => ({ ...p, id: uid(), updatedAt: new Date().toISOString() })) )) return;
      } else if (!addProjects([importProject(raw)])) return;
      toast.success('Imported as a new project. Existing projects were not replaced.');
    } catch (e) { toast.error(`Import rejected: ${e instanceof Error ? e.message : 'invalid file'}`); }
    finally { if (fileInput.current) fileInput.current.value = ''; }
  };
  const copyLegacy = () => {
    try {
      const raw = localStorage.getItem('narrative-engine-data');
      if (!raw) throw new Error('No Narrative Engine draft is cached in this browser.');
      if (!addProjects([importProject(raw)])) return;
      toast.success('Copied the locally cached story fields. Project-specific scene caches were not guessed or copied.');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Could not copy the draft.'); }
  };
  const exportProject = () => { try { download(serializeProject(p), `${filename}.celsius.json`); } catch { toast.error('Unable to validate project. Use the workspace recovery export.'); } };
  const guidance = beat && STAGES.find(s => s[0] === beat.stageId);
  const jump = (target: string, id?: string) => { setTab(target as Tab); if (target === 'journey') setBeatId(id || ''); if (target === 'world') { setSearch(''); setWorldId(id || ''); } };

  return <div className="story-architect">
    <header className="sa-topbar">
      <div className="sa-breadcrumb"><span>C°</span> CELSIUS <ChevronRight size={14} /> STORY ARCHITECT <span className="sa-preview">PREVIEW</span></div>
      <div className="sa-save" role="status"><span className={error ? 'sa-status-warning' : 'sa-status-ok'} />{error ? 'Saving paused' : `Saved locally${savedAt ? ` · ${savedAt}` : ''}`}</div>
    </header>
    {error && <div className="sa-alert" role="alert"><strong>Protect your work.</strong> {error}<div className="sa-actions"><button onClick={() => download(JSON.stringify(workspace, null, 2), 'celsius-workspace-recovery.json')}>Export workspace</button>{recoveryRaw && <button onClick={() => download(recoveryRaw, 'celsius-original-storage.json')}>Download original storage</button>}<button onClick={() => window.location.reload()}>Reload saved version</button></div></div>}
    <div className="sa-content"><h1 className="sr-only">Celsius Story Architect</h1>
      <div className="sa-projectbar"><label className="sa-select-label">PROJECT<select value={p.id} onChange={e => { setWorkspace(w => ({ ...w, activeId: e.target.value })); setBeatId(''); setWorldId(''); setSearch(''); }}>{workspace.projects.map(v => <option key={v.id} value={v.id}>{v.title || 'Untitled story'}{v.sample ? ' · sample' : ''}</option>)}</select></label>
        <div className="sa-actions"><label className="sa-select-label sa-inline-label"><span>New project structure</span><select aria-label="New project structure" value={structure} onChange={e => setStructure(e.target.value as Structure)}>{Object.entries(STRUCTURES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label><button onClick={() => addProjects([newProject(structure)])}><Plus size={15} /> New</button><button onClick={() => addProjects([duplicateProject(p)])}><Copy size={15} /> Branch</button><button onClick={() => fileInput.current?.click()}><Upload size={15} /> Import</button><button className="sa-primary" onClick={exportProject}><Download size={15} /> Backup</button><input hidden ref={fileInput} type="file" accept=".json,application/json" aria-label="Import Celsius JSON" onChange={e => void loadImport(e.target.files?.[0])} /></div>
      </div>
      <section className="sa-hero">
        <div><p className="sa-eyebrow">A STORY IS A WORLD UNDER PRESSURE</p><label className="sa-title-label"><span className="sr-only">Project title</span><input aria-label="Project title" maxLength={180} value={p.title} onChange={e => update(p => ({ ...p, title: e.target.value, fields: { ...p.fields, project_title: e.target.value } }))} placeholder="Name your story" /></label><p className="sa-subtitle">Connect what happens, who changes, and what the world makes possible.</p><div className="sa-chips"><span>{STRUCTURES[p.structure]}</span><span>Author-controlled canon</span><span>Local-first preview</span></div></div>
        <div className="sa-orbit" aria-hidden="true"><div className="sa-orbit-ring" /><div className="sa-orbit-core">C°</div>{['A', 'B', 'C', 'W'].map((v, i) => <span key={v} className={`sa-orbit-node sa-node-${i}`}>{v}</span>)}</div>
      </section>
      {p.sample && <div className="sa-sample"><Sparkles size={15} /> Illustrative sample: “The Last Tide.” This is not canon for any of your existing stories.</div>}
      <div className="sa-metrics"><div><strong>{stats.written}<small> / {stats.total}</small></strong><span>Beats with notes</span></div><div><strong>{p.worlds.filter(w => w.status === 'canon').length}</strong><span>Author-approved world entries</span></div><div><strong>{p.scenes.length}</strong><span>Scene cards</span></div><div><strong>{checks.length}</strong><span>Planning prompts to review</span></div></div>
      <nav className="sa-tabs" aria-label="Story workspace">{TABS.map(t => <button key={t.id} aria-current={tab === t.id ? 'page' : undefined} className={tab === t.id ? 'is-active' : ''} onClick={() => setTab(t.id)}><t.icon size={17} />{t.label}{t.id === 'review' && checks.length > 0 && <span>{checks.length}</span>}</button>)}</nav>

      {tab === 'story' && <section className="sa-foundation"><div className="sa-sectionhead"><div><p className="sa-eyebrow">01 / STORY FOUNDATION</p><h2>Give the conflict a human reason.</h2><p>Keep your Triad. Make the world part of the argument.</p></div><button onClick={() => download(storyBrief(p), `${filename}-brief.md`, 'text/markdown')}><FileText size={16} /> Export brief</button></div><div className="sa-dna-grid">{DNA.map(([key, label, hint]) => <Field key={key} label={label} value={p.fields[key] || ''} onChange={v => updateFields(key, v)} hint={hint} small={key === 'protag_name' || key === 'antag_name'} />)}</div><div className="sa-next"><div><strong>Your structure is a lens, not a law.</strong><p>Start wherever the idea is strongest. Flat arcs, tragedies, ensemble stories, and deliberate omissions are valid choices.</p></div><button className="sa-primary" onClick={() => setTab('journey')}>Build the journey <ArrowUpRight size={16} /></button></div><div className="sa-bridge"><h3>Bring your existing Celsius work with you.</h3><p>Import a legacy JSON export or a story_projects row. The local-draft copy reads story fields only and leaves the original engine untouched. Scene data can only be restored when it is present in the imported file.</p><div className="sa-actions"><button onClick={copyLegacy}>Copy local engine draft</button><button onClick={() => addProjects([sampleProject()])}>Open an independent sample</button><Link to="/narrative-engine">Existing Narrative Engine <ArrowUpRight size={14} /></Link></div></div></section>}

      {tab === 'journey' && <section><div className="sa-sectionhead"><div><p className="sa-eyebrow">02 / CAUSE & CONSEQUENCE</p><h2>Every turning point has a price.</h2><p>Edit, reorder, or omit stages. “Reviewed” is your decision, not an AI verdict.</p></div><button onClick={addBeat}><Plus size={16} /> Add beat</button></div><div className="sa-split"><aside className="sa-beatlist" aria-label="Journey beats">{p.beats.map((b, i) => <button key={b.id} className={`${beat?.id === b.id ? 'is-active' : ''} ${b.status === 'omitted' ? 'is-omitted' : ''}`} onClick={() => setBeatId(b.id)}><span className="sa-beatnum">{String(i + 1).padStart(2, '0')}</span><span><strong>{b.title || 'Untitled beat'}</strong><small>Act {b.act} · {b.status === 'omitted' ? 'Omitted' : `${beatCoverage(b)}/6 lanes noted`}</small></span>{b.status === 'reviewed' && <Check size={14} />}</button>)}</aside>
        {beat ? <article className="sa-editor"><div className="sa-editorhead"><span className="sa-eyebrow">BEAT {p.beats.indexOf(beat) + 1} / {p.beats.length}</span><div className="sa-actions"><button aria-label="Move beat earlier" disabled={p.beats.indexOf(beat) === 0} onClick={() => update(p => moveBeat(p, beat.id, -1))}><ArrowUp size={15} /></button><button aria-label="Move beat later" disabled={p.beats.indexOf(beat) === p.beats.length - 1} onClick={() => update(p => moveBeat(p, beat.id, 1))}><ArrowDown size={15} /></button><button aria-label="Delete selected beat" onClick={() => { if (confirm('Delete this beat? Linked scenes will be kept and unlinked. Export a backup first when needed.')) { update(p => deleteBeat(p, beat.id)); setBeatId(''); } }}><Trash2 size={15} /></button></div></div><Field label="Beat title" value={beat.title} onChange={v => editBeat({ title: v })} small /><div className="sa-two"><label className="sa-field"><span>Act</span><select value={beat.act} onChange={e => editBeat({ act: Number(e.target.value) as 1 | 2 | 3 })}><option value={1}>I · Departure / setup</option><option value={2}>II · Initiation / confrontation</option><option value={3}>III · Return / resolution</option></select></label><label className="sa-field"><span>Author’s status</span><select value={beat.status} onChange={e => editBeat({ status: e.target.value as Beat['status'] })}><option value="draft">Draft</option><option value="reviewed">Reviewed by author</option><option value="omitted">Deliberately omitted</option></select></label></div>
          {guidance && <details className="sa-guide" open><summary><BookOpen size={15} /> Craft guidance · {guidance[1]}</summary><p>{guidance[3]}</p><p><strong>World-building:</strong> {guidance[4]}</p><p className="sa-muted">{guidance[5]}</p></details>}
          <div className="sa-lanes">{LANES.map(l => <div className={`sa-lane sa-lane-${l.key}`} key={l.key}><span className="sa-lane-axis">{l.axis}</span><Field label={l.label} value={beat[l.key]} onChange={v => editBeat({ [l.key]: v })} hint={l.prompt} /></div>)}</div>
          <div className="sa-rulelinks"><h3>World rules in play</h3>{p.worlds.length === 0 ? <p>No world entries yet. <button className="sa-textbutton" onClick={addWorld}>Create one</button> to link the setting to this choice.</p> : p.worlds.map(w => <label key={w.id}><input type="checkbox" checked={beat.ruleIds.includes(w.id)} onChange={e => editBeat({ ruleIds: e.target.checked ? [...beat.ruleIds, w.id] : beat.ruleIds.filter(id => id !== w.id) })} /><span>{w.title || 'Untitled entry'} <small>· {w.status}</small></span></label>)}</div><div className="sa-actions"><button className="sa-primary" onClick={() => addScene(beat)}><Layers size={16} /> Create scene from notes</button><span className="sa-muted">Copies your notes; does not generate new canon.</span></div></article> : <Empty icon={<Workflow size={32} />} title="Give your story its first turning point."><p>A freeform project starts without prescribed stages.</p><button className="sa-primary" onClick={addBeat}>Add a beat</button></Empty>}
      </div><p className="sa-attribution">The twelve-stage template draws on Christopher Vogler’s adaptation of Joseph Campbell. Stage prompts are original; this workspace’s act grouping is editable. <a href={GUIDE_SOURCE} target="_blank" rel="noreferrer">Framework reference <ArrowUpRight size={12} /></a></p></section>}

      {tab === 'world' && <section><div className="sa-sectionhead"><div><p className="sa-eyebrow">03 / WORLD BIBLE</p><h2>A setting that pushes back.</h2><p>Define what is possible, who controls it, and what it costs.</p></div><button className="sa-primary" onClick={addWorld}><Plus size={16} /> New world entry</button></div><div className="sa-split"><aside className="sa-worldlist"><label className="sa-field"><span>Find a world entry</span><input type="search" placeholder="Search names and descriptions…" value={search} onChange={e => setSearch(e.target.value)} /></label>{p.worlds.filter(w => `${w.title} ${w.description} ${w.kind}`.toLowerCase().includes(search.toLowerCase())).map(w => <button key={w.id} className={world?.id === w.id ? 'is-active' : ''} onClick={() => setWorldId(w.id)}><Globe2 size={18} /><span><strong>{w.title || 'Untitled entry'}</strong><small>{w.kind} · {w.status}</small></span></button>)}</aside>{world ? <article className="sa-editor"><div className="sa-editorhead"><span className={`sa-badge sa-${world.status}`}>{world.status === 'canon' ? 'AUTHOR-APPROVED CANON' : world.status.toUpperCase()}</span><button aria-label="Delete world entry" onClick={() => { if (confirm('Delete this entry and remove its beat links? Your scenes will not be deleted.')) { update(p => deleteWorld(p, world.id)); setWorldId(''); } }}><Trash2 size={15} /></button></div><Field label="Entry title" value={world.title} onChange={v => editWorld({ title: v })} small /><div className="sa-two"><label className="sa-field"><span>Category</span><select value={world.kind} onChange={e => editWorld({ kind: e.target.value as World['kind'] })}>{WORLD_KINDS.map(k => <option key={k}>{k}</option>)}</select></label><label className="sa-field"><span>Knowledge status</span><select value={world.status} onChange={e => editWorld({ status: e.target.value as World['status'] })}><option value="draft">Draft · not established</option><option value="canon">Canon · author approved</option><option value="rumor">Rumor · an in-world belief</option></select></label></div><Field label="Rule, fact, or claim" value={world.description} onChange={v => editWorld({ description: v })} hint="State what exists or what people believe. Be specific about scope." /><div className="sa-two"><Field label="Limits & exceptions" value={world.limits} onChange={v => editWorld({ limits: v })} hint="What cannot happen? When does the rule stop applying?" /><Field label="Cost & consequences" value={world.cost} onChange={v => editWorld({ cost: v })} hint="Who pays, what is consumed, and who has access?" /></div><Field label="Source & scope" value={world.source} onChange={v => editWorld({ source: v })} hint="Author note, chapter, era, location, or unreliable narrator…" /><div className="sa-rulelinks"><h3>Used in these beats</h3>{p.beats.filter(b => b.ruleIds.includes(world.id)).length === 0 ? <p>This entry is not linked to a beat yet. That is fine for background lore.</p> : p.beats.filter(b => b.ruleIds.includes(world.id)).map(b => <button key={b.id} onClick={() => jump('journey', b.id)}>{b.title} <ArrowUpRight size={14} /></button>)}</div></article> : <Empty icon={<Globe2 size={36} />} title="Build the rules before breaking them."><p>Add geography, factions, culture, history, magic, or technology. Keep rumors separate from established facts.</p><button onClick={addWorld}>Create a world entry</button></Empty>}</div></section>}

      {tab === 'scenes' && <section><div className="sa-sectionhead"><div><p className="sa-eyebrow">04 / SCENE WORKSHOP</p><h2>From turning point to playable moment.</h2><p>Scene cards preserve imported payloads. Their titles, summaries, and purposes are editable here.</p></div><button className="sa-primary" onClick={() => addScene()}><Plus size={16} /> New scene</button></div>{p.scenes.length ? <div className="sa-scenegrid">{p.scenes.map((s, i) => <article className="sa-scenecard" key={s.id}><div className="sa-editorhead"><span className="sa-eyebrow">SCENE {String(i + 1).padStart(2, '0')}</span><button aria-label={`Delete scene ${i + 1}`} onClick={() => { if (confirm('Delete this scene card? The source engine and the original import remain unchanged.')) update(p => ({ ...p, scenes: p.scenes.filter(v => v.id !== s.id) })); }}><Trash2 size={14} /></button></div>{(['title', 'summary', 'purpose'] as const).map(key => <Field key={key} label={`Scene ${key}`} value={s.data[key] || ''} small={key === 'title'} onChange={value => update(p => ({ ...p, scenes: p.scenes.map(v => v.id === s.id ? { ...v, data: { ...v.data, [key]: value } } : v) }))} />)}<label className="sa-field"><span>Linked beat</span><select value={s.beatId} onChange={e => update(p => ({ ...p, scenes: p.scenes.map(v => v.id === s.id ? { ...v, beatId: e.target.value } : v) }))}><option value="">Unlinked / standalone</option>{s.beatId && !p.beats.some(b => b.id === s.beatId) && <option value={s.beatId}>Missing beat — choose another</option>}{p.beats.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}</select></label><small className="sa-muted">{Object.keys(s.data).length} scene fields preserved in JSON backup.</small></article>)}</div> : <Empty icon={<Layers size={36} />} title="Make the outline tangible."><p>Create a scene from a journey beat, write one manually, or import an existing Celsius file containing scene data.</p><button onClick={() => setTab('journey')}>Go to the journey</button></Empty>}</section>}

      {tab === 'review' && <section><div className="sa-sectionhead"><div><p className="sa-eyebrow">05 / AUTHOR’S REVIEW</p><h2>Questions worth asking. Not a score to chase.</h2><p>These are transparent, local planning checks. They do not read narrative meaning or prove continuity.</p></div><button onClick={() => download(storyBrief(p), `${filename}-brief.md`, 'text/markdown')}><Download size={16} /> Export brief</button></div><div className="sa-review-note"><ShieldCheck size={25} /><div><strong>You approve the canon.</strong><p>Checks look for missing fields, broken references, provisional world knowledge, and differently worded canon entries with matching titles. Zero prompts does not mean the story is correct, complete, or good.</p></div></div>{checks.length ? <div className="sa-checklist">{checks.map(c => <button key={c.id} onClick={() => jump(c.target, c.targetId)}><Flag size={18} /><span><strong>{c.title}</strong><small>{c.detail}</small></span><ArrowUpRight size={17} /></button>)}</div> : <Empty icon={<Check size={34} />} title="No issues found by these limited checks."><p>Review motivation, causality, pacing, thematic intent, and exceptions yourself. Automated semantic continuity review is not included in this preview.</p></Empty>}<div className="sa-next"><div><strong>Keep the production engine in reach.</strong><p>Existing AI analysis, Panelcraft, character tools, and cloud projects remain in their original workspaces. This preview does not silently rewrite or sync them.</p></div><Link className="sa-button" to="/narrative-engine">Open Narrative Engine <ArrowUpRight size={16} /></Link></div></section>}
      <footer className="sa-footer"><span>CELSIUS / STORY ARCHITECT</span><p>Saved in this browser, not your Celsius cloud account. Export JSON backups regularly. Imported drafts and sample ideas do not become canon automatically.</p><Link to="/narrative-engine/guide">Original engine guide <ArrowUpRight size={13} /></Link></footer>
    </div>
  </div>;
}
