import { Link } from 'react-router-dom';
import { useAIKeys, openAIKeyModal } from '../../hooks/useAIKeys';

/**
 * Sidebar nudge shown until the user connects their first provider key.
 * Renders nothing while the key list is still loading so it never flashes.
 */
export const AiKeyReminder = () => {
    const { loaded, hasKeys } = useAIKeys();

    if (!loaded || hasKeys) return null;

    return (
        <div className="mx-3 mb-3 px-3.5 py-4 bg-plum-50 border border-plum-200 flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 bg-plum-100 text-plum-700 flex items-center justify-center flex-shrink-0">
                    <span className="material-icons-round text-[16px]">key</span>
                </span>
                <p className="text-[12px] font-semibold text-stone-800 leading-tight">Add an AI key</p>
            </div>

            <p className="text-[11px] leading-relaxed text-stone-600">
                Connect Google, DeepSeek, OpenAI or Claude to unlock notes, quizzes and study plans.
            </p>

            <button
                onClick={openAIKeyModal}
                className="w-full px-3 py-2 bg-stone-900 hover:bg-plum-700 text-white text-[12px] font-semibold transition-colors"
            >
                Add your first key
            </button>

            <Link
                to="/lockedin/model-guide"
                className="text-[11px] font-medium text-plum-700 hover:text-plum-600 text-center underline underline-offset-2"
            >
                Which provider?
            </Link>
        </div>
    );
};

export default AiKeyReminder;
