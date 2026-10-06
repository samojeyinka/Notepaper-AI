const SIZES = {
    xs:  'w-2.5 h-2.5',
    sm:  'w-4 h-4',
    md:  'w-6 h-6',
    lg:  'w-8 h-8',
    xl:  'w-10 h-10',
};

const Loader = ({ size = 'md', className = '' }) => (
    <span
        role="status"
        aria-label="Loading"
        className={`inline-block animate-spin rounded-full border-2 border-stone-200 border-t-plum-700 ${SIZES[size] ?? SIZES.md} ${className}`}
    />
);

export default Loader;
