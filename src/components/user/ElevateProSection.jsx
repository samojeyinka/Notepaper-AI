import { useState } from 'react';

export const FeatureItem = ({ label }) => {
  return (
    <li className="flex items-center space-x-1">
      <span className="material-symbols-outlined text-yellow-300 text-[13px]">check_circle</span>
      <span className="text-sm font-normal text-[12px]">{label}</span>
    </li>
  );
};

export const PriceCard = ({ period, isActive, discount, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-0.5 rounded-xl font-normal text-[10px] md:text-[12px] transition-all ${
        isActive
          ? 'bg-white text-slate-900 shadow-md'
          : 'text-white/80 hover:text-white'
      }`}
    >
      {period}
      {discount && (
        <span className="text-[10px] bg-green-500/30 text-green-300 px-2 py-0.5 rounded-full ml-1">
          {discount}
        </span>
      )}
    </button>
  );
};

export const FeatureStatCard = ({ icon, iconColor, rotation }) => {
  const baseClasses =
    'bg-white/10 backdrop-blur-md p-4 rounded-[2rem] border border-white/20 transform transition-all hover:rotate-0';
  const rotationClass = rotation;

  return (
    <div className={`${baseClasses} ${rotationClass}`}>
      <div className={`w-10 h-10 ${iconColor} rounded-full mb-3 flex items-center justify-center`}>
        <span className="material-symbols-outlined text-white">{icon}</span>
      </div>
      <div className="h-2 w-12 bg-white/30 rounded-full mb-2"></div>
      <div className="h-2 w-full bg-white/10 rounded-full"></div>
    </div>
  );
};

const ElevateProSection = () => {
  const [activePlan, setActivePlan] = useState('monthly');
  const [isVisible, setIsVisible] = useState(true);

  const features = [
    'Unlimited Cloud Storage',
    'Advanced AI Summaries',
    'No-Ads Experience',
  ];

  const featureCards = [
    {
      icon: 'psychology',
      iconColor: 'bg-yellow-400',
      rotation: '-rotate-3 hover:rotate-0',
    },
    {
      icon: 'data_saver_on',
      iconColor: 'bg-green-400',
      rotation: 'rotate-6 translate-y-8 hover:rotate-0',
    },
    {
      icon: 'draw',
      iconColor: 'bg-purple-400',
      rotation: '-translate-y-4 hover:rotate-0',
    },
  ];

  if (!isVisible) return null;

  return (
    <section className="mb-6 lg:mb-8 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-4 sm:p-6 text-white relative overflow-hidden">
      {/* Close Button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-4 right-4 z-20 p-1.5 hover:bg-white/10 rounded-lg transition-colors group"
        aria-label="Close"
      >
        <span className="material-icons-round text-white/60 group-hover:text-white text-xl">
          close
        </span>
      </button>

      {/* Background Gradient Blurs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 opacity-20 blur-3xl -z-0"></div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-400 opacity-20 blur-3xl -z-0"></div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
        {/* Left Section - Text & CTA */}
        <div className="max-w-md w-full">
          {/* Heading */}
          <h2 className="text-[16px] md:text-lg sm:text-[15px] font-medium md:font-semibold mb-2 leading-tight">
            Elevate your study game with Notepaper Pro
          </h2>

          {/* Subheading */}
          <p className="text-white/70 mb-4 leading-relaxed text-[12px] md:text-[13px]">
            Unlock unlimited AI generation, handwriting recognition, and smart quiz generation from your voice recordings.
          </p>

          {/* Plan Toggle */}
          <div className="flex items-center space-x-2 bg-white/10 p-1.5 rounded-2xl w-fit mb-4 border border-white/20">
            <PriceCard
              period="Monthly"
              isActive={activePlan === 'monthly'}
              onClick={() => setActivePlan('monthly')}
            />
            <PriceCard
              period="Yearly"
              isActive={activePlan === 'yearly'}
              discount="-20%"
              onClick={() => setActivePlan('yearly')}
            />
          </div>

          {/* Features List */}
          <ul className="space-y-2 mb-4">
            {features.map((feature, index) => (
              <FeatureItem key={index} label={feature} />
            ))}
          </ul>

          {/* CTA Button */}
          <button className="bg-purple-500 hover:bg-purple-600 text-white px-8 sm:px-10 py-2 rounded-xl font-medium text-sm shadow-xl shadow-purple-500/20 transition-all flex items-center space-x-2">
            <span>Get Started Now</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>

        {/* Right Section - Feature Cards Grid */}
        <div className="relative w-full max-w-sm lg:max-w-none hidden md:block">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full lg:w-80 xl:w-96 mx-auto">
            {featureCards.map((card, index) => (
              <FeatureStatCard
                key={index}
                icon={card.icon}
                iconColor={card.iconColor}
                rotation={card.rotation}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ElevateProSection;