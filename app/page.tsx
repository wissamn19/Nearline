'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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
  const [quickCapture, setQuickCapture] = useState('')
  const [activeType, setActiveType] = useState<Item['kind'] | 'All'>('All')
  const [selectedId, setSelectedId] = useState(1)
  const [activeCapture, setActiveCapture] = useState<Item['kind'] | null>(null)
  const [captureText, setCaptureText] = useState('')
  const [isClassifying, setIsClassifying] = useState(false)
  const captureRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const closeCapture = (event: MouseEvent) => {
      if (captureRef.current && !captureRef.current.contains(event.target as Node)) setActiveCapture(null)
    }
    document.addEventListener('mousedown', closeCapture)
    return () => document.removeEventListener('mousedown', closeCapture)
  }, [])

  const filtered = useMemo(() => items.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()) && (activeType === 'All' || item.kind === activeType)), [items, query, activeType])
  const classifyCapture = async (title: string): Promise<Item['kind']> => {
    const response = await fetch('/api/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: title }),
    })
    if (!response.ok) throw new Error('Classification failed')
    const result = await response.json() as { kind: Item['kind'] }
    return result.kind
  }
  const addItem = async (kind?: Item['kind'], title?: string) => {
    const cleanTitle = title?.trim() || quickCapture.trim()
    if (!cleanTitle && !kind) return
    setIsClassifying(!kind)
    let resolvedKind = kind || 'Task'
    try {
      if (!kind && cleanTitle) resolvedKind = await classifyCapture(cleanTitle)
    } catch {
      resolvedKind = /(https?:\/\/|www\.)/.test(cleanTitle.toLowerCase()) ? 'Link' : 'Task'
    } finally {
      setIsClassifying(false)
    }
    const next = { id: Date.now(), title: cleanTitle || `New ${resolvedKind.toLowerCase()}`, kind: resolvedKind, list: 'Personal', due: 'Today' }
    setItems((current) => [...current, next])
    setSelectedId(next.id)
    setQuickCapture('')
  }
  const submitCapture = () => {
    if (!activeCapture || !captureText.trim()) return
    addItem(activeCapture, captureText)
    setCaptureText('')
  }
  const toggleItem = (id: number) => setItems((current) => current.map((item) => item.id === id ? { ...item, done: !item.done } : item))
  const completedCount = items.filter((item) => item.done).length
  const roadmapProgress = Math.min(88, 18 + (completedCount / Math.max(items.length, 1)) * 70)
  const roadmapStep = completedCount > 1 ? 'Keep the momentum' : completedCount === 1 ? 'Choose your next move' : 'Start with one thought'

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
          <div className="page-heading"><div><div className="eyebrow"><span className="live-dot" /> QUICK CAPTURE / PERSONAL SPACE</div><h1>Catch it before it disappears.</h1><p>One line in. Nearline sorts the rest.</p></div><button className="primary-button" onClick={() => addItem()} disabled={isClassifying}><Plus /> {isClassifying ? 'Sorting...' : 'Add item'}</button></div>
          <div className="capture-bar"><span className="capture-label">Quick capture</span><input value={quickCapture} onChange={(event) => setQuickCapture(event.target.value)} placeholder="A task, thought, or link..." onKeyDown={(event) => { if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.keyCode !== 229) addItem() }} /><span className="capture-hint">{isClassifying ? 'sorting...' : 'AI auto-sorts'}</span><button onClick={() => addItem()} aria-label="Create item" disabled={isClassifying}><Plus /></button></div>
          <div className="dashboard-pulse"><div className="pulse-lead"><span className="pulse-mark"><Sparkles /></span><div><strong>Nearline is listening</strong><p>Your inbox stays clear while ideas keep moving.</p></div></div><div className="pulse-stat"><b>{items.filter((item) => item.done).length}</b><span>completed</span></div><div className="pulse-stat"><b>{items.length}</b><span>on your line</span></div><div className="pulse-streak"><span className="streak-label">WEEKLY RHYTHM</span><div className="streak-days">{['M','T','W','T','F','S','S'].map((day, index) => <span className={index < 4 ? 'filled' : ''} key={`${day}-${index}`}>{day}</span>)}</div></div></div>
          <div className="roadmap" ref={captureRef}><div className="roadmap-intro"><div><span className="roadmap-kicker">YOUR CAPTURE ROADMAP</span><strong className="roadmap-step">{roadmapStep}</strong></div><span className="roadmap-hint">Tap a point and I&apos;ll walk it with you</span></div><div className="roadmap-track"><div className="roadmap-progress" style={{ width: `${roadmapProgress}%` }} /><div className="roadmap-you" style={{ left: `${roadmapProgress}%` }}><span>YOU ARE HERE</span></div>{(['Task', 'Note', 'Link'] as const).map((kind, index) => <div className={activeCapture === kind ? `roadmap-stop ${kind.toLowerCase()} active-node` : `roadmap-stop ${kind.toLowerCase()}`} key={kind}><div className="roadmap-connector" /><button type="button" className="node-button" onClick={() => { setActiveCapture(kind); setCaptureText('') }} aria-label={`Capture ${kind}`}><span /><b>{kind}</b><i>+</i></button><small>{index === 0 ? 'Do it' : index === 1 ? 'Think it' : 'Keep it'}</small>{activeCapture === kind && <div className="node-capture"><input autoFocus value={captureText} onChange={(event) => setCaptureText(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.keyCode !== 229) submitCapture(); if (event.key === 'Escape') setActiveCapture(null) }} placeholder={`Add a ${kind.toLowerCase()}...`} aria-label={`${kind} capture input`} /></div>}</div>)}</div></div>
          <div className="toolbar"><div className="tabs"><button className={activeType === 'All' ? 'tab active' : 'tab'} onClick={() => setActiveType('All')}>All items</button><button className={activeType === 'Task' ? 'tab active' : 'tab'} onClick={() => setActiveType('Task')}><Check /> Tasks</button><button className={activeType === 'Note' ? 'tab active' : 'tab'} onClick={() => setActiveType('Note')}><FileText /> Notes</button><button className={activeType === 'Link' ? 'tab active' : 'tab'} onClick={() => setActiveType('Link')}><Link2 /> Links</button></div><button className="filter-button"><Filter /> Filter <ChevronDown /></button></div>
          <div className="item-grid">{filtered.map((item) => { const Icon = iconFor(item.kind); return <article className={selectedId === item.id ? 'item-card selected' : 'item-card'} key={item.id} onClick={() => setSelectedId(item.id)}><div className={`item-icon ${item.kind.toLowerCase()}`}><Icon /></div><div className="item-content"><div className="item-kicker">{item.kind}<span>·</span>{item.due}</div><h2 className={item.done ? 'complete' : ''}>{item.title}</h2><div className="item-footer"><span><Folder /> {item.list}</span><button className="small-check" aria-label={`Mark ${item.title} complete`} onClick={(event) => { event.stopPropagation(); toggleItem(item.id) }}>{item.done && <Check />}</button></div></div><MoreHorizontal className="card-more" /></article> })}<button className="empty-card" onClick={() => addItem('Note')}><Plus /><span>Add another item</span><small>Keep the line moving</small></button></div>
          <div className="focus-banner"><div className="banner-icon"><Sparkles /></div><div><strong>One clear next step</strong><p>Everything you capture belongs somewhere. Start small and keep going.</p></div><button className="secondary-button" onClick={() => addItem('Task')}>Plan focus time</button></div>
        </div>
      </section>
    </main>
  )
}
