import { Link } from 'react-router-dom';
import { useAIKeys, openAIKeyModal } from '../../hooks/useAIKeys';
import { ExistingKeys } from '../AIKeys/AIKeyModal';

export const AIKeysSection = () => {
    const { data, loaded, hasKeys, remove, setDefault, openModal } = useAIKeys();

    return (
        <section className="bg-white p-5 border border-stone-200/80 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-plum-100 text-plum-700 rounded-xl flex items-center justify-center">
                    <span className="material-icons-round">key</span>
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="text-[17px] font-semibold text-stone-900">AI Keys</h2>
                    <p className="text-[12px] text-stone-500">Bring your own provider — no subscription needed.</p>
                </div>
                <button
                    onClick={openModal}
                    className="px-3.5 py-2 bg-stone-900 hover:bg-plum-700 text-white text-[13px] font-semibold transition-colors"
                >
                    Manage
                </button>
            </div>

            {!loaded ? (
                <div className="space-y-2">
                    <div className="h-14 bg-stone-100 animate-pulse" />
                    <div className="h-14 bg-stone-100 animate-pulse" />
                </div>
            ) : !hasKeys ? (
                <div className="px-4 py-6 bg-stone-50 border border-dashed border-stone-300 text-center">
                    <span className="inline-flex w-10 h-10 bg-plum-100 text-plum-600 items-center justify-center mb-2">
                        <span className="material-icons-round text-[20px]">add</span>
                    </span>
                    <p className="text-sm font-medium text-stone-700">No AI key connected yet</p>
                    <p className="text-[12px] text-stone-500 mt-1 max-w-xs mx-auto leading-relaxed">
                        Connect Google, DeepSeek, OpenAI or Claude to unlock every AI feature.
                    </p>
                    <div className="mt-3 flex items-center justify-center gap-3">
                        <button
                            onClick={openAIKeyModal}
                            className="px-4 py-2 bg-stone-900 hover:bg-plum-700 text-white text-[13px] font-semibold transition-colors"
                        >
                            Add your first key
                        </button>
                        <Link
                            to="/lockedin/model-guide"
                            className="text-[13px] font-medium text-plum-700 hover:text-plum-600 underline underline-offset-2"
                        >
                            Model guide
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                    <ExistingKeys
                        data={data}
                        onSetDefault={async ({ provider }) => {
                            await setDefault(provider);
                        }}
                        onRemove={async (provider) => {
                            await remove(provider);
                        }}
                        onEdit={() => openModal()}
                    />
                    <p className="mt-3 text-[12px] text-stone-400">
                        Choosing a provider?{' '}
                        <Link to="/lockedin/model-guide" className="text-plum-700 font-medium underline underline-offset-2">
                            Open the model guide
                        </Link>
                    </p>
                </>
            )}
        </section>
    );
};

export default AIKeysSection;