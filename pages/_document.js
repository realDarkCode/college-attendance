import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('theme');
                  const themes = ['light', 'dark', 'dracula', 'nord', 'monokai', 'darkcode', 'ocean', 'forest'];
                  let theme;
                  
                  if (savedTheme && themes.includes(savedTheme)) {
                    theme = savedTheme;
                  } else {
                    // Default to dark theme instead of system preference
                    theme = 'dark';
                  }
                  
                  // Apply theme to document
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else if (theme !== 'light') {
                    document.documentElement.setAttribute('data-theme', theme);
                  }
                } catch (e) {
                  // Fallback to light theme if there's any error
                  console.error('Theme initialization error:', e);
                }
              })();
            `,
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
