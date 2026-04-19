'use client';
import { useState } from 'react';
import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Welcome from '@/components/Welcome';
import Why from '@/components/Why';
import Journey from '@/components/Journey';
import Arena from '@/components/Arena';
import Sanctuary from '@/components/Sanctuary';
import { Kids, Team, Memberships, Facility, Testimonials, Contact, LeadForm, Footer, FloatingWA } from '@/components/Sections';
import Schedule from '@/components/Schedule';

export default function Home() {
  const [formOpen, setFormOpen] = useState(false);
  const open = () => setFormOpen(true);
  const close = () => setFormOpen(false);

  return (
    <main style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <Nav onCta={open} />
      <Hero onCta={open} />
      <Welcome />
      <Why />
      <Journey onCta={open} />
      <Arena />
      <Sanctuary />
      <Kids />
      <Team />
      <Facility />
      <Schedule />
      <Memberships onCta={open} />
      <Testimonials />
      <Contact onCta={open} />
      <Footer />
      <FloatingWA />
      <LeadForm isOpen={formOpen} onClose={close} />
    </main>
  );
}
