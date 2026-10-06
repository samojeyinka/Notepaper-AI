export const GeneratingOverlay = ({ noun, icon, timedOut, onReload }) => {
    return timedOut ? (
        <>
            <div className="w-16 h-16 bg-plum-50 flex items-center justify-center">
                <span className="material-icons-round text-plum-600 text-[28px]">hourglass_disabled</span>
            </div>
            <div className="text-center max-w-xs">
                <h3 className="text-xl font-semibold text-stone-900 mb-2">Taking longer than expected</h3>
                <p className="text-sm text-stone-500 mb-4">Schola is still working on your {noun}. It will appear once ready — you can reload to check.</p>
                <button
                    onClick={onReload}
                    className="px-5 py-2.5 bg-plum-600 text-white text-sm font-medium hover:bg-plum-700 transition-colors"
                >
                    Reload page
                </button>
            </div>
        </>
    ) : (
        <>
            <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-plum-100 border-t-plum-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-icons-round text-plum-600 text-[26px]">{icon}</span>
                </div>
            </div>
            <div className="text-center max-w-xs">
                <h3 className="text-xl font-semibold text-stone-900 mb-2">Schola is writing…</h3>
                <p className="text-sm text-stone-500">Schola is preparing your {noun} in the background — the page will update automatically when it's ready.</p>
            </div>
        </>
    );
};