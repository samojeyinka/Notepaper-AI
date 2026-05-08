import { useState, useEffect, useRef } from 'react';
import Loader from '../globals/Loader';
import { Link, useNavigate } from 'react-router-dom';
import { noteService } from '../../api/noteService';
import { paperService } from '../../api/paperService';
import { folderService } from '../../api/folderService';
import { presentationService } from '../../api/presentationService';
import { flashcardService } from '../../api/flashcardService';
import { workspaceCache } from '../../api/workspaceCache';
import { FolderShape } from './FloatingAIButton';

const ROTATIONS = ['-rotate-1', 'rotate-2', '-rotate-2', 'rotate-1'];

const trunc25 = (str) => {
  const s = str || '';
  return s.length > 15 ? s.slice(0, 15).trimEnd() + '…' : s;
};

const extractSnippet = (raw) => {
  if (!raw) return '';
  try {
    const parsed = JSON.parse(raw);
    const html = (parsed.pages ?? [])[0] ?? '';
    if (!html.trim()) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    return (div.textContent ?? div.innerText ?? '').trim().slice(0, 100);
  } catch {
    return raw.replace(/<[^>]+>/g, '').trim().slice(0, 100);
  }
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export function PolaroidCard({ title, content, date, rotation, isQuote = false }) {
  return (
    <div className={`polaroid-card bg-white p-2 pb-4 transform ${rotation}`}>
      <div className="aspect-[5/1] md:aspect-[4/3] bg-slate-100 mb-2 overflow-hidden rounded-sm relative">
        <div className={`absolute inset-0 p-2 font-handwriting2 text-slate-600 text-[12px] md:text-[13px] leading-relaxed ${isQuote ? 'italic' : ''}`}>
          {content}
        </div>
      </div>
      <h3 className="text-[13px] md:text-[14px] font-medium text-slate-800">{trunc25(title)}</h3>
      <p className="text-[9px] md:text-[10px] text-slate-400 uppercase font-normal tracking-widest mt-1">{date}</p>
    </div>
  );
}

// ── Tab configs ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'notes',         label: 'Recent Notes',         icon: 'description',       color: 'text-purple-500' },
  { id: 'papers',        label: 'Recent Papers',        icon: 'article',           color: 'text-indigo-500' },
  { id: 'folders',       label: 'Recent Folders',       icon: 'folder',            color: 'text-amber-500'  },
  { id: 'presentations', label: 'Recent Presentations', icon: 'slideshow',         color: 'text-emerald-500'},
  { id: 'flashcards',    label: 'Recent Flashcards',    icon: 'style',             color: 'text-rose-500'   },
];

const THEME_BG = {
  modern:   '#0f172a', minimal: '#d1fae5', academic: '#1e3a5f',
  bold:     'linear-gradient(135deg,#6d28d9,#c026d3)',
  pastel:   'linear-gradient(135deg,#fce7f3,#e0e7ff)',
};

// ── Item cards ────────────────────────────────────────────────────────────────
const PaperMiniCard = ({ paper, onClick }) => (
  <button onClick={onClick} className="text-left w-full focus:outline-none group">
    <div className="bg-white p-2 md:p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all h-full flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
          <span className="material-icons-round text-indigo-500 text-[15px]">article</span>
        </div>
        <span className="text-[10px] text-slate-400">{timeAgo(paper.updated_at)}</span>
      </div>
      <h4 className="font-medium md:font-semibold text-[13px] text-slate-800 mb-1">{trunc25(paper.title || 'Untitled Paper')}</h4>
      <p className="text-slate-400 text-[9px] md:text-[11px] line-clamp-2 italic flex-1">{extractSnippet(paper.snippet ?? paper.content ?? '') || 'No content yet.'}</p>
    </div>
  </button>
);

const FolderMiniCard = ({ folder, onClick }) => (
  <button onClick={onClick} className="text-left w-full focus:outline-none group">
    <div className="bg-white p-2 md:p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-3">
      <FolderShape shape={folder.shape ?? 'squircle'} color={folder.color ?? '#A78BFA'} icon={folder.icon ?? 'folder'} size={36} />
      <div className="min-w-0">
        <h4 className="font-medium md:font-semibold text-[13px] text-slate-800">{trunc25(folder.name)}</h4>
        <p className="text-[9px] md:text-[10px] text-slate-400">{timeAgo(folder.updated_at)}</p>
      </div>
    </div>
  </button>
);

const PresentationMiniCard = ({ pres, onClick }) => (
  <button onClick={onClick} className="text-left w-full focus:outline-none group">
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all overflow-hidden">
      <div className="w-full h-32 md:aspect-video flex items-center justify-center relative"
        style={{ background: THEME_BG[pres.theme] ?? '#0f172a' }}>
        <span className="material-icons-round text-white/25 text-[28px]">slideshow</span>
        <span className="absolute bottom-1.5 right-2 text-[9px] text-white/50 font-medium">{pres.slide_count ?? 0} slides</span>
      </div>
      <div className="p-2.5">
        <h4 className="font-medium md:font-semibold text-[12px] text-slate-800">{trunc25(pres.title || 'Untitled')}</h4>
        <p className="text-[9px] md:text-[10px] text-slate-400 capitalize">{pres.theme} · {timeAgo(pres.updated_at)}</p>
      </div>
    </div>
  </button>
);

const FlashcardMiniCard = ({ deck, onClick }) => {
  const count     = deck.cards_count ?? deck.card_count ?? deck.cards?.length ?? 0;
  const firstCard = deck.cards?.[0];
  return (
    <button onClick={onClick} className="text-left w-full focus:outline-none group">
      <div className="bg-white p-2 md:p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-rose-200 transition-all h-full flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
            <span className="material-icons-round text-rose-500 text-[15px]">style</span>
          </div>
          <span className="text-[10px] text-rose-400 font-medium">{count} {count === 1 ? 'card' : 'cards'}</span>
        </div>
        <h4 className="font-medium text-[12px] md:font-semibold md:text-[13px] text-slate-800 mb-1">{trunc25(deck.title || 'Untitled Deck')}</h4>
        {firstCard?.front && (
          <p className="text-[9px] md:text-[11px] text-slate-400 line-clamp-1 italic mt-auto">{firstCard.front}</p>
        )}
      </div>
    </button>
  );
};

// ── Tab dropdown ──────────────────────────────────────────────────────────────
const TabDropdown = ({ activeTab, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = TABS.find(t => t.id === activeTab) ?? TABS[0];

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-[13px] md:text-xl font-medium md:font-semibold hover:text-primary transition-colors group"
      >
        <span className={`material-icons-round text-[13px] md:text-[22px] ${current.color}`}>{current.icon}</span>
        {current.label}
        <span className={`material-icons-round text-[13px] text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { onChange(tab.id); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-4 py-2 text-[13px] font-normal md:font-medium transition-colors
                ${tab.id === activeTab ? 'bg-primary/5 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <span className={`material-icons-round text-[13px] md:text-[16px] ${tab.color}`}>{tab.icon}</span>
              {tab.label}
              {tab.id === activeTab && <span className="material-icons-round text-[13px] text-primary ml-auto">check</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
export default function RecentNotesSection() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('notes');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState({});
  const loadedTabs = useRef(new Set());

  const setTabData = (tab, rows) => setData(d => ({ ...d, [tab]: rows }));
  const setTabLoading = (tab, val) => setLoading(l => ({ ...l, [tab]: val }));

  const loadTab = async (tab) => {
    if (loadedTabs.current.has(tab)) return;
    loadedTabs.current.add(tab);
    setTabLoading(tab, true);

    try {
      if (tab === 'notes') {
        const cached = workspaceCache.getNotes();
        if (cached) { setTabData('notes', cached.data.slice(0, 4)); setTabLoading('notes', false); return; }
        const res = await noteService.list('page=1&updated_at=desc');
        const d = res.data ?? res; const rows = d.data ?? [];
        workspaceCache.setNotes(rows, d.current_page != null ? { current_page: d.current_page, last_page: d.last_page, total: d.total, per_page: d.per_page } : null);
        setTabData('notes', rows.slice(0, 4));

      } else if (tab === 'papers') {
        const cached = workspaceCache.getPapers();
        if (cached) { setTabData('papers', cached.data.slice(0, 4)); setTabLoading('papers', false); return; }
        const res = await paperService.list('page=1&updated_at=desc');
        const d = res.data ?? res; const rows = d.data ?? [];
        workspaceCache.setPapers(rows, d.current_page != null ? { current_page: d.current_page, last_page: d.last_page, total: d.total, per_page: d.per_page } : null);
        setTabData('papers', rows.slice(0, 4));

      } else if (tab === 'folders') {
        const cached = workspaceCache.getFolders();
        if (cached) { setTabData('folders', cached.data.slice(0, 4)); setTabLoading('folders', false); return; }
        const res = await folderService.list('sort=updated_at:desc&page=1');
        const d = res.data ?? res; const rows = d.data ?? [];
        workspaceCache.setFolders({ data: rows, meta: d.current_page != null ? { current_page: d.current_page, last_page: d.last_page, total: d.total } : null });
        setTabData('folders', rows.slice(0, 4));

      } else if (tab === 'presentations') {
        const cached = workspaceCache.getPresentations();
        if (cached) { setTabData('presentations', cached.data.slice(0, 4)); setTabLoading('presentations', false); return; }
        const res = await presentationService.list();
        const d = res.data ?? res; const rows = d.data ?? (Array.isArray(d) ? d : []);
        workspaceCache.setPresentations(rows, null);
        setTabData('presentations', rows.slice(0, 4));

      } else if (tab === 'flashcards') {
        const res = await flashcardService.list({ page: 1 });
        const d = res.data ?? res; const rows = d.data ?? (Array.isArray(d) ? d : []);
        setTabData('flashcards', rows.slice(0, 4));
      }
    } catch { /* non-fatal */ }
    finally { setTabLoading(tab, false); }
  };

  useEffect(() => { loadTab('notes'); }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    loadTab(tab);
  };

  const current = TABS.find(t => t.id === activeTab);
  const items = data[activeTab] ?? [];
  const isLoading = loading[activeTab] ?? false;

  const tabToLibraryTab = activeTab;

  return (
    <div className="xl:col-span-3">
      {/* Header */}
      <div className="flex justify-between items-center mb-3 md:mb-6">
        <TabDropdown activeTab={activeTab} onChange={handleTabChange} />
        <Link
          to={`/lockedin/library?tab=${tabToLibraryTab}`}
          className="text-purple-500 text-[13px] md:text-[15px] font-normal md:font-medium hover:underline flex items-center gap-1"
        >
          View All
          <span className="material-icons-round text-[15px]">arrow_forward</span>
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader size="lg" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
          <span className={`material-icons-round text-slate-200 text-[48px]`}>{current?.icon}</span>
          <p className="text-sm text-slate-400">No {activeTab} yet.</p>
        </div>
      ) : activeTab === 'notes' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((note, index) => (
            <button key={note.id} onClick={() => navigate(`/lockedin/notes/${note.id}`)} className="text-left focus:outline-none">
              <PolaroidCard
                title={trunc25(note.title || 'Untitled Note')}
                content={extractSnippet(note.snippet ?? note.content ?? '') || 'No content yet.'}
                date={timeAgo(note.updated_at)}
                rotation={ROTATIONS[index % ROTATIONS.length]}
              />
            </button>
          ))}
        </div>
      ) : activeTab === 'papers' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map(paper => (
            <PaperMiniCard key={paper.id} paper={paper} onClick={() => navigate(`/lockedin/papers/${paper.id}`)} />
          ))}
        </div>
      ) : activeTab === 'folders' ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {items.map(folder => (
            <FolderMiniCard key={folder.id} folder={folder} onClick={() => navigate(`/lockedin/folders/${folder.id}`)} />
          ))}
        </div>
      ) : activeTab === 'presentations' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map(pres => (
            <PresentationMiniCard key={pres.id} pres={pres} onClick={() => navigate(`/lockedin/presentations/${pres.id}`)} />
          ))}
        </div>
      ) : activeTab === 'flashcards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map(deck => (
            <FlashcardMiniCard key={deck.id} deck={deck} onClick={() => navigate(`/lockedin/flashcards/${deck.id}`)} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
