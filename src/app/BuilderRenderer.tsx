'use client';

import React from 'react';
import { Editor, Frame } from '@craftjs/core';

// =====================
// Componentes del builder
// =====================
import { Container } from '@/components/builder2/userComponents/Container';
import { Text } from '@/components/builder2/userComponents/Text';
import { Image } from '@/components/builder2/userComponents/Image';
import { HeroBasic, HeroWithBackground, HeroWithLogo, HeroWelcome } from '@/components/builder2/sections/initialfold';
import { HeroMinimalistic } from '@/components/builder2/sections/initialfold/HeroMinimalistic';
import { VehicleGrid } from '@/components/builder2/sections/vehicles';
import { VehicleGrid2 } from '@/components/builder2/sections/vehicles/VehicleGrid2';
import { VehicleCarousel } from '@/components/builder2/sections/vehicles/VehicleCarousel';
import { TraditionalVehicleGrid } from '@/components/builder2/sections/vehicles/TraditionalVehicleGrid';
import { Testimonials } from '@/components/builder2/sections/testimonials';
import { FAQ, WhyChooseUs } from '@/components/builder2/sections/features';
import { TraditionalWhyUs } from '@/components/builder2/sections/features/TraditionalWhyUs';
import { VideoEmbed } from '@/components/builder2/sections/videos/VideoEmbed';
import { ContactCTA } from '@/components/builder2/sections/contact/ContactCTA';
import { TraditionalContactCTA as BuilderTraditionalContactCTA } from '@/components/builder2/sections/contact/TraditionalContactCTA';
import HowToArrive from '@/sections/home/HowToArrive';
import { TraditionalHowToArrive } from '@/components/builder2/sections/contact/TraditionalHowToArrive';
// Moderna sections
import { HeroModerno } from '@/components/builder2/sections/moderna/HeroModerno';
import { StatsModerno } from '@/components/builder2/sections/moderna/StatsModerno';
import { TestimonialsModerno } from '@/components/builder2/sections/moderna/TestimonialsModerno';
import { CTAModerno } from '@/components/builder2/sections/moderna/CTAModerno';
import { FooterModerno } from '@/components/builder2/sections/moderna/FooterModerno';
// Premium sections
import { HeroPremium } from '@/components/builder2/sections/premium/HeroPremium';
import { FeatureShowcase } from '@/components/builder2/sections/premium/FeatureShowcase';
import { TestimonialsPremium } from '@/components/builder2/sections/premium/TestimonialsPremium';
import { GalleryPremium } from '@/components/builder2/sections/premium/GalleryPremium';
import { CTAPremium } from '@/components/builder2/sections/premium/CTAPremium';
// Additional sections
// Nav and Footer are always rendered by layout — builder versions render nothing to avoid duplicates
const BuilderNavbar: React.FC = () => null;
(BuilderNavbar as any).craft = { displayName: 'BuilderNavbar', props: {}, rules: {} };
const FooterNoop: React.FC = () => null;
(FooterNoop as any).craft = { displayName: 'Footer', props: {}, rules: {} };
import { StatsCounter } from '@/components/builder2/sections/marketing/StatsCounter';
import { PromoBanner } from '@/components/builder2/sections/marketing/PromoBanner';
import { PhotoGallery } from '@/components/builder2/sections/media/PhotoGallery';
import { TeamMembers } from '@/components/builder2/sections/team/TeamMembers';

// =====================
// Fallback seguro
// =====================
const Unknown: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <div style={{ display: 'contents' }}>{children}</div>
);
// @ts-ignore
(Unknown as any).craft = {
  displayName: 'Unknown',
  isCanvas: true,
  rules: {},
  props: {},
};

// =====================
// Resolver con Proxy
// =====================
export const baseResolver: Record<string, any> = {
  Container, Text, Image,
  HeroBasic, HeroWithBackground, HeroWithLogo, HeroWelcome, HeroMinimalistic,
  VehicleGrid, VehicleGrid2, VehicleCarousel, TraditionalVehicleGrid,
  WhyChooseUs, FAQ, Testimonials, TraditionalWhyUs,
  ContactCTA, TraditionalContactCTA: BuilderTraditionalContactCTA,
  HowToArrive, TraditionalHowToArrive,
  VideoEmbed,
  HeroModerno, StatsModerno, TestimonialsModerno, CTAModerno, FooterModerno,
  HeroPremium, FeatureShowcase, TestimonialsPremium, GalleryPremium, CTAPremium,
  BuilderNavbar, Footer: FooterNoop, StatsCounter, PromoBanner, PhotoGallery, TeamMembers,
  div: Unknown, p: Unknown, span: Unknown, img: Unknown, Unknown,
};

const resolver = new Proxy(baseResolver, {
  get(target, prop: string) {
    return prop in target ? (target as any)[prop] : Unknown;
  },
});

// =====================
// Error Boundary para Builder
// =====================
class BuilderErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// =====================
// BuilderRenderer
// =====================
export default function BuilderRenderer({
  data,
  themeKey,
  fallback,
}: {
  data: any;
  themeKey: string;
  fallback: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <BuilderErrorBoundary fallback={fallback}>
        <Editor key={themeKey} resolver={resolver} enabled={false}>
          <Frame data={data} />
        </Editor>
      </BuilderErrorBoundary>
    </div>
  );
}
