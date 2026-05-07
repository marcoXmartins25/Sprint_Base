import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import Logo from '../components/Logo';

const PLANS = [
  {
    id: 'free',
    popular: false,
    features: [
      { key: 'users', value: '3' },
      { key: 'sprints', value: '2' },
      { key: 'tasks', value: '20' },
      { key: 'basicFields', included: true },
      { key: 'pdfWatermark', included: true },
    ],
  },
  {
    id: 'pro',
    popular: true,
    features: [
      { key: 'users', value: '10' },
      { key: 'sprintsUnlimited', included: true },
      { key: 'tasksUnlimited', included: true },
      { key: 'allFields', included: true },
      { key: 'pdfClean', included: true },
      { key: 'history6m', included: true },
    ],
  },
  {
    id: 'team',
    popular: false,
    features: [
      { key: 'usersUnlimited', included: true },
      { key: 'everythingPro', included: true },
      { key: 'historyUnlimited', included: true },
      { key: 'customBranding', included: true },
      { key: 'prioritySupport', included: true },
    ],
  },
];

function Pricing() {
  const { t, lang } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo size={28} />
            <span className="text-base font-bold text-gray-900">Sprint<span className="text-indigo-600">Base</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/docs" className="text-sm text-gray-500 hover:text-gray-900 transition font-medium">
              {t('nav.docs')}
            </Link>
            <Link to="/login" className="text-sm font-semibold text-indigo-600 border border-indigo-200 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition">
              {t('common.signIn')}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t('pricing.title')}
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          {t('pricing.subtitle')}
        </p>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl border-2 p-8 relative ${
                plan.popular ? 'border-indigo-500 shadow-xl shadow-indigo-100' : 'border-gray-100'
              }`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    {t('pricing.popular')}
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t(`pricing.${plan.id}.name`)}
                </h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {t(`pricing.${plan.id}.price`)}
                  </span>
                  {plan.id !== 'free' && (
                    <span className="text-gray-400 text-sm">/{t('pricing.month')}</span>
                  )}
                </div>
                {plan.id !== 'free' && (
                  <p className="text-xs text-gray-400">
                    {t(`pricing.${plan.id}.yearly`)}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-3">
                  {t(`pricing.${plan.id}.ideal`)}
                </p>
              </div>

              {/* CTA */}
              <Link
                to={plan.id === 'free' ? '/register-company' : '/login'}
                className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition mb-6 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:opacity-90 shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                {plan.id === 'free' ? t('pricing.startFree') : t('pricing.getStarted')}
              </Link>

              {/* Features */}
              <div className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm">
                    <svg className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">
                      {feature.value
                        ? `${feature.value} ${t(`pricing.features.${feature.key}`)}`
                        : t(`pricing.features.${feature.key}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ hint */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 text-sm">
            {t('pricing.questions')}{' '}
            <Link to="/docs" className="text-indigo-600 hover:underline font-medium">
              {t('pricing.checkDocs')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Pricing;
