export const PaperExportWarningModal = ({ format, onCancel, onConfirm }) => {
    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white  shadow-2xl p-6 max-w-sm w-full mx-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                    <span className="material-icons-round text-amber-500 text-[22px]">warning</span>
                </div>
                <h3 className="text-lg font-bold text-stone-800 mb-1">
                    Formatting will be lost
                </h3>
                <p className="text-sm text-stone-500 mb-5">
                    Exporting as <strong>.{format.toUpperCase()}</strong> converts your pages to plain text.
                    Bold, italic, images, and tables will not be preserved in the file.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5  border border-stone-200 text-stone-700 text-sm font-semibold hover:bg-stone-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(format)}
                        className="flex-1 px-4 py-2.5  bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
                    >
                        Export anyway
                    </button>
                </div>
            </div>
        </div>
    );
};