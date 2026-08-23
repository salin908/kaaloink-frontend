import { useEffect } from 'react';

export default function SEO({ title, description, path = '', image = '/images/logo.png' }) {
  useEffect(() => {
    // 1. Dynamic Page Title
    const siteName = 'Kaalo Ink Tattoo Studio';
    const fullTitle = title ? `${title} | ${siteName}` : 'Kaalo Ink Tattoo Studio | Tattoo Art & Courses in Dharan, Nepal';
    document.title = fullTitle;

    // 2. Dynamic Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && description) {
      metaDesc.setAttribute('content', description);
    }

    // 3. Dynamic Open Graph Tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', fullTitle);
    }

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && description) {
      ogDesc.setAttribute('content', description);
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', `https://www.kaaloink.com.np${path}`);
    }

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && image) {
      const fullImg = image.startsWith('http') ? image : `https://www.kaaloink.com.np${image}`;
      ogImage.setAttribute('content', fullImg);
    }

    // 4. Dynamic Canonical Link Tag
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', `https://www.kaaloink.com.np${path}`);
    }
  }, [title, description, path, image]);

  return null;
}
