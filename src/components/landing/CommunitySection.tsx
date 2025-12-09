'use client';

import { useTranslations } from 'next-intl';

const benefits = [
  { id: 'network', icon: (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  )},
  { id: 'training', icon: (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
    </svg>
  )},
  { id: 'support', icon: (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.712 4.33a9.027 9.027 0 011.652 1.306c.51.51.944 1.064 1.306 1.652M16.712 4.33l-3.448 4.138m3.448-4.138a9.014 9.014 0 00-9.424 0M19.67 7.288l-4.138 3.448m4.138-3.448a9.014 9.014 0 010 9.424m-4.138-5.976a3.736 3.736 0 00-.88-1.388 3.737 3.737 0 00-1.388-.88m2.268 2.268a3.765 3.765 0 010 2.528m-2.268-4.796a3.765 3.765 0 00-2.528 0m4.796 4.796c-.181.506-.475.982-.88 1.388a3.736 3.736 0 01-1.388.88m2.268-2.268l4.138 3.448m0 0a9.027 9.027 0 01-1.306 1.652 9.027 9.027 0 01-1.652 1.306m0 0l-3.448-4.138m3.448 4.138a9.014 9.014 0 01-9.424 0m5.976-4.138a3.765 3.765 0 01-2.528 0m0 0a3.736 3.736 0 01-1.388-.88 3.737 3.737 0 01-.88-1.388m2.268 2.268L7.288 19.67m0 0a9.024 9.024 0 01-1.652-1.306 9.027 9.027 0 01-1.306-1.652m0 0l4.138-3.448M4.33 16.712a9.014 9.014 0 010-9.424m4.138 5.976a3.765 3.765 0 010-2.528m0 0c.181-.506.475-.982.88-1.388a3.736 3.736 0 011.388-.88m-2.268 2.268L4.33 7.288m6.406 1.18L7.288 4.33m0 0a9.024 9.024 0 00-1.652 1.306A9.025 9.025 0 004.33 7.288" />
    </svg>
  )},
  { id: 'growth', icon: (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  )},
];

export default function CommunitySection() {
  const t = useTranslations('landing');

  return (
    <section id="community" className="py-16 sm:py-20 lg:py-24 bg-[var(--card)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="order-2 lg:order-1">
            <span className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs sm:text-sm font-medium mb-3 sm:mb-4">
              {t('communityLabel')}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text)] mb-4 sm:mb-6">
              {t('communityTitle')}
            </h2>
            <p className="text-base sm:text-lg text-[var(--text-muted)] mb-6 sm:mb-8 leading-relaxed">
              {t('communitySubtitle')}
            </p>

            {/* Benefits List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
              {benefits.map((benefit) => (
                <div key={benefit.id} className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] flex-shrink-0">
                    {benefit.icon}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-[var(--text)] text-sm sm:text-base mb-0.5 sm:mb-1">
                      {t(`communityBenefits.${benefit.id}.title`)}
                    </h4>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] line-clamp-2">
                      {t(`communityBenefits.${benefit.id}.description`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Partner Network Visual */}
          <div className="relative order-1 lg:order-2">
            {/* Central Hub - Simplified for mobile */}
            <div className="relative w-full max-w-[280px] sm:max-w-sm lg:max-w-md mx-auto aspect-square">
              {/* Connecting Lines - Hidden on very small screens */}
              <svg className="absolute inset-0 w-full h-full hidden sm:block" viewBox="0 0 400 400">
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                {/* Lines from center to nodes */}
                {[0, 60, 120, 180, 240, 300].map((angle, i) => {
                  const rad = (angle * Math.PI) / 180;
                  const x = 200 + Math.cos(rad) * 140;
                  const y = 200 + Math.sin(rad) * 140;
                  return (
                    <line
                      key={i}
                      x1="200"
                      y1="200"
                      x2={x}
                      y2={y}
                      stroke="url(#lineGradient)"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  );
                })}
              </svg>

              {/* Center Logo */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-3 sm:px-5 sm:py-4 rounded-xl sm:rounded-2xl bg-[var(--primary)] shadow-lg flex items-center justify-center z-10">
                <img
                  src="/logo-harlock.png"
                  alt="Harlock"
                  className="h-8 sm:h-10 lg:h-12 w-auto filter brightness-0 invert"
                />
              </div>

              {/* Partner Nodes - Fewer on mobile */}
              {[0, 60, 120, 180, 240, 300].map((angle, i) => {
                const rad = (angle * Math.PI) / 180;
                const x = 50 + Math.cos(rad) * 35;
                const y = 50 + Math.sin(rad) * 35;
                // Hide some nodes on mobile
                const hiddenOnMobile = i === 1 || i === 4;
                return (
                  <div
                    key={i}
                    className={`absolute w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg sm:rounded-xl bg-[var(--background)] border-2 border-[var(--border)] shadow-md flex items-center justify-center hover:border-[var(--primary)] hover:scale-110 transition-all cursor-pointer ${hiddenOnMobile ? 'hidden sm:flex' : 'flex'}`}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-md sm:rounded-lg bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/5" />
                  </div>
                );
              })}

              {/* Decorative Rings */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 sm:w-48 h-32 sm:h-48 rounded-full border border-[var(--border)] opacity-50" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 sm:w-72 h-52 sm:h-72 rounded-full border border-[var(--border)] opacity-30 hidden sm:block" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 rounded-full border border-[var(--border)] opacity-20 hidden md:block" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
