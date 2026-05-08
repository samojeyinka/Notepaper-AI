export default function LimitBanner({ message }) {
    return (
        <div className="relative overflow-hidden flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border-l-[3px] border-primary">
            <div className="shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-icons-round text-primary text-[15px]">lock</span>
            </div>
            <p className="flex-1 text-[11px] text-slate-500 leading-snug">{message}</p>
            <span className="shrink-0 text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                Upgrade
            </span>
            <div className="absolute -right-3 -top-3 w-12 h-12 rounded-full bg-primary/5 pointer-events-none" />
        </div>
    );
}
