import React from 'react';
import { Helmet } from 'react-helmet-async';

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
  // Domínio do próprio site (VITE_SITE_URL quando o domínio oficial estiver ligado; senão, o endereço atual).
  const siteUrl = ((import.meta as any).env?.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://lagosgo.com.br')).replace(/\/+$/, '');
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
      {noindex && <meta name="robots" content="noindex, follow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={canonicalUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      {ld.map((j, i) => <script key={i} type="application/ld+json">{JSON.stringify(j)}</script>)}
    </Helmet>
  );
};
