import React from 'react';
import Hero from '@/components/sections/Hero';
import RevealHero from '@/components/sections/RevealHero';
import AccordionSection from '@/components/sections/AccordionSection';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Hero />
      <RevealHero />
      <AccordionSection />
    </main>
  );
}
