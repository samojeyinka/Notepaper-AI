import { BsGithub, BsGoogle } from 'react-icons/bs';

export const SocialButton = () => {
    const handleSocialLogin = (provider) => {
        // Redirect to backend social auth endpoint
       const BASE_URL = import.meta.env.VITE_API_URL || 'https://notepaperai-api.synchrome.co/api/v1';
        window.location.href = `${BASE_URL}/auth/${provider}/redirect`;
    };

    return (
        <div className="grid grid-cols-2 gap-2 md:gap-4 mb-4 md:mb-8">
            <button 
                onClick={() => handleSocialLogin('google')}
                className="flex items-center justify-center gap-2 px-2 md:px-4 py-1.5 md:py-3 border border-slate-200  md: hover:bg-slate-50 transition-colors duration-200 shadow-sm"
            >
                <BsGoogle className="text-[13px] md:text-xl text-red-500" />
                <span className="text-[12px] md:text-sm font-medium md:font-semibold text-slate-700">Google</span>
            </button>
            <button 
                onClick={() => handleSocialLogin('github')}
                className="flex items-center justify-center gap-2 px-2 md:px-4 py-1.5 md:py-3 border border-slate-200  hover:bg-slate-50 transition-colors duration-200 shadow-sm"
            >
                <BsGithub className="text-[13px] md:text-xl text-slate-900" />
                <span className="text-[12px] md:text-sm font-medium md:font-semibold text-slate-700">GitHub</span>
            </button>
        </div>
    );
};