import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
}

export const SEOHead = ({ 
  title = "Jogo Digital - Descubra seu Perfil Digital",
  description = "Complete 4 missões interativas e descubra seu perfil digital. Ganhe XP, medalhas e desenvolva suas habilidades tecnológicas com nossa mentora IA.",
  keywords = "perfil digital, quiz interativo, habilidades tecnológicas, gamificação, educação digital, IA, mentoria",
  canonicalUrl = window.location.href,
  ogImage = "/og-image.jpg"
}: SEOHeadProps) => {
  
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update meta tags
    const updateMeta = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Standard meta tags
    updateMeta('description', description);
    updateMeta('keywords', keywords);
    updateMeta('viewport', 'width=device-width, initial-scale=1');
    updateMeta('robots', 'index, follow');
    updateMeta('author', 'Forvis Mazars - Jogo Digital');
    updateMeta('theme-color', '#000000');
    
    // Open Graph meta tags
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:type', 'website', true);
    updateMeta('og:url', canonicalUrl, true);
    updateMeta('og:image', ogImage, true);
    updateMeta('og:site_name', 'Jogo Digital - Forvis Mazars', true);
    updateMeta('og:locale', 'pt_BR', true);
    
    // Twitter Card meta tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', ogImage);
    
    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
    
    // Add structured data (JSON-LD)
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Jogo Digital - Perfil Digital",
      "description": description,
      "url": canonicalUrl,
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "BRL"
      },
      "author": {
        "@type": "Organization",
        "name": "Forvis Mazars",
        "url": "https://www.forvismazars.com/"
      }
    };
    
    let jsonLd = document.querySelector('script[type="application/ld+json"]');
    if (!jsonLd) {
      jsonLd = document.createElement('script');
      jsonLd.setAttribute('type', 'application/ld+json');
      document.head.appendChild(jsonLd);
    }
    jsonLd.textContent = JSON.stringify(structuredData);
    
  }, [title, description, keywords, canonicalUrl, ogImage]);

  return null; // This component doesn't render anything
};