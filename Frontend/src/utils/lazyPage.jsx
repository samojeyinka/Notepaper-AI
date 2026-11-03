import { lazy, Suspense } from 'react';
import Loader from '../components/globals/Loader';

const PageFallback = () => (
    <div className="min-h-screen flex items-center justify-center bg-paper">
        <Loader size="lg" />
    </div>
);


export const lazyPage = (loader) => {
    const Component = lazy(loader);

    return function LazyPage(props) {
        return (
            <Suspense fallback={<PageFallback />}>
                <Component {...props} />
            </Suspense>
        );
    };
};
