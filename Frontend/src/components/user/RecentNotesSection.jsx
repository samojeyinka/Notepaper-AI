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

const extractSnippet = (raw) => {
  if (!raw) return '';
  try {
    const parsed = JSON.parse(raw);
    const html = (parsed.pages ?? [])[0] ?? '';
    if (!html.trim()) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    return (div.textContent ?? div.innerText ?? '').trim().slice(0, 120);
  } catch {
    const cleaned = raw.replace(/<[^>]+>/g, ' ');
    const quoted = cleaned.match(/"((?:[^"\\]|\\.)*)"/);
    if (quoted && quoted[1].trim()) return quoted[1].trim().slice(0, 120);
    return cleaned
      .replace(/[{}\[\]\\"]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120);
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
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const CARD_CLASS =
  'group h-full flex flex-col bg-white  ring-1 ring-stone-200/70 p-4 transition-all ' +
  'hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-22px_rgba(28,25,23,0.28)] hover:ring-plum-200 text-left';

const Chip = ({ bg, text, icon, size = 'md' }) => (
  <div className={`${bg} ${text} ${size === 'sm' ? 'w-7 h-7 ' : 'w-9 h-9 '} flex items-center justify-center shrink-0`}>
    <span className={`material-icons-round ${size === 'sm' ? 'text-[15px]' : 'text-[18px]'}`}>{icon}</span>
  </div>
);

// ── Note card (a quiet ruled sheet) ───────────────────────────────────────────
export function PolaroidCard({ title, content, date, rotation = '', isQuote = false }) {
  return (
    <div className={`group h-full flex flex-col overflow-hidden bg-white  ring-1 ring-stone-200/70 transition-all hover:shadow-[0_16px_34px_-22px_rgba(28,25,23,0.28)] hover:ring-plum-200 ${rotation}`}>
      <div className="paper-rule relative grow px-4 pt-3 pb-2 overflow-hidden">
        <p className={`font-handwritten text-[13.5px] leading-[27px] text-stone-500 break-words ${isQuote ? 'italic' : ''}`}>
          {content || 'A quiet page, waiting for your words…'}
        </p>
      </div>
      <div className="flex items-end justify-between gap-2 border-t border-stone-100 px-4 py-2.5 bg-stone-50/60">
        <h3 className="text-[13px] font-semibold text-stone-800 truncate min-w-0">{title}</h3>
        <span className="shrink-0 text-[9.5px] font-medium uppercase tracking-widest text-stone-400">{date}</span>
      </div>
    </div>
  );
}

// ── Tab configs ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'notes',         label: 'Notes',         icon: 'description' },
  { id: 'papers',        label: 'Papers',        icon: 'article' },
  { id: 'folders',       label: 'Folders',       icon: 'folder' },
  { id: 'presentations', label: 'Slides',        icon: 'slideshow' },
  { id: 'flashcards',    label: 'Flashcards',    icon: 'style' },
];

const THEME_BG = {
  modern:   '#0f172a', minimal: '#d1fae5', academic: '#1e3a5f',
  bold:     'linear-gradient(135deg,#6d28d9,#c026d3)',
  pastel:   'linear-gradient(135deg,#fce7f3,#e0e7ff)',
};

// ── Item cards ────────────────────────────────────────────────────────────────
const PaperMiniCard = ({ paper, onClick }) => (
  <button onClick={onClick} className={CARD_CLASS}>
    <div className="flex items-center justify-between mb-3">
      <Chip bg="bg-plum-50" text="text-plum-700" icon="article" />
      <span className="text-[10.5px] text-stone-400">{timeAgo(paper.updated_at)}</span>
    </div>
    <h4 className="font-semibold text-[13.5px] text-stone-800 mb-1 line-clamp-1">{paper.title || 'Untitled Paper'}</h4>
    <p className="text-stone-500 text-[12px] leading-relaxed line-clamp-3 flex-1">
      {extractSnippet(paper.snippet ?? paper.content ?? '') || 'No content yet.'}
    </p>
  </button>
);

const FolderMiniCard = ({ folder, onClick }) => (
  <button onClick={onClick} className={CARD_CLASS}>
    <div className="flex items-center gap-3">
      <FolderShape shape={folder.shape ?? 'squircle'} color={folder.color ?? '#7c5cc4'} icon={folder.icon ?? 'folder'} size={42} />
      <div className="min-w-0">
        <h4 className="font-semibold text-[13.5px] text-stone-800 truncate">{folder.name}</h4>
        <p className="text-[11px] text-stone-400 mt-0.5 capitalize">{folder.shape ?? 'folder'} · {timeAgo(folder.updated_at)}</p>
      </div>
    </div>
    <p className="text-stone-500 text-[12px] leading-relaxed line-clamp-2 mt-3 flex-1">
      {folder.description || 'A place to keep related pages together.'}
    </p>
  </button>
);

const PresentationMiniCard = ({ pres, onClick }) => (
  <button onClick={onClick} className="group h-full flex flex-col text-left overflow-hidden bg-white  ring-1 ring-stone-200/70 transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-22px_rgba(28,25,23,0.28)]">
    <div
      className="relative w-full aspect-[16/9] flex items-center justify-center overflow-hidden"
      style={{ background: THEME_BG[pres.theme] ?? '#0f172a' }}
    >
      <span className="material-icons-round text-white/30 text-[30px]">slideshow</span>
      <span className="absolute bottom-2 right-2  bg-stone-950/50 text-white/90 text-[9.5px] font-medium px-2 py-0.5">
        {pres.slide_count ?? 0} slides
      </span>
    </div>
    <div className="p-3 flex flex-col grow">
      <h4 className="font-semibold text-[13px] text-stone-800 line-clamp-1">{pres.title || 'Untitled'}</h4>
      <p className="text-[10.5px] text-stone-400 capitalize mt-1">{pres.theme} · {timeAgo(pres.updated_at)}</p>
    </div>
  </button>
);

const FlashcardMiniCard = ({ deck, onClick }) => {
  const count = deck.cards_count ?? deck.card_count ?? deck.cards?.length ?? 0;
  const firstCard = deck.cards?.[0];
  return (
    <button onClick={onClick} className={CARD_CLASS}>
      <div className="flex items-center justify-between mb-3">
        <Chip bg="bg-plum-50" text="text-plum-700" icon="style" />
        <span className="text-[10px] font-medium text-stone-500 bg-stone-100  px-2 py-0.5">
          {count} {count === 1 ? 'card' : 'cards'}
        </span>
      </div>
      <h4 className="font-semibold text-[13.5px] text-stone-800 mb-1 line-clamp-1">{deck.title || 'Untitled Deck'}</h4>
      {firstCard?.front && (
        <p className="text-stone-500 text-[12px] italic line-clamp-3 mt-auto">
          “{firstCard.front}”
        </p>
      )}
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
        className="flex items-center gap-2.5  hover:bg-stone-200/60 pr-2 pl-1.5 py-1 transition-colors"
      >
        <Chip bg="bg-plum-50" text="text-plum-700" icon={current.icon} size="sm" />
        <span className="text-[15px] font-semibold text-stone-800">Recent {current.label}</span>
        <span className={`material-icons-round text-[17px] text-stone-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white  ring-1 ring-stone-200 shadow-xl shadow-stone-900/10 py-1.5 z-50">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { onChange(tab.id); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] transition-colors
                ${tab.id === activeTab ? 'bg-plum-50 text-plum-800 font-semibold' : 'font-medium text-stone-600 hover:bg-stone-50'}`}
            >
              <span className={`w-6 h-6  flex items-center justify-center ${tab.id === activeTab ? 'bg-white/70 text-plum-700' : 'bg-stone-100 text-stone-500'}`}>
                <span className="material-icons-round text-[13px]">{tab.icon}</span>
              </span>
              {tab.label}
              {tab.id === activeTab && <span className="material-icons-round text-[14px] text-plum-700 ml-auto">check</span>}
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

  const emptyCopy = {
    notes: 'No notes yet — start with a blank page.',
    papers: 'No papers yet.',
    folders: 'No folders yet.',
    presentations: 'No slides yet.',
    flashcards: 'No flashcards yet.',
  };

  const renderGrid = () => {
    if (activeTab === 'notes') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
          {items.map(note => (
            <button key={note.id} onClick={() => navigate(`/lockedin/notes/${note.id}`)} className="text-left focus:outline-none h-full">
              <PolaroidCard
                title={note.title || 'Untitled Note'}
                content={extractSnippet(note.snippet ?? note.content ?? '') || 'No content yet.'}
                date={timeAgo(note.updated_at)}
              />
            </button>
          ))}
        </div>
      );
    }
    if (activeTab === 'papers') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
          {items.map(paper => <PaperMiniCard key={paper.id} paper={paper} onClick={() => navigate(`/lockedin/papers/${paper.id}`)} />)}
        </div>
      );
    }
    if (activeTab === 'folders') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
          {items.map(folder => <FolderMiniCard key={folder.id} folder={folder} onClick={() => navigate(`/lockedin/folders/${folder.id}`)} />)}
        </div>
      );
    }
    if (activeTab === 'presentations') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
          {items.map(pres => <PresentationMiniCard key={pres.id} pres={pres} onClick={() => navigate(`/lockedin/presentations/${pres.id}`)} />)}
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
        {items.map(deck => <FlashcardMiniCard key={deck.id} deck={deck} onClick={() => navigate(`/lockedin/flashcards/${deck.id}`)} />)}
      </div>
    );
  };

  return (
    <div className="xl:col-span-3">
      <div className="flex justify-between items-center mb-5">
        <TabDropdown activeTab={activeTab} onChange={handleTabChange} />
        <Link
          to={`/lockedin/library?tab=${activeTab}`}
          className="text-[13px] font-semibold text-plum-700 hover:text-plum-600 flex items-center gap-1 transition-colors"
        >
          View all
          <span className="material-icons-round text-[15px]">arrow_forward</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center bg-white/50  ring-1 ring-stone-200/60">
          <div className="w-12 h-12  flex items-center justify-center bg-plum-50 text-plum-700">
            <span className="material-icons-round text-[22px]">{current?.icon}</span>
          </div>
          <p className="text-sm text-stone-500 max-w-xs">{emptyCopy[activeTab]}</p>
        </div>
      ) : renderGrid()}
    </div>
  );
}
