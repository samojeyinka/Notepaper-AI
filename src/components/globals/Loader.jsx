import loadingImg from '../../assets/loading.png';

const SIZES = {
    xs:  'w-2 h-2',
    sm:  'w-4 h-4',
    md:  'w-6 h-6',
    lg:  'w-10 h-10',
    xl:  'w-16 h-16',
};

const Loader = ({ size = 'md', className = '' }) => (
    <img
        src={loadingImg}
        alt="Loading"
        className={`animate-spin ${SIZES[size] ?? SIZES.md} ${className}`}
    />
);

export default Loader;
