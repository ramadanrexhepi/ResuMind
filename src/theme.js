let mediaQuery;
let mediaListener;

export function getSystemTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function attachAutoListener() {
  if (typeof window === 'undefined' || !window.matchMedia) return;
  if (!mediaQuery) {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  }
  if (!mediaListener) {
    mediaListener = () => {
      const next = mediaQuery.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
    };
  }
  mediaQuery.addEventListener?.('change', mediaListener);
}

function detachAutoListener() {
  if (mediaQuery && mediaListener) {
    mediaQuery.removeEventListener?.('change', mediaListener);
  }
}

export function applyTheme(theme) {
  const effective = theme === 'auto' ? getSystemTheme() : (theme || 'light');
  document.documentElement.setAttribute('data-theme', effective);
  if (theme === 'auto') attachAutoListener();
  else detachAutoListener();
}

