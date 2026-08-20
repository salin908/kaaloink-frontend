export const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:5000/api';

export const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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