'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

type SidebarOption = 'a1' | 'a2' | 'a3';
type DashboardOption = 'b1' | 'b2' | 'b3';
type ColorOption = 'c1' | 'c2' | 'c3';
type DataOption = 'd1' | 'd2' | 'd3';
type MobileOption = 'e1' | 'e2' | 'e3';

interface UISelections {
  sidebar: SidebarOption;
  dashboard: DashboardOption;
  color: ColorOption;
  dataDisplay: DataOption;
  mobileNav: MobileOption;
}

export default function UIPickerPage() {
  const t = useTranslations('uiPicker');

  const [selections, setSelections] = useState<UISelections>({
    sidebar: 'a1',
    dashboard: 'b1',
    color: 'c1',
    dataDisplay: 'd3',
    mobileNav: 'e1',
  });

  const [activeSection, setActiveSection] = useState<keyof UISelections>('color');

  // Apply theme when color changes
  const applyTheme = (theme: ColorOption) => {
    document.documentElement.setAttribute('data-theme', theme);
    setSelections(prev => ({ ...prev, color: theme }));
  };

  const sidebarOptions: { key: SidebarOption; label: string; description: string }[] = [
    { key: 'a1', label: t('options.a1'), description: 'Fixed left sidebar, icons + text, collapsible' },
    { key: 'a2', label: t('options.a2'), description: 'Grouped sections with headers, user card at bottom' },
    { key: 'a3', label: t('options.a3'), description: 'Floating effect with rounded corners and shadow' },
  ];

  const dashboardOptions: { key: DashboardOption; label: string; description: string }[] = [
    { key: 'b1', label: t('options.b1'), description: 'KPI cards at top, bento-box style widgets' },
    { key: 'b2', label: t('options.b2'), description: 'Activity feed main content, stats sidebar' },
    { key: 'b3', label: t('options.b3'), description: 'Large hero greeting, feature cards with hover' },
  ];

  const colorOptions: { key: ColorOption; label: string; description: string; preview: string }[] = [
    { key: 'c1', label: t('options.c1'), description: 'Clean corporate look, light background', preview: '#244675' },
    { key: 'c2', label: t('options.c2'), description: 'Dark sidebar/header, high contrast', preview: '#0F172A' },
    { key: 'c3', label: t('options.c3'), description: 'Gradient backgrounds, glassmorphism', preview: 'linear-gradient(135deg, #244675, #6b5b95)' },
  ];

  const dataOptions: { key: DataOption; label: string; description: string }[] = [
    { key: 'd1', label: t('options.d1'), description: 'Simple rows with hover, status badges' },
    { key: 'd2', label: t('options.d2'), description: 'Each item as a card, more info visible' },
    { key: 'd3', label: t('options.d3'), description: 'Tables on desktop, cards on mobile' },
  ];

  const mobileOptions: { key: MobileOption; label: string; description: string }[] = [
    { key: 'e1', label: t('options.e1'), description: 'Fixed bottom navigation with 5 items' },
    { key: 'e2', label: t('options.e2'), description: 'Full sidebar slides in as overlay' },
    { key: 'e3', label: t('options.e3'), description: 'Floating button that expands to menu' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            {t('title')}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {t('subtitle')}
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Section Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {(['color', 'sidebar', 'dashboard', 'dataDisplay', 'mobileNav'] as const).map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className="px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all"
              style={{
                background: activeSection === section ? 'var(--primary)' : 'var(--card)',
                color: activeSection === section ? 'white' : 'var(--text-muted)',
                border: activeSection === section ? 'none' : '1px solid var(--border)',
              }}
            >
              {section === 'color' && t('colorScheme')}
              {section === 'sidebar' && t('sidebar')}
              {section === 'dashboard' && t('dashboard')}
              {section === 'dataDisplay' && t('dataDisplay')}
              {section === 'mobileNav' && t('mobileNav')}
            </button>
          ))}
        </div>

        {/* Color Scheme Section */}
        {activeSection === 'color' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
              {t('colorScheme')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {colorOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => applyTheme(option.key)}
                  className="p-4 rounded-xl text-left transition-all"
                  style={{
                    background: 'var(--card)',
                    border: selections.color === option.key ? '2px solid var(--primary)' : '1px solid var(--border)',
                    boxShadow: selections.color === option.key ? 'var(--shadow-md)' : 'none',
                  }}
                >
                  <div
                    className="w-full h-20 rounded-lg mb-3"
                    style={{ background: option.preview }}
                  />
                  <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
                    {option.label}
                  </h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    {option.description}
                  </p>
                  {selections.color === option.key && (
                    <span className="inline-block mt-2 px-2 py-1 rounded text-xs font-medium" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                      Selected
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Live Preview Card */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>
                Live Preview
              </h3>
              <div className="card p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full gradient-bg" />
                  <div>
                    <h4 className="font-semibold" style={{ color: 'var(--text)' }}>Sample Card</h4>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>This is how cards will look</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-medium status-pending">Pending</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium status-in_progress">In Progress</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium status-completed">Completed</span>
                </div>
                <button className="mt-4 px-4 py-2 rounded-lg font-medium text-white transition-all" style={{ background: 'var(--primary)' }}>
                  Primary Button
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Section */}
        {activeSection === 'sidebar' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
              {t('sidebar')}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {sidebarOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setSelections(prev => ({ ...prev, sidebar: option.key }))}
                  className="p-4 rounded-xl text-left transition-all"
                  style={{
                    background: 'var(--card)',
                    border: selections.sidebar === option.key ? '2px solid var(--primary)' : '1px solid var(--border)',
                  }}
                >
                  {/* Preview */}
                  <div className="h-40 rounded-lg mb-3 flex overflow-hidden" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
                    {option.key === 'a1' && (
                      <>
                        <div className="w-16 h-full flex flex-col gap-2 p-2" style={{ background: 'var(--card)', borderRight: '1px solid var(--border)' }}>
                          <div className="w-full h-8 rounded" style={{ background: 'var(--primary)' }} />
                          {[1,2,3,4].map(i => <div key={i} className="w-full h-6 rounded" style={{ background: 'var(--border)' }} />)}
                        </div>
                        <div className="flex-1 p-2">
                          <div className="w-full h-6 rounded mb-2" style={{ background: 'var(--border)' }} />
                          <div className="w-3/4 h-4 rounded" style={{ background: 'var(--border)' }} />
                        </div>
                      </>
                    )}
                    {option.key === 'a2' && (
                      <>
                        <div className="w-20 h-full flex flex-col p-2" style={{ background: 'var(--card)', borderRight: '1px solid var(--border)' }}>
                          <div className="w-full h-6 rounded mb-2" style={{ background: 'var(--primary)' }} />
                          <div className="text-[8px] mb-1 font-semibold" style={{ color: 'var(--text-muted)' }}>MAIN</div>
                          {[1,2].map(i => <div key={i} className="w-full h-5 rounded mb-1" style={{ background: 'var(--border)' }} />)}
                          <div className="text-[8px] mb-1 mt-2 font-semibold" style={{ color: 'var(--text-muted)' }}>CONTENT</div>
                          {[1,2,3].map(i => <div key={i} className="w-full h-5 rounded mb-1" style={{ background: 'var(--border)' }} />)}
                        </div>
                        <div className="flex-1 p-2">
                          <div className="w-full h-6 rounded mb-2" style={{ background: 'var(--border)' }} />
                        </div>
                      </>
                    )}
                    {option.key === 'a3' && (
                      <div className="w-full h-full p-2">
                        <div className="flex h-full gap-2">
                          <div className="w-16 h-full rounded-lg p-2 flex flex-col gap-2" style={{ background: 'var(--card)', boxShadow: 'var(--shadow-md)' }}>
                            <div className="w-full h-8 rounded" style={{ background: 'var(--primary)' }} />
                            {[1,2,3].map(i => <div key={i} className="w-full h-6 rounded" style={{ background: 'var(--border)' }} />)}
                          </div>
                          <div className="flex-1 rounded-lg p-2" style={{ background: 'var(--card)', boxShadow: 'var(--shadow-sm)' }}>
                            <div className="w-full h-6 rounded mb-2" style={{ background: 'var(--border)' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold" style={{ color: 'var(--text)' }}>{option.label}</h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{option.description}</p>
                  {selections.sidebar === option.key && (
                    <span className="inline-block mt-2 px-2 py-1 rounded text-xs font-medium" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                      Selected
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dashboard Section */}
        {activeSection === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
              {t('dashboard')}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {dashboardOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setSelections(prev => ({ ...prev, dashboard: option.key }))}
                  className="p-4 rounded-xl text-left transition-all"
                  style={{
                    background: 'var(--card)',
                    border: selections.dashboard === option.key ? '2px solid var(--primary)' : '1px solid var(--border)',
                  }}
                >
                  {/* Preview */}
                  <div className="h-40 rounded-lg mb-3 p-2" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
                    {option.key === 'b1' && (
                      <>
                        <div className="flex gap-2 mb-2">
                          {[1,2,3,4].map(i => (
                            <div key={i} className="flex-1 h-10 rounded" style={{ background: 'var(--card)', border: '1px solid var(--border)' }} />
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {[1,2,3,4].map(i => (
                            <div key={i} className="h-12 rounded" style={{ background: 'var(--card)', border: '1px solid var(--border)' }} />
                          ))}
                        </div>
                      </>
                    )}
                    {option.key === 'b2' && (
                      <div className="flex gap-2 h-full">
                        <div className="flex-1 flex flex-col gap-2">
                          {[1,2,3].map(i => (
                            <div key={i} className="flex-1 rounded" style={{ background: 'var(--card)', border: '1px solid var(--border)' }} />
                          ))}
                        </div>
                        <div className="w-20 rounded p-1" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                          <div className="text-[8px] font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Stats</div>
                          {[1,2,3].map(i => (
                            <div key={i} className="h-4 rounded mb-1" style={{ background: 'var(--border)' }} />
                          ))}
                        </div>
                      </div>
                    )}
                    {option.key === 'b3' && (
                      <>
                        <div className="h-16 rounded mb-2 flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
                          <span className="text-white text-xs font-medium">Welcome Hero</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {[1,2,3].map(i => (
                            <div key={i} className="h-14 rounded flex items-center justify-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                              <div className="w-6 h-6 rounded" style={{ background: 'var(--primary)' }} />
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <h3 className="font-semibold" style={{ color: 'var(--text)' }}>{option.label}</h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{option.description}</p>
                  {selections.dashboard === option.key && (
                    <span className="inline-block mt-2 px-2 py-1 rounded text-xs font-medium" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                      Selected
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Data Display Section */}
        {activeSection === 'dataDisplay' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
              {t('dataDisplay')}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {dataOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setSelections(prev => ({ ...prev, dataDisplay: option.key }))}
                  className="p-4 rounded-xl text-left transition-all"
                  style={{
                    background: 'var(--card)',
                    border: selections.dataDisplay === option.key ? '2px solid var(--primary)' : '1px solid var(--border)',
                  }}
                >
                  {/* Preview */}
                  <div className="h-40 rounded-lg mb-3 p-2 overflow-hidden" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
                    {option.key === 'd1' && (
                      <div className="rounded overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                        <div className="flex gap-2 p-2 text-[8px] font-semibold" style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                          <span className="flex-1">Code</span>
                          <span className="flex-1">Client</span>
                          <span className="w-12">Status</span>
                        </div>
                        {[1,2,3].map(i => (
                          <div key={i} className="flex gap-2 p-2 text-[8px]" style={{ borderBottom: '1px solid var(--border)', color: 'var(--text)' }}>
                            <span className="flex-1">CAS-00{i}</span>
                            <span className="flex-1">Client {i}</span>
                            <span className="w-12 h-3 rounded-full" style={{ background: i === 1 ? 'var(--success-light)' : 'var(--warning-light)' }} />
                          </div>
                        ))}
                      </div>
                    )}
                    {option.key === 'd2' && (
                      <div className="flex flex-col gap-2">
                        {[1,2,3].map(i => (
                          <div key={i} className="p-2 rounded" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                            <div className="flex justify-between items-start">
                              <div className="text-[8px]" style={{ color: 'var(--text)' }}>CAS-00{i}</div>
                              <span className="w-12 h-3 rounded-full" style={{ background: i === 1 ? 'var(--success-light)' : 'var(--warning-light)' }} />
                            </div>
                            <div className="text-[8px] mt-1" style={{ color: 'var(--text-muted)' }}>Client {i}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {option.key === 'd3' && (
                      <div className="text-center p-4">
                        <div className="text-[10px] mb-2" style={{ color: 'var(--text)' }}>Table on Desktop</div>
                        <div className="text-[8px]" style={{ color: 'var(--text-muted)' }}>Cards on Mobile</div>
                        <div className="text-[10px] mt-2" style={{ color: 'var(--primary)' }}>Best of both!</div>
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold" style={{ color: 'var(--text)' }}>{option.label}</h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{option.description}</p>
                  {selections.dataDisplay === option.key && (
                    <span className="inline-block mt-2 px-2 py-1 rounded text-xs font-medium" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                      Selected
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Nav Section */}
        {activeSection === 'mobileNav' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
              {t('mobileNav')}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {mobileOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setSelections(prev => ({ ...prev, mobileNav: option.key }))}
                  className="p-4 rounded-xl text-left transition-all"
                  style={{
                    background: 'var(--card)',
                    border: selections.mobileNav === option.key ? '2px solid var(--primary)' : '1px solid var(--border)',
                  }}
                >
                  {/* Preview - Mobile Frame */}
                  <div className="h-48 w-24 mx-auto rounded-xl mb-3 overflow-hidden flex flex-col" style={{ background: 'var(--background)', border: '2px solid var(--border)' }}>
                    <div className="flex-1 p-1">
                      <div className="w-full h-full rounded" style={{ background: 'var(--card)' }} />
                    </div>
                    {option.key === 'e1' && (
                      <div className="h-8 flex items-center justify-around px-1" style={{ background: 'var(--card)', borderTop: '1px solid var(--border)' }}>
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className="w-3 h-3 rounded" style={{ background: i === 1 ? 'var(--primary)' : 'var(--border)' }} />
                        ))}
                      </div>
                    )}
                    {option.key === 'e2' && (
                      <div className="h-6 flex items-center px-2" style={{ background: 'var(--card)', borderTop: '1px solid var(--border)' }}>
                        <div className="w-4 h-3 flex flex-col gap-0.5">
                          <div className="w-full h-0.5 rounded" style={{ background: 'var(--text)' }} />
                          <div className="w-full h-0.5 rounded" style={{ background: 'var(--text)' }} />
                          <div className="w-full h-0.5 rounded" style={{ background: 'var(--text)' }} />
                        </div>
                      </div>
                    )}
                    {option.key === 'e3' && (
                      <div className="absolute bottom-2 right-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs" style={{ background: 'var(--primary)' }}>
                          +
                        </div>
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-center" style={{ color: 'var(--text)' }}>{option.label}</h3>
                  <p className="text-sm mt-1 text-center" style={{ color: 'var(--text-muted)' }}>{option.description}</p>
                  {selections.mobileNav === option.key && (
                    <div className="text-center mt-2">
                      <span className="inline-block px-2 py-1 rounded text-xs font-medium" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                        Selected
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selection Summary */}
        <div className="mt-12 p-6 rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Your Selections
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Sidebar</p>
              <p className="font-semibold" style={{ color: 'var(--primary)' }}>{t(`options.${selections.sidebar}`)}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Dashboard</p>
              <p className="font-semibold" style={{ color: 'var(--primary)' }}>{t(`options.${selections.dashboard}`)}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Colors</p>
              <p className="font-semibold" style={{ color: 'var(--primary)' }}>{t(`options.${selections.color}`)}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Data Display</p>
              <p className="font-semibold" style={{ color: 'var(--primary)' }}>{t(`options.${selections.dataDisplay}`)}</p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Mobile Nav</p>
              <p className="font-semibold" style={{ color: 'var(--primary)' }}>{t(`options.${selections.mobileNav}`)}</p>
            </div>
          </div>
          <button
            className="mt-6 w-full py-3 rounded-lg font-medium text-white transition-all"
            style={{ background: 'var(--primary)' }}
            onClick={() => {
              console.log('Selections:', selections);
              alert(`Selections saved!\n\nSidebar: ${selections.sidebar}\nDashboard: ${selections.dashboard}\nColor: ${selections.color}\nData Display: ${selections.dataDisplay}\nMobile Nav: ${selections.mobileNav}`);
            }}
          >
            {t('applySelection')}
          </button>
        </div>
      </div>
    </div>
  );
}
