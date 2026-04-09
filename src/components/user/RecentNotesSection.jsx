import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { noteService } from '../../api/noteService';
import { workspaceCache } from '../../api/workspaceCache';

const ROTATIONS = ['-rotate-1', 'rotate-2', '-rotate-2', 'rotate-1'];

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

export function PolaroidCard({ title, content, date, rotation, isQuote = false }){
  return (
    <div className={`polaroid-card bg-white p-2 pb-4 transform ${rotation}`}>
      <div className="aspect-[4/1] md:aspect-[4/3] bg-slate-100 mb-2 overflow-hidden rounded-sm relative">
        <div className={`absolute inset-0 p-2 font-handwriting2 text-slate-600 text-[13px] leading-relaxed ${isQuote ? 'italic' : ''}`}>
          {content}
        </div>
      </div>
      <h3 className="text-[14px] font-medium text-slate-800">{title}</h3>
      <p className="text-[10px] text-slate-400 uppercase font-normal tracking-widest mt-1">{date}</p>
    </div>
  );
};

// Recent Notes Section
export default function RecentNotesSection() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check shared cache first (set by LibraryContent)
    const cached = workspaceCache.getNotes();
    if (cached) {
      setNotes(cached.data.slice(0, 4));
      setLoading(false);
      return;
    }
    noteService.list('page=1&updated_at=desc')
      .then(res => {
        const data = res.data ?? res;
        const rows = data.data ?? [];
        workspaceCache.setNotes(rows, data.current_page != null ? { current_page: data.current_page, last_page: data.last_page, total: data.total, per_page: data.per_page } : null);
        setNotes(rows.slice(0, 4));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="xl:col-span-3">
      {/* Header */}
      <div className="flex justify-between items-center mb-3 md:mb-6">
        <h2 className="text-[15px] md:text-xl font-semibold flex items-center">
          Recent Notes
          <span className="material-icons-round ml-2 text-purple-500">north_east</span>
        </h2>
        <Link to="/lockedin/library" className="text-purple-500 text-[14px] md:text-xl font-medium hover:underline">
          View All Library
        </Link>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="flex justify-center py-10">
          <span className="material-icons-round text-primary text-[30px] animate-spin">sync</span>
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
          <span className="material-icons-round text-slate-200 text-[48px]">note_add</span>
          <p className="text-sm text-slate-400">No notes yet. Create your first one!</p>
          <button
            onClick={() => navigate('/lockedin/notes/new')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all"
          >
            <span className="material-icons-round text-[16px]">note_add</span>
            New Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {notes.map((note, index) => (
            <button key={note.id} onClick={() => navigate(`/lockedin/notes/${note.id}`)} className="text-left focus:outline-none">
              <PolaroidCard
                title={note.title || 'Untitled Note'}
                content={extractSnippet(note.snippet ?? note.content ?? '') || 'No content yet.'}
                date={timeAgo(note.updated_at)}
                rotation={ROTATIONS[index % ROTATIONS.length]}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
