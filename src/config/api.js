/**
 * API base URL for Cloudflare Pages / Vercel / local dev.
 * - Local dev: leave VITE_API_URL empty (Vite proxy handles /api)
 * - Cloudflare Pages: set VITE_API_URL=https://api.your-domain.com at build time
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const WEBSITE_API_BASE = `${API_BASE_URL}/api/website`;
export const ADMIN_API_BASE = `${API_BASE_URL}/api/admin`;

export const isCloudflareProductionBuild =
  import.meta.env.PROD && Boolean(import.meta.env.VITE_API_URL);
