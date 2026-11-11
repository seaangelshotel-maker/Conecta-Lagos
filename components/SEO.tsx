import React from 'react';
import { Helmet } from 'react-helmet-async';
import { OFFICIAL_SITE_URL } from '../services/seoRoutes';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  /** Dados estruturados (schema.org) desta página. */
  jsonLd?: object | object[];
  noindex?: boolean;
}

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = 'website',
  jsonLd,
  noindex,
}) => {
  const siteTitle = 'Lagos GO';
  const fullTitle = title ? (title.includes(siteTitle) ? title : `${title} | ${siteTitle}`) : `Lagos GO — Guia da Região dos Lagos`;
  const defaultDescription = 'O guia definitivo da Região dos Lagos. Encontre os melhores lugares, cupons de desconto exclusivos e notícias locais.';
  // Sempre o domínio oficial no canônico (mesmo aberto pelo endereço técnico da Vercel); localhost fica como está.
  const isLocal = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
  const siteUrl = (((import.meta as any).env?.VITE_SITE_URL as string | undefined) || (isLocal ? window.location.origin : OFFICIAL_SITE_URL)).replace(/\/+$/, '');
  const defaultImage = `${siteUrl}/og-image.jpg`;

  const metaDescription = description || defaultDescription;
  const metaImage = image || defaultImage;
  const path = url || (typeof window !== 'undefined' ? window.location.pathname : '/');
  const canonicalUrl = `${siteUrl}${path}`;
  const ld = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />
      {noindex ? <meta name="robots" content="noindex, follow" /> : <meta name="robots" content="index, follow, max-image-preview:large" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={canonicalUrl} />

      {/* Twitter */}
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content="pt_BR" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      {ld.map((j, i) => <script key={i} type="application/ld+json">{JSON.stringify(j)}</script>)}
    </Helmet>
  );
};
