import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { Facebook, Instagram, Twitter, Youtube, Linkedin, MessageCircle } from 'lucide-react';

interface FooterLink {
  text: string;
  url: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  platform: 'facebook' | 'instagram' | 'twitter' | 'youtube' | 'linkedin' | 'whatsapp';
  url: string;
}

interface FooterProps {
  columns?: FooterColumn[];
  bgColor?: string;
  textColor?: string;
  showSocial?: boolean;
  socialLinks?: SocialLink[];
  copyrightText?: string;
  logoUrl?: string;
}

const SocialIcon = ({ platform, size = 20 }: { platform: string; size?: number }) => {
  switch (platform) {
    case 'facebook':
      return <Facebook size={size} />;
    case 'instagram':
      return <Instagram size={size} />;
    case 'twitter':
      return <Twitter size={size} />;
    case 'youtube':
      return <Youtube size={size} />;
    case 'linkedin':
      return <Linkedin size={size} />;
    case 'whatsapp':
      return <MessageCircle size={size} />;
    default:
      return <Facebook size={size} />;
  }
};

export const Footer = ({
  columns = [
    {
      title: 'Empresa',
      links: [
        { text: 'Sobre nosotros', url: '#about' },
        { text: 'Contacto', url: '#contacto' },
      ],
    },
    {
      title: 'Servicios',
      links: [
        { text: 'Financiamiento', url: '#financiamiento' },
        { text: 'Garantía', url: '#garantia' },
        { text: 'Test Drive', url: '#testdrive' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { text: 'Términos', url: '#terminos' },
        { text: 'Privacidad', url: '#privacidad' },
      ],
    },
  ],
  bgColor = '#111827',
  textColor = '#9ca3af',
  showSocial = true,
  socialLinks = [
    { platform: 'facebook', url: '#' },
    { platform: 'instagram', url: '#' },
    { platform: 'whatsapp', url: '#' },
  ],
  copyrightText = '',
  logoUrl = '',
}: FooterProps) => {
  const { connectors, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const { isEnabled } = useEditor((state) => ({
    isEnabled: state.options.enabled,
  }));

  const currentYear = new Date().getFullYear();
  const finalCopyrightText =
    copyrightText || `\u00A9 ${currentYear} Todos los derechos reservados.`;

  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    if (isEnabled) {
      e.preventDefault();
      return;
    }
    if (url.startsWith('#')) {
      e.preventDefault();
      document.querySelector(url)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSocialClick = (e: React.MouseEvent, url: string) => {
    if (isEnabled) {
      e.preventDefault();
      return;
    }
  };

  return (
    <div
      ref={connectors.connect}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        position: 'relative',
        border: selected ? '2px dashed #666666' : '1px solid transparent',
        outline: selected ? '1px dashed #999999' : 'none',
        outlineOffset: selected ? '2px' : '0px',
      }}
      className='w-full'
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16'>
        {/* Top section: Logo + Columns */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12'>
          {/* Logo / Brand column */}
          <div className='lg:col-span-1'>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt='Logo'
                className='h-10 w-auto mb-4 object-contain'
              />
            ) : (
              <h3
                className='text-xl font-bold mb-4'
                style={{ color: '#ffffff' }}
              >
                &nbsp;
              </h3>
            )}
            {showSocial && socialLinks.length > 0 && (
              <div className='flex items-center gap-3 mt-4'>
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    onClick={(e) => handleSocialClick(e, social.url)}
                    className='p-2 rounded-full transition-colors duration-200 hover:opacity-80'
                    style={{
                      color: textColor,
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <SocialIcon platform={social.platform} size={18} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link columns */}
          {columns.map((column, colIndex) => (
            <div key={colIndex}>
              <h4
                className='text-sm font-semibold uppercase tracking-wider mb-4'
                style={{ color: '#ffffff' }}
              >
                {column.title}
              </h4>
              <ul className='space-y-3'>
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.url}
                      onClick={(e) => handleLinkClick(e, link.url)}
                      className='text-sm transition-colors duration-200 hover:opacity-80'
                      style={{ color: textColor }}
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div
          className='mt-10 pt-8'
          style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
        >
          <p className='text-sm text-center' style={{ color: textColor }}>
            {finalCopyrightText}
          </p>
        </div>
      </div>
    </div>
  );
};

Footer.craft = {
  displayName: 'Footer',
  props: {
    columns: [
      {
        title: 'Empresa',
        links: [
          { text: 'Sobre nosotros', url: '#about' },
          { text: 'Contacto', url: '#contacto' },
        ],
      },
      {
        title: 'Servicios',
        links: [
          { text: 'Financiamiento', url: '#financiamiento' },
          { text: 'Garantía', url: '#garantia' },
          { text: 'Test Drive', url: '#testdrive' },
        ],
      },
      {
        title: 'Legal',
        links: [
          { text: 'Términos', url: '#terminos' },
          { text: 'Privacidad', url: '#privacidad' },
        ],
      },
    ],
    bgColor: '#111827',
    textColor: '#9ca3af',
    showSocial: true,
    socialLinks: [
      { platform: 'facebook', url: '#' },
      { platform: 'instagram', url: '#' },
      { platform: 'whatsapp', url: '#' },
    ],
    copyrightText: '',
    logoUrl: '',
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => false,
  },
};
