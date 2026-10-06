import { useParams } from 'react-router-dom';
import { Flashcard } from '../components/flashcard/Flashcard';
import { Sidebar } from '../components/user/Sidebar';

const FlashcardPage = () => {
    const { id } = useParams();

    return (
        <div className="flex min-h-screen bg-paper font-display text-stone-900 antialiased selection:bg-plum-200">
            <Sidebar activePage="/lockedin/library" />
            <Flashcard id={id} />
        </div>
    );
};

export default FlashcardPage;
