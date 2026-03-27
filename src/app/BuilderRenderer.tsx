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

// Form imports for embed components
import FinancingForm from '@/components/forms/FinancingForm';
import ConsignmentsForm from '@/components/forms/ConsignmentsForm';
import BuyDirectForm from '@/components/forms/BuyDirectForm';
import WeSearchForm from '@/components/forms/WeSearchForm';
import ContactForm from '@/components/forms/ContactForm';

// Form embed wrappers — render actual forms on the website, passing builder props
interface FormEmbedProps {
  title?: string;
  subtitle?: string;
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
}

const FormEmbedWrapper = ({ bgColor, textColor, children }: FormEmbedProps & { children: React.ReactNode }) => (
  <div
    className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8"
    style={{ backgroundColor: bgColor, color: textColor }}
  >
    <div className="max-w-7xl mx-auto">
      {children}
    </div>
  </div>
);

const FinancingFormEmbed = (props: FormEmbedProps) => (
  <FormEmbedWrapper {...props}><FinancingForm title={props.title} subtitle={props.subtitle} bgColor={props.bgColor} textColor={props.textColor} accentColor={props.accentColor} /></FormEmbedWrapper>
);
const ConsignmentsFormEmbed = (props: FormEmbedProps) => (
  <FormEmbedWrapper {...props}><ConsignmentsForm title={props.title} subtitle={props.subtitle} bgColor={props.bgColor} textColor={props.textColor} accentColor={props.accentColor} /></FormEmbedWrapper>
);
const BuyDirectFormEmbed = (props: FormEmbedProps) => (
  <FormEmbedWrapper {...props}><BuyDirectForm title={props.title} subtitle={props.subtitle} bgColor={props.bgColor} textColor={props.textColor} accentColor={props.accentColor} /></FormEmbedWrapper>
);
const WeSearchFormEmbed = (props: FormEmbedProps) => (
  <FormEmbedWrapper {...props}><WeSearchForm title={props.title} subtitle={props.subtitle} bgColor={props.bgColor} textColor={props.textColor} accentColor={props.accentColor} /></FormEmbedWrapper>
);
const ContactFormEmbed = (props: FormEmbedProps) => (
  <FormEmbedWrapper {...props}><ContactForm title={props.title} subtitle={props.subtitle} bgColor={props.bgColor} textColor={props.textColor} accentColor={props.accentColor} /></FormEmbedWrapper>
);
const AboutContentEmbed = ({ title, subtitle, bgColor, textColor }: { title?: string; subtitle?: string; bgColor?: string; textColor?: string }) => (
  <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" style={{ backgroundColor: bgColor, color: textColor }}>
    {title && (
      <div className="text-center mb-10 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold">{title}</h1>
        {subtitle && <p className="mt-4 text-lg opacity-60">{subtitle}</p>}
      </div>
    )}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      <div className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <span className="text-xl">🎯</span>
        </div>
        <h3 className="font-semibold mb-2">Nuestra Misi&oacute;n</h3>
        <p className="text-sm opacity-70">Ofrecer la mejor experiencia en la compra y venta de veh&iacute;culos.</p>
      </div>
      <div className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <span className="text-xl">🤝</span>
        </div>
        <h3 className="font-semibold mb-2">Confianza</h3>
        <p className="text-sm opacity-70">Transparencia y honestidad en cada transacci&oacute;n.</p>
      </div>
      <div className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
          <span className="text-xl">⭐</span>
        </div>
        <h3 className="font-semibold mb-2">Excelencia</h3>
        <p className="text-sm opacity-70">Calidad y servicio premium en todo lo que hacemos.</p>
      </div>
    </div>
  </div>
);

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
  FinancingFormEmbed, ConsignmentsFormEmbed, BuyDirectFormEmbed, WeSearchFormEmbed, ContactFormEmbed, AboutContentEmbed,
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
  themeKey = 'default',
  fallback = null,
}: {
  data: any;
  themeKey?: string;
  fallback?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pt-16">
      <BuilderErrorBoundary fallback={fallback || <div />}>
        <Editor key={themeKey} resolver={resolver} enabled={false}>
          <Frame data={data} />
        </Editor>
      </BuilderErrorBoundary>
    </div>
  );
}
