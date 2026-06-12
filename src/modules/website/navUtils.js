/** React Router `to` for nav links — hash anchors always route via home. */
export function navLinkTo(href) {
  if (!href) return '/';
  if (href.startsWith('#')) {
    return { pathname: '/', hash: href.slice(1) };
  }
  return href;
}

export function scrollToSection(hash) {
  if (!hash) return;
  const id = hash.replace(/^#/, '');
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
