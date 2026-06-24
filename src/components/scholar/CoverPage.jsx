export default function CoverPage({ cover, doc }) {
    if (!cover?.layout) {
        return (
            <div className="text-center py-14 border-b border-slate-100 mb-8">
                <h1 className="text-[13px] font-semibold text-slate-800 leading-snug mb-4">{doc.title}</h1>
                <div className="flex items-center justify-center flex-wrap gap-5 text-[13px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                        <span className="material-icons-round text-[15px]">format_align_left</span>
                        {(doc.word_count || 0).toLocaleString()} words
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="material-icons-round text-[15px]">menu_book</span>
                        {(doc.pages || []).length} pages
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="material-icons-round text-[15px]">calendar_today</span>
                        {new Date(doc.completed_at || doc.created_at).toLocaleDateString()}
                    </span>
                </div>
            </div>
        );
    }

    const {
        layout = 'classic',
        title = doc.title,
        institution = '',
        institution_logo = '',
        description = '',
        supervisor = '',
        date = '',
        members = [],
    } = cover;

    const metaParts = [supervisor ? `Supervisor: ${supervisor}` : '', date].filter(Boolean);

    if (layout === 'modern') return <ModernCover {...{ title, institution, institution_logo, description, metaParts, members }} />;
    if (layout === 'minimal') return <MinimalCover {...{ title, institution, description, metaParts, members }} />;
    return <ClassicCover {...{ title, institution, institution_logo, description, metaParts, members }} />;
}

function MembersList({ members, className = '', align = 'center' }) {
    if (!members.length) return null;
    return (
        <div className={`${className} ${align === 'left' ? 'text-left' : 'text-center'}`}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">By</p>
            {members.map((m, i) => (
                <p key={i} className="text-[13px] text-slate-700 leading-snug">{m}</p>
            ))}
        </div>
    );
}

// ── Classic ────────────────────────────────────────────────────────────────────

function ClassicCover({ title, institution, institution_logo, description, metaParts, members }) {
    return (
        <div className="flex flex-col items-center text-center pt-16 pb-14 px-16 border-b border-slate-100 mb-8">
            {institution_logo && (
                <img
                    src={institution_logo}
                    alt="Institution logo"
                    className="max-h-20 max-w-[160px] object-contain mb-8"
                />
            )}

            <h1 className="text-[17px] font-bold text-slate-900 leading-snug mb-4 uppercase tracking-wide">{title}</h1>

            {institution && (
                <p className="text-[13px] font-medium text-slate-600 mb-3">{institution}</p>
            )}

            {description && (
                <p className="text-[12px] text-slate-500 italic max-w-lg leading-relaxed mb-4">{description}</p>
            )}

            <div className="w-20 border-t border-slate-200 my-5" />

            {metaParts.length > 0 && (
                <p className="text-[12px] text-slate-500 mb-4">{metaParts.join(' | ')}</p>
            )}

            <MembersList members={members} />
        </div>
    );
}

// ── Modern ─────────────────────────────────────────────────────────────────────

function ModernCover({ title, institution, institution_logo, description, metaParts, members }) {
    return (
        <div className="border border-slate-100 rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="bg-slate-900 flex items-center gap-4 px-8 py-5">
                {institution_logo && (
                    <img
                        src={institution_logo}
                        alt="Institution logo"
                        className="max-h-12 max-w-[96px] object-contain brightness-0 invert opacity-90"
                    />
                )}
                {institution && (
                    <span className="text-[13px] font-bold text-white uppercase tracking-wide">{institution}</span>
                )}
            </div>

            <div className="px-10 pt-10 pb-8">
                <h1 className="text-[17px] font-bold text-slate-900 leading-snug mb-3 uppercase tracking-wide">{title}</h1>

                {description && (
                    <p className="text-[12px] text-slate-500 max-w-xl leading-relaxed">{description}</p>
                )}

                <div className="flex items-end justify-between mt-6 gap-8">
                    <MembersList members={members} align="left" />
                    {metaParts.length > 0 && (
                        <div className="flex flex-col items-end gap-0.5 shrink-0">
                            {metaParts.map((p, i) => (
                                <span key={i} className="text-[13px] text-slate-600">{p}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Minimal ────────────────────────────────────────────────────────────────────

function MinimalCover({ title, institution, description, metaParts, members }) {
    return (
        <div className="flex flex-col items-center text-center pt-20 pb-14 px-20 border-b border-slate-100 mb-8">
            <div className="max-w-lg w-full">
                <h1 className="text-[17px] font-bold text-slate-900 leading-snug mb-3 uppercase tracking-wide">{title}</h1>

                {description && (
                    <p className="text-[12px] text-slate-500 italic mb-3">{description}</p>
                )}

                <div className="w-full border-t border-slate-200 my-5" />

                {institution && (
                    <p className="text-[13px] text-slate-700 font-medium mb-2">{institution}</p>
                )}

                {metaParts.length > 0 && (
                    <p className="text-[12px] text-slate-500 mb-4">{metaParts.join(' | ')}</p>
                )}

                <MembersList members={members} />
            </div>
        </div>
    );
}
