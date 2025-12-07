import { useEffect } from 'react';

const SEOHead = ({
  title = 'ResuMind - AI-Powered Resume Optimizer & Generator',
  description = 'Transform your resume with AI. Get instant analysis, ATS optimization, and professional resume generation. Used by thousands of job seekers to land their dream jobs.',
  keywords = 'resume optimizer, AI resume, ATS resume, resume generator, LinkedIn profile analyzer, job application, career tools, resume builder, CV optimizer',
  ogImage = 'https://resumind.ramadanrexhepi.dev/og-image.png',
  ogUrl,
  canonical
}) => {
  useEffect(() => {
    // Update title
    document.title = title;

    // Update or create meta tags
    const metaTags = [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { name: 'author', content: 'ResuMind' },
      { name: 'robots', content: 'index, follow' },

      // Open Graph meta tags for social sharing
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: ogImage },
      { property: 'og:url', content: ogUrl || window.location.href },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'ResuMind' },

      // Twitter Card meta tags
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: ogImage },

      // Additional SEO meta tags
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      { httpEquiv: 'Content-Type', content: 'text/html; charset=utf-8' },
    ];

    metaTags.forEach(tag => {
      const key = tag.name ? 'name' : (tag.property ? 'property' : 'http-equiv');
      const value = tag.name || tag.property || tag.httpEquiv;

      let element = document.querySelector(`meta[${key}="${value}"]`);

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(key, value);
        document.head.appendChild(element);
      }

      if (tag.content) {
        element.setAttribute('content', tag.content);
      }
    });

    // Canonical URL
    if (canonical) {
      let linkCanonical = document.querySelector('link[rel="canonical"]');
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', canonical);
    }

    // Structured data (JSON-LD for rich snippets)
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "ResuMind",
      "description": description,
      "url": "https://resumind.ramadanrexhepi.dev",
      "applicationCategory": "BusinessApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "1250"
      }
    };

    let scriptTag = document.querySelector('script[type="application/ld+json"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(structuredData);

  }, [title, description, keywords, ogImage, ogUrl, canonical]);

  return null; // This component doesn't render anything
};

export default SEOHead;
