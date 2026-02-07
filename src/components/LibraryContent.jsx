import { useState } from 'react';

// Header Component
export const LibraryHeader = () => {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Library & Folders</h1>
        <p className="text-slate-500 text-[14px] font-normal">Manage your creative knowledge base.</p>
      </div>
      <div className="hidden md:flex items-center gap-3">
        <button className="bg-primary hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl text-[15px] font-normal transition-all shadow-lg shadow-primary/25 flex items-center gap-2">
          <span className="material-symbols-rounded">add</span>
          New
        </button>
      </div>
    </header>
  );
};

// Search Bar Component
export const SearchBar = ({ onSearch, onAdvancedFilter }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  return (
    <section className="mb-4">
      <div className="relative max-w-4xl mx-auto">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <span className="material-symbols-rounded text-slate-400 text-[16px]">search</span>
        </div>

        {/* Input */}
        <input
          className="w-full bg-surface-light border-none rounded-xl py-2 pl-16 pr-24 shadow-sm focus:ring-2 focus:ring-primary text-[14px] placeholder-slate-400"
          placeholder="Search across all notes, tags, or content..."
          type="text"
          value={searchQuery}
          onChange={handleChange}
        />

        {/* Advanced Filters Button */}
        <div className="absolute inset-y-0 right-4 flex items-center">
          <button
            onClick={onAdvancedFilter}
            className="bg-slate-100 text-slate-500 text-[13px] font-normal px-2 py-1 rounded-xl hover:bg-slate-200 transition-colors"
          >
          <span className="material-symbols-rounded text-slate-400 text-[17px]">sort</span>
          </button>
        </div>
      </div>
    </section>
  );
};

// Tag Pill Component - Reusable
export const TagPill = ({ label, bgColor, textColor, borderColor, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-1.5 py-0.5 md:px-2.5 md:py-1 ${bgColor} ${textColor} rounded-full text-[10px] md:text-[12px] font-normal border ${borderColor} hover:shadow-md transition-all`}
    >
      {label}
    </button>
  );
};

// Recent Tags Section
export const RecentTagsSection = ({ onTagClick }) => {
  const tags = [
    {
      label: '#philosophy',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
    },
    {
      label: '#biology',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
    },
    {
      label: '#design-systems',
      bgColor: 'bg-sky-100',
      textColor: 'text-sky-700',
      borderColor: 'border-sky-200',
    },
    {
      label: '#financial-reporting',
      bgColor: 'bg-rose-100',
      textColor: 'text-rose-700',
      borderColor: 'border-rose-200',
    },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
      <span className="text-[12px] md:text-sm font-medium text-slate-400 mr-2 uppercase tracking-widest">Recent Tags:</span>
      {tags.map((tag, index) => (
        <TagPill
          key={index}
          label={tag.label}
          bgColor={tag.bgColor}
          textColor={tag.textColor}
          borderColor={tag.borderColor}
          onClick={() => onTagClick(tag.label)}
        />
      ))}
    </div>
  );
};

// Folder Card Component - Reusable
export const FolderCard = ({ icon, title, itemCount, lastUpdated, bgColor, shapeClass, textColor }) => {
  return (
    <div className="group cursor-pointer">
      <div className="aspect-square bg-surface-light rounded-xl md:rounded-3xl p-2 md:p-8 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10">
        <div className={`w-16 h-16 md:w-20 md:h-20 ${bgColor} ${shapeClass} flex items-center justify-center text-white mb-6 transform group-hover:rotate-12 transition-transform duration-500`}>
          <span className="material-symbols-rounded text-4xl">{icon}</span>
        </div>
        <h3 className="text-[15px] md:text-lg font-medium md:font-semibold text-center">{title}</h3>
        <p className="text-slate-500 text-[10px] md:text-[12px] mt-1">
          {itemCount} items · Updated {lastUpdated}
        </p>
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className={`material-symbols-rounded ${textColor}`}>arrow_forward</span>
        </div>
      </div>
    </div>
  );
};

// Folders Section with Display Toggle
export const FoldersSection = () => {
  const [displayMode, setDisplayMode] = useState('grid');

  const folders = [
    {
      icon: 'school',
      title: 'University Finals',
      itemCount: 24,
      lastUpdated: '2h ago',
      bgColor: 'bg-amber-400',
      shapeClass: 'organic-shape-1',
      textColor: 'text-amber-400',
    },
    {
      icon: 'code',
      title: 'Web Dev Notes',
      itemCount: 112,
      lastUpdated: '1d ago',
      bgColor: 'bg-emerald-500',
      shapeClass: 'organic-shape-2',
      textColor: 'text-emerald-500',
    },
    {
      icon: 'favorite',
      title: 'Daily Journaling',
      itemCount: 365,
      lastUpdated: 'today',
      bgColor: 'bg-rose-400',
      shapeClass: 'organic-shape-3',
      textColor: 'text-rose-400',
    },
    {
      icon: 'auto_awesome',
      title: 'AI Generated',
      itemCount: 12,
      lastUpdated: '3d ago',
      bgColor: 'bg-indigo-500',
      shapeClass: 'organic-shape-4',
      textColor: 'text-indigo-500',
    },
  ];

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[17px] font-semibold flex items-center gap-3">
          <span className="w-1 h-5 bg-primary rounded-full"></span>
          Folders
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setDisplayMode('grid')}
            className={`p-2 transition-colors ${
              displayMode === 'grid'
                ? 'text-primary'
                : 'text-slate-400 hover:text-primary'
            }`}
          >
            <span className="material-symbols-rounded">grid_view</span>
          </button>
          <button
            onClick={() => setDisplayMode('list')}
            className={`p-2 transition-colors ${
              displayMode === 'list'
                ? 'text-primary'
                : 'text-slate-400 hover:text-primary'
            }`}
          >
            <span className="material-symbols-rounded">view_list</span>
          </button>
        </div>
      </div>

      {/* Grid View */}
      {displayMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {folders.map((folder, index) => (
            <FolderCard
              key={index}
              icon={folder.icon}
              title={folder.title}
              itemCount={folder.itemCount}
              lastUpdated={folder.lastUpdated}
              bgColor={folder.bgColor}
              shapeClass={folder.shapeClass}
              textColor={folder.textColor}
            />
          ))}
        </div>
      )}

      {/* List View */}
      {displayMode === 'list' && (
        <div className="space-y-4">
          {folders.map((folder, index) => (
            <div
              key={index}
              className="bg-surface-light p-3 rounded-3xl border border-slate-100 hover:border-primary/50 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 ${folder.bgColor} ${folder.shapeClass} flex items-center justify-center text-white`}>
                  <span className="material-symbols-rounded text-2xl">{folder.icon}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{folder.title}</h3>
                  <p className="text-slate-500 text-sm">
                    {folder.itemCount} items · Updated {folder.lastUpdated}
                  </p>
                </div>
              </div>
              <span className={`material-symbols-rounded ${folder.textColor} opacity-0 group-hover:opacity-100 transition-opacity`}>
                arrow_forward
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

// Note Card Component - Reusable
export const NoteCard = ({ icon, title, content, date, bgColor, iconColor }) => {
  return (
    <div className="bg-surface-light p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}>
          <span className={`material-symbols-rounded ${iconColor} text-xl`}>{icon}</span>
        </div>
        <button className="text-slate-300 hover:text-slate-500 transition-colors">
          <span className="material-symbols-rounded">more_horiz</span>
        </button>
      </div>
      <h4 className="font-semibold text-[16px] mb-2 line-clamp-1">{title}</h4>
      <p className="text-slate-500 text-[12px] line-clamp-3 mb-4 font-serif italic leading-relaxed">
        {content}
      </p>
      <div className="flex items-center gap-2 mt-auto">
        <span className="text-[10px] font-normal px-1 py-0.5 bg-slate-100 rounded-lg text-slate-500">
          {date}
        </span>
      </div>
    </div>
  );
};

// Recent Notes Section
export const RecentNotesSection = () => {
  const notes = [
    {
      icon: 'description',
      title: 'Philosophy Exam Review',
      content:
        '"The unexamined life is not worth living." — Socrates. Reviewing the core tenets of Greek philosophy...',
      date: 'Oct 12, 2023',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-500',
    },
    {
      icon: 'mic',
      title: 'Standup Meeting Audio',
      content:
        'Summarized: Tasks for today include debugging the folder navigation and refining the dark mode toggle...',
      date: 'Oct 11, 2023',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
    },
    {
      icon: 'palette',
      title: 'Color Palette Ideas',
      content:
        'Focus on organic shapes and soft pastels. Use a mix of geometric and fluid elements for a modern feel...',
      date: 'Oct 10, 2023',
      bgColor: 'bg-rose-50',
      iconColor: 'text-rose-500',
    },
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[17px] font-semibold flex items-center gap-3">
          <span className="w-1 h-5 bg-slate-300 rounded-full"></span>
          Recent Notes
        </h2>
        <a className="text-sm font-medium text-primary hover:underline" href="#">
          View All Library
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {notes.map((note, index) => (
          <NoteCard
            key={index}
            icon={note.icon}
            title={note.title}
            content={note.content}
            date={note.date}
            bgColor={note.bgColor}
            iconColor={note.iconColor}
          />
        ))}
        {/* Create New Note Card */}
        <div className="border-2 border-dashed border-slate-200 p-3 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all cursor-pointer group">
          <span className="material-symbols-rounded text-3xl mb-2 group-hover:scale-110 transition-transform">
            add_circle
          </span>
          <span className="font-semibold">Create New Note</span>
        </div>
      </div>
    </section>
  );
};

// Floating Action Button
export const FloatingCreateButton = () => {
  return (
    <div className="fixed bottom-8 right-8 z-50">
      <button className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 hover:scale-110 transition-transform active:scale-95">
        <span className="material-symbols-rounded text-3xl">create</span>
      </button>
    </div>
  );
};

// Main Library Content
export const LibraryContent = () => {
  const [filteredSearch, setFilteredSearch] = useState('');

  const handleSearch = (query) => {
    setFilteredSearch(query);
    console.log('Searching for:', query);
  };

  const handleAdvancedFilter = () => {
    console.log('Advanced filters opened');
    // Can open a modal or filter panel
  };

  const handleTagClick = (tag) => {
    console.log('Clicked tag:', tag);
    setFilteredSearch(tag);
  };

  return (
    <main className="flex-1 lg:ml-64 p-3 lg:p-8 pt-20 lg:pt-8">
      <LibraryHeader />
      <SearchBar onSearch={handleSearch} onAdvancedFilter={handleAdvancedFilter} />
      <RecentTagsSection onTagClick={handleTagClick} />
      <FoldersSection />
      <RecentNotesSection />
      <FloatingCreateButton />
    </main>
  );
};

