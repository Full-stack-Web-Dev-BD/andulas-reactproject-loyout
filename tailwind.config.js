module.exports = {
  mode: 'jit',
  important: true,
  corePlugins: {
    preflight: false,
  },
  purge: [
    './public/**/*',
    './src/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/layouts/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      maxWidth: '1366px',
      padding: '1rem',
    },
    screens: {
      '2xl': {'max': '1535px'},
      // => @media (max-width: 1535px) { ... }
      '2xl-min': {'min': '1535px'},
      // => @media (min-width: 1535px) { ... }
      'xl': {'max': '1279px'},
      // => @media (max-width: 1279px) { ... }
      'xl-min': { 'min': '1280px' },
      // => @media (min-width: 1279px) { ... }
      
      'xl-min': {'min': '1279px'},
      // => @media (min-width: 1279px) { ... }
      'lg': {'max': '1023px'},
      // => @media (max-width: 1023px) { ... }

      'md': {'max': '767px'},
      // => @media (max-width: 767px) { ... }

      'sm': {'max': '639px'},
      // => @media (max-width: 639px) { ... }
    },
    extend: {
      colors: {
        'main-color': 'var(--main-color)',
        'andalus-green': 'var(--main-green)',
        'andalus-border': 'var(--andalus-border)',
        'main-search-bar': 'var(--main-search-bar)',
        'andalus-gray': 'var(--main-gray)',
        'andalus-black': 'var(--main-black)',
        'main-left-menu-bg': 'var(--main-left-menu-bg-bar)',
        'main-left-menu-extend-bg': 'var(--main-left-menu-extend-bg-bar)',
        'main-left-menu-color': 'var(--main-left-menu-font-icon)',
        'main-left-menu-highlight-color': 'var(--main-left-menu-highlight-color)',
        'main-left-menu-highlight-stripe-color': 'var(--main-left-menu-highlight-stripe-color)',
        'main-top-menu-bar': 'var(--main-top-menu-bar)',
        'main-button-color': 'var(--main-button-color)',
        'main-background-color': 'var(--main-background-color)',
        'main-font-color': 'var(--main-font-color)',
        'main-button-text-color': 'var(--main-button-text-color)',
        'main-extend-narrow-bg': 'var(--main-extend-narrow-bg)',
        'main-profile-drawer-bg': 'var(--main-profile-drawer-bg)',
        'main-layout-background-color': 'var(--main-layout-background-color)',

        'preview-theme-left-menu-bg': 'var(--preview-theme-left-menu-bg-bar)',
        'preview-theme-left-menu-extend-bg': 'var(--preview-theme-left-menu-extend-bg-bar)',
        'preview-theme-left-menu-color': 'var(--preview-theme-left-menu-font-icon)',
        'preview-theme-left-menu-highlight-color': 'var(--preview-theme-left-menu-highlight-color)',
        'preview-theme-left-menu-highlight-stripe-color':
          'var(--preview-theme-left-menu-highlight-stripe-color)',
        'preview-theme-search-bar': 'var(--preview-theme-search-bar)',
        'preview-theme-top-menu-bar': 'var(--preview-theme-top-menu-bar)',
        'preview-theme-button-color': 'var(--preview-theme-button-color)',
        'preview-theme-background-color': 'var(--preview-theme-background-color)',
        'preview-theme-font-color': 'var(--preview-theme-font-color)',
        'preview-theme-button-text-color': 'var(--preview-theme-button-text-color)',
        'preview-theme-extend-narrow-bg': 'var(--preview-theme-extend-narrow-bg)',
        'preview-theme-profile-drawer-bg': 'var(--preview-theme-profile-drawer-bg)',
        'preview-theme-layout-background-color': 'var(--preview-theme-layout-background-color)',
        link: '#808E9B',
      },
      fontSize: {
        xxs: '0.75rem',
      },
      lineHeight: {
        heading: '1.2',
      },
      fontFamily: {
        meriweather: ['Merriweather', 'Arial', 'sans-serif'],
        montserrat: ['Montserrat', 'Arial', 'sans-serif'],
        fontFamily: 'var(--main-font-family)',
        previewFontFamily: 'var(--preview-theme-font-family)',
      },
      opacity: {
        95: '95%',
      },
    },
  },
  variants: {
    extend: {
      textColor: ['visited'],
      colors: ['focus'],
    },
  },
  plugins: [],
};
