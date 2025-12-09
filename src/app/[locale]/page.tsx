'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/database/client';
import {
  LandingHeader,
  HeroSection,
  FeaturesSection,
  StatsSection,
  PlatformPreview,
  CommunitySection,
  CTASection,
  LandingFooter,
} from '@/components/landing';

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setIsLoggedIn(!!user);
      } catch (error) {
        // Supabase unreachable, continue as logged out
        console.warn('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Fixed Header */}
      <LandingHeader isLoggedIn={isLoggedIn} isLoading={isLoading} />

      {/* Main Content */}
      <main>
        {/* Hero Section - Full viewport height with animated elements */}
        <HeroSection isLoggedIn={isLoggedIn} />

        {/* Features Grid - Showcases all platform capabilities */}
        <FeaturesSection />

        {/* Stats Banner - Trust indicators with numbers */}
        <StatsSection />

        {/* Platform Preview - Dashboard mockup */}
        <PlatformPreview />

        {/* Community Section - Partner network benefits */}
        <CommunitySection />

        {/* Call to Action - Final conversion section */}
        <CTASection isLoggedIn={isLoggedIn} />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
