'use client'

import { useMemo, useState } from 'react'
import { Bell, CalendarDays, Check, ChevronDown, CircleHelp, Filter, Folder, Grid2X2, Inbox, List, MoreHorizontal, Plus, Search, Settings, Sparkles, Target, Users, Zap } from 'lucide-react'
import './styles.css'

type Task = { id: number; title: string; list: string; due: string; priority: 'Urgent' | 'High' | 'Normal'; done?: boolean }

const initialTasks: Task[] = [
  { id: 1, title: 'Review Q4 campaign brief', list: 'Marketing', due: 'Today', priority: 'Urgent' },
  { id: 2, title: 'Send project update to team', list: 'Personal', due: 'Today', priority: 'High' },
  { id: 3, title: 'Book dentist appointment', list: 'Personal', due: 'Tomorrow', priority: 'Normal' },
  { id: 4, title: 'Update onboarding checklist', list: 'Work', due: 'Oct 21', priority: 'Normal' },
]

export default function Home() {
  const [tasks, setTasks] = useState(initialTasks)
  const [activeView, setActiveView] = useState('My tasks')
  const [query, setQuery] = useState('')
  const [showComplete, setShowComplete] = useState(false)

  const visibleTasks = useMemo(() => tasks.filter((task) => task.title.toLowerCase().includes(query.toLowerCase()) && (showComplete || !task.done)), [tasks, query, showComplete])
  const toggleTask = (id: number) => setTasks(tasks.map((task) => task.id === id ? { ...task, done: !task.done } : task))
  const addTask = () => setTasks([{ id: Date.now(), title: 'New task', list: 'Personal', due: 'Today', priority: 'Normal' }, ...tasks])

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Zap /></div><span>nearline</span></div>
        <div className="workspace"><div className="workspace-avatar">N</div><div><strong>Nearline HQ</strong><small>Personal workspace</small></div><ChevronDown className="chevron" /></div>
        <nav className="nav-section">
          <button className="nav-item"><Inbox /> Inbox <span className="count">4</span></button>
          <button className="nav-item active"><Check /> My tasks</button>
          <button className="nav-item"><CalendarDays /> Calendar</button>
          <button className="nav-item"><Target /> Goals</button>
        </nav>
        <div className="nav-label">Spaces <button aria-label="Add space"><Plus /></button></div>
        <nav className="nav-section spaces"><button className="nav-item"><span className="space-dot purple" />Work <ChevronDown className="tiny" /></button><button className="nav-item"><span className="space-dot blue" />Personal</button><button className="nav-item"><span className="space-dot orange" />Marketing</button></nav>
        <div className="sidebar-bottom"><button className="nav-item"><Settings /> Settings</button><button className="nav-item"><CircleHelp /> Help &amp; feedback</button><div className="profile"><div className="profile-avatar">AM</div><div><strong>Alex Morgan</strong><small>Free plan</small></div><MoreHorizontal /></div></div>
      </aside>

      <section className="content">
        <header className="topbar"><div className="breadcrumbs"><span>Workspace</span><span>/</span><strong>{activeView}</strong></div><div className="top-actions"><div className="search"><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tasks..." /><kbd>⌘ K</kbd></div><button className="icon-button" aria-label="Notifications"><Bell /></button><button className="icon-button" aria-label="Grid view"><Grid2X2 /></button><div className="mini-avatar">AM</div></div></header>
        <div className="page-wrap">
          <div className="page-heading"><div><div className="eyebrow"><span className="live-dot" /> PERSONAL SPACE</div><h1>Good morning, Alex <span>✦</span></h1><p>Here&apos;s what&apos;s on your plate today.</p></div><button className="primary-button" onClick={addTask}><Plus /> Add task</button></div>
          <div className="stat-grid"><div className="stat-card"><div className="stat-icon violet"><Check /></div><div><small>Completed this week</small><strong>18 tasks</strong></div><span className="trend">+24%</span></div><div className="stat-card"><div className="stat-icon green"><Target /></div><div><small>Current streak</small><strong>6 days</strong></div><span className="trend">Best yet</span></div><div className="stat-card"><div className="stat-icon amber"><Sparkles /></div><div><small>Focus time</small><strong>4h 20m</strong></div><span className="trend">Today</span></div></div>
          <div className="section-toolbar"><div className="tabs"><button className={activeView === 'My tasks' ? 'tab active' : 'tab'} onClick={() => setActiveView('My tasks')}><List /> My tasks</button><button className={activeView === 'Assigned to me' ? 'tab active' : 'tab'} onClick={() => setActiveView('Assigned to me')}><Users /> Assigned to me</button></div><div className="toolbar-actions"><button className="secondary-button" onClick={() => setShowComplete(!showComplete)}><Filter /> {showComplete ? 'Hide completed' : 'Filter'} </button><button className="icon-button bordered" aria-label="More options"><MoreHorizontal /></button></div></div>
          <div className="task-card"><div className="task-card-head"><div><h2>{activeView}</h2><span>{visibleTasks.length} tasks · Updated just now</span></div><button className="view-select"><List /> List view <ChevronDown /></button></div><div className="task-list">{visibleTasks.map((task) => <div className={task.done ? 'task-row done' : 'task-row'} key={task.id}><button className="task-check" aria-label={`Mark ${task.title} complete`} onClick={() => toggleTask(task.id)}>{task.done && <Check />}</button><div className="task-main"><strong>{task.title}</strong><span><Folder /> {task.list}</span></div><div className="task-meta"><span className="due"><CalendarDays /> {task.due}</span><span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span><button className="row-more" aria-label="Task options"><MoreHorizontal /></button></div></div>)}</div><button className="add-row" onClick={addTask}><Plus /> Add task</button></div>
          <div className="focus-banner"><div className="banner-icon"><Sparkles /></div><div><strong>Make room for deep work</strong><p>You&apos;ve got a clear afternoon. Block 90 minutes for your most important task.</p></div><button className="secondary-button">Plan focus time</button></div>
        </div>
      </section>
    </main>
  )
}
