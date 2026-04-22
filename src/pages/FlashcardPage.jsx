import { useParams } from 'react-router-dom';
import { Flashcard } from '../components/flashcard/Flashcard';
import { Sidebar } from '../components/user/Sidebar';

const FlashcardPage = () => {
    const { id } = useParams();


    return (

        <div className="flex min-h-screen bg-white">
            <Sidebar activePage="/lockedin/flashcards" />
            <Flashcard id={id} />;
        </div>
    )
};

export default FlashcardPage;
