'use client'

import { useMemo, useState } from 'react'
import { CalendarDays, ChevronDown, CircleHelp, FileText, Filter, Folder, Inbox, Link2, List, MoreHorizontal, Plus, Search, Settings, Sparkles, Target, Check, Zap } from 'lucide-react'
import './styles.css'

type Item = { id: number; title: string; kind: 'Task' | 'Note' | 'Link'; list: string; due: string; done?: boolean }

const starterItems: Item[] = [
  { id: 1, title: 'Review Q4 campaign brief', kind: 'Task', list: 'Marketing', due: 'Today' },
  { id: 2, title: 'Ideas for launch messaging', kind: 'Note', list: 'Personal', due: 'Tomorrow' },
  { id: 3, title: 'ClickUp workspace reference', kind: 'Link', list: 'Work', due: 'Oct 21' },
]

const iconFor = (kind: Item['kind']) => kind === 'Task' ? Check : kind === 'Note' ? FileText : Link2

export default function Home() {
  const [items, setItems] = useState(starterItems)
  const [query, setQuery] = useState('')
  const [activeType, setActiveType] = useState<Item['kind'] | 'All'>('All')
  const [selectedId, setSelectedId] = useState(1)

  const filtered = useMemo(() => items.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()) && (activeType === 'All' || item.kind === activeType)), [items, query, activeType])
  const addItem = (kind: Item['kind'] = 'Task') => {
    const next = { id: Date.now(), title: `New ${kind.toLowerCase()}`, kind, list: 'Personal', due: 'Today' }
    setItems((current) => [...current, next])
    setSelectedId(next.id)
  }
  const toggleItem = (id: number) => setItems((current) => current.map((item) => item.id === id ? { ...item, done: !item.done } : item))

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Zap /></div><span>nearline</span></div>
        <div className="workspace"><div className="workspace-avatar">N</div><div><strong>Nearline HQ</strong><small>Personal workspace</small></div><ChevronDown className="chevron" /></div>
        <nav className="nav-section">
          <button className="nav-item"><Inbox /> Inbox <span className="count">4</span></button>
          <button className="nav-item active"><List /> My tasks</button>
          <button className="nav-item"><CalendarDays /> Calendar</button>
          <button className="nav-item"><Target /> Goals</button>
        </nav>
        <div className="nav-label">Spaces <button aria-label="Add space"><Plus /></button></div>
        <nav className="nav-section"><button className="nav-item"><span className="space-dot purple" />Work <ChevronDown className="tiny" /></button><button className="nav-item"><span className="space-dot blue" />Personal</button><button className="nav-item"><span className="space-dot orange" />Marketing</button></nav>
        <div className="sidebar-bottom"><button className="nav-item"><Settings /> Settings</button><button className="nav-item"><CircleHelp /> Help &amp; feedback</button><div className="profile"><div className="profile-avatar">AM</div><div><strong>Alex Morgan</strong><small>Free plan</small></div><MoreHorizontal /></div></div>
      </aside>
      <section className="content">
        <header className="topbar"><div className="breadcrumbs"><span>Workspace</span><span>/</span><strong>My tasks</strong></div><div className="top-actions"><div className="search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search anything..." /><kbd>⌘ K</kbd></div><div className="mini-avatar">AM</div></div></header>
        <div className="page-wrap">
          <div className="page-heading"><div><div className="eyebrow"><span className="live-dot" /> PERSONAL SPACE</div><h1>Your day, in one line.</h1><p>Capture the thought, then move it forward.</p></div><button className="primary-button" onClick={() => addItem()}><Plus /> Add item</button></div>
          <div className="capture-bar"><span className="capture-label">Input</span><input placeholder="What needs your attention?" onKeyDown={(event) => { if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.keyCode !== 229) addItem() }} /><button onClick={() => addItem()} aria-label="Create item"><Plus /></button></div>
          <div className="timeline-header"><div className="timeline-line"><div className="timeline-node active-node"><span /><b>Task</b></div><div className="timeline-node"><span /><b>Note</b></div><div className="timeline-node"><span /><b>Link</b></div></div></div>
          <div className="toolbar"><div className="tabs"><button className={activeType === 'All' ? 'tab active' : 'tab'} onClick={() => setActiveType('All')}>All items</button><button className={activeType === 'Task' ? 'tab active' : 'tab'} onClick={() => setActiveType('Task')}><Check /> Tasks</button><button className={activeType === 'Note' ? 'tab active' : 'tab'} onClick={() => setActiveType('Note')}><FileText /> Notes</button><button className={activeType === 'Link' ? 'tab active' : 'tab'} onClick={() => setActiveType('Link')}><Link2 /> Links</button></div><button className="filter-button"><Filter /> Filter <ChevronDown /></button></div>
          <div className="item-grid">{filtered.map((item) => { const Icon = iconFor(item.kind); return <article className={selectedId === item.id ? 'item-card selected' : 'item-card'} key={item.id} onClick={() => setSelectedId(item.id)}><div className={`item-icon ${item.kind.toLowerCase()}`}><Icon /></div><div className="item-content"><div className="item-kicker">{item.kind}<span>·</span>{item.due}</div><h2 className={item.done ? 'complete' : ''}>{item.title}</h2><div className="item-footer"><span><Folder /> {item.list}</span><button className="small-check" aria-label={`Mark ${item.title} complete`} onClick={(event) => { event.stopPropagation(); toggleItem(item.id) }}>{item.done && <Check />}</button></div></div><MoreHorizontal className="card-more" /></article> })}<button className="empty-card" onClick={() => addItem('Note')}><Plus /><span>Add another item</span><small>Keep the line moving</small></button></div>
          <div className="focus-banner"><div className="banner-icon"><Sparkles /></div><div><strong>One clear next step</strong><p>Everything you capture belongs somewhere. Start small and keep going.</p></div><button className="secondary-button" onClick={() => addItem('Task')}>Plan focus time</button></div>
        </div>
      </section>
    </main>
  )
}
