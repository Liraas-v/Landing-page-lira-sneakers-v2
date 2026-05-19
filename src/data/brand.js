export const BRAND_LOGOS = {
  dark: "/Logo-preta.png",
  light: "/Logo-branca.jpeg",
};

export function getBrandLogo(theme = "dark") {
  return theme === "light" ? BRAND_LOGOS.light : BRAND_LOGOS.dark;
}
