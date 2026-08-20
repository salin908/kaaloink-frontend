const rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').trim();
const cleanBaseUrl = rawApiUrl.replace(/\/+$/, '').replace(/\/api$/i, '');

export const SERVER_URL = cleanBaseUrl;
export const API_BASE_URL = `${cleanBaseUrl}/api`;

export const getImageUrl = (url) => {
  if (!url) return '/images/hero1.jpg';
  if (typeof url === 'object') {
    url = url.image || url.imageUrl || url.image_url || '/images/hero1.jpg';
  }
  if (typeof url !== 'string') return '/images/hero1.jpg';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/')) return `${SERVER_URL}${url}`;
  return url;
};