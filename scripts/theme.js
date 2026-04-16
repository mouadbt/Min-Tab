const isFirefox = typeof browser !== 'undefined';

export const changeTheme = async (themeName) => {
  const root = document.documentElement;

  if (themeName === 'light') {
    root.style.setProperty('--background', '#ffffff');
    root.style.setProperty('--foreground', 'hsl(0, 0%, 10%)');
    root.style.setProperty('--foreground50', 'hsl(0, 0%, 50%)');
    root.style.setProperty('--foreground75', 'hsl(0, 0%, 85%)');

  } else if (themeName === 'browser' && isFirefox) {
    
    // Get firefox based browsers theme colors
    const c = (await browser.theme.getCurrent()).colors;
    
    // Apply colors to our ui by ovverding the css variables
    root.style.setProperty('--background', c.ntp_background);
    root.style.setProperty('--foreground', c.ntp_text);
    root.style.setProperty('--foreground50', c.icons);
    root.style.setProperty('--foreground75', c.ntp_card_background);

  } else {
    root.style.setProperty('--background', '#000000');
    root.style.setProperty('--foreground', 'hsl(0, 0%, 80%)');
    root.style.setProperty('--foreground50', 'hsl(0, 0%, 25%)');
    root.style.setProperty('--foreground75', 'hsl(0, 0%, 5%)');
  }
};