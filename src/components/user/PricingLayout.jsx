// Plan Feature Item Component - Reusable


export const PlanFeature = ({
  icon,
  shapeClass,
  bgColor,
  title,
  description,
  disabled = false,
  handwriting = false,
}) => {
  return (
    <div className="flex items-center gap-4">
      <div
        className={`w-7 h-7 ${shapeClass} ${bgColor} flex-shrink-0 flex items-center justify-center ${
          disabled ? 'text-slate-500' : 'text-white'
        }`}
      >
        <span className="material-symbols-outlined text-base">{icon}</span>
      </div>
      <div>
        <h4 className={`font-medium text-[15px] ${disabled ? 'text-slate-400' : ''}`}>{title}</h4>
        <p
          className={`text-[12px] ${
            disabled ? 'text-slate-400 italic' : 'text-slate-500'
          } ${handwriting ? 'font-handwriting text-primary text-[14px]' : ''}`}
        >
          {description}
        </p>
      </div>
    </div>
  );
};

// Plan Card Component - Reusable

export const PlanCard = ({
  name,
  price,
  period,
  description,
  features,
  buttonText,
  buttonVariant,
  isRecommended = false,
  onButtonClick,
}) => {
  const isPrimary = buttonVariant === 'primary';

  return (
    <div className={isRecommended ? 'relative group' : ''}>
      {/* Gradient Blur Effect for Recommended */}
      {isRecommended && (
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-4xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
      )}

      {/* Card */}
      <div
        className={`relative ${
          isRecommended
            ? 'bg-white  rounded-xl p-5 shadow-md flex flex-col h-full border border-purple-500/20 bg-gradient-to-br from-white to-purple-500/5'
            : 'bg-white  rounded-xl p-5 shadow-sm border border-slate-100  flex flex-col h-full hover:shadow-md transition-all'
        }`}
      >
        {/* Recommended Badge */}
        {isRecommended && (
          <div className="absolute top-6 right-6 px-2 py-0.5 bg-purple-500 text-white text-[10px] font-normal rounded-full uppercase tracking-wider">
            Recommended
          </div>
        )}

        {/* Plan Header */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-1">{name}</h2>
          <div className="flex items-baseline mb-2">
            <span className={`text-4xl font-extrabold ${isPrimary ? 'text-purple-500' : ''}`}>
              {price}
            </span>
            <span className="text-slate-400 ml-2 font-normal">/ {period}</span>
          </div>
          <p className="text-slate-500 text-[14px]">{description}</p>
        </div>

        {/* Features List */}
        <div className="space-y-3 flex-1">
          {features.map((feature, index) => (
            <PlanFeature
              key={index}
              icon={feature.icon}
              shapeClass={feature.shapeClass}
              bgColor={feature.bgColor}
              title={feature.title}
              description={feature.description}
              disabled={feature.disabled}
              handwriting={feature.handwriting}
            />
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={onButtonClick}
          className={`mt-6 w-full py-2 rounded-xl font-semibold text-[15px] transition-all ${
            isPrimary
              ? 'bg-purple-500 text-white hover:bg-purple-600 shadow-md shadow-purple-500/25'
              : 'bg-slate-100 text-slate-900  hover:bg-slate-200'
          }`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export const ComparisonFeature = ({ icon, label }) => {
  return (
    <div className="flex flex-col items-center">
      <span className="material-symbols-outlined text-purple-500 mb-2">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};

// All Plans Comparison Section
export const AllPlansFeaturesSection = () => {
  const features = [
    { icon: 'cloud_done', label: 'Cloud Sync' },
    { icon: 'devices', label: 'Cross-platform' },
    { icon: 'lock', label: 'End-to-End Encryption' },
    { icon: 'support_agent', label: '24/7 Support' },
  ];

  return (
    <div className="max-w-4xl mx-auto mt-10 text-center">
      <h3 className="text-xl font-semibold mb-4">All plans include:</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <ComparisonFeature key={index} icon={feature.icon} label={feature.label} />
        ))}
      </div>
    </div>
  );
};

// Main Pricing Page Header
export const PricingHeader = () => {
  return (
    <header className="max-w-4xl mx-auto text-center mb-8">
      <h1 className="text-3xl font-semibold text-slate-900 mb-2">
        Pricing Plans
      </h1>
      <p className="text-[15px] text-slate-500">
        Choose the perfect plan for your learning journey.
      </p>
    </header>
  );
};

// Complete Pricing Page Content
export const PricingPage = () => {
  // Free Plan Features
  const freePlanFeatures = [
    {
      icon: 'description',
      shapeClass: 'pentagon-shape',
      bgColor: 'bg-yellow-400',
      title: '10 Monthly Notes',
      description: 'Essential storage for your ideas.',
    },
    {
      icon: 'mic_off',
      shapeClass: 'rounded-full',
      bgColor: 'bg-slate-100',
      title: 'No Voice Recording',
      description: 'Upgrade to unlock voice-to-text',
      disabled: true,
      handwriting: false,
    },
    {
      icon: 'auto_awesome',
      shapeClass: 'blob-shape',
      bgColor: 'bg-slate-100',
      title: 'Basic AI Summaries',
      description: 'Short summaries for your notes.',
    },
  ];

  // Premium Plan Features
  const premiumPlanFeatures = [
    {
      icon: 'all_inclusive',
      shapeClass: 'pentagon-shape',
      bgColor: 'bg-yellow-400',
      title: 'Unlimited Notes',
      description: 'Create as much as your heart desires.',
    },
    {
      icon: 'mic',
      shapeClass: 'rounded-full',
      bgColor: 'bg-green-500',
      title: 'Unlimited Voice Records',
      description: 'Record lectures and meetings directly.',
    },
    {
      icon: 'history_edu',
      shapeClass: 'blob-shape',
      bgColor: 'bg-purple-500',
      title: 'Custom Handwriting Styles',
      description: 'Make it feel like your own paper',
      handwriting: true,
    },
    {
      icon: 'quiz',
      shapeClass: 'rounded-2xl',
      bgColor: 'bg-indigo-500',
      title: 'AI Quiz Generation',
      description: 'Turn any note into a study quiz instantly.',
    },
  ];

  return (
    <main className="flex-1 p-8 lg:px-8 lg:py-2">
      <PricingHeader />

      {/* Plans Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Free Plan */}
        <PlanCard
          name="Free"
          price="$0"
          period="forever"
          description="Perfect for getting started with smart note-taking."
          features={freePlanFeatures}
          buttonText="Current Plan"
          buttonVariant="secondary"
          isRecommended={false}
        />

        {/* Premium Plan */}
        <PlanCard
          name="Premium"
          price="$7.99"
          period="month"
          description="Full AI power for students and professionals."
          features={premiumPlanFeatures}
          buttonText="Upgrade Now"
          buttonVariant="primary"
          isRecommended={true}
          onButtonClick={() => {
            console.log('Upgrade clicked');
          }}
        />
      </div>

      {/* All Plans Features */}
      <AllPlansFeaturesSection />
    </main>
  );
};



// Complete Pricing Layout
export const PricingLayout = () => {
  return (
    <div className="flex-1 lg:ml-64 p-3 lg:p-8 pt-20 lg:pt-8">
      <PricingPage />
    </div>
  );
};
