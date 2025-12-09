'use client';

import { useTranslations } from 'next-intl';

const stats = [
  { id: 'partners', value: '500+' },
  { id: 'events', value: '100+' },
  { id: 'resources', value: '1000+' },
  { id: 'support', value: '24/7' },
];

export default function StatsSection() {
  const t = useTranslations('landing');

  return (
    <section className="py-20 bg-[var(--primary)] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="text-center"
            >
              <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-white/80 text-sm sm:text-base font-medium">
                {t(`stats.${stat.id}`)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
