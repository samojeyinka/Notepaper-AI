import { getTheme } from "./themes";

// Returns a very soft tint derived from the slide's effective background.
export const getCanvasBg = (slide, themeId) => {
    const t = getTheme(themeId);
    const activeBg = (slide?.bgColor) || (slide?.layout === 'closing' ? t.closingBg : t.bg);
    const m = activeBg.match(/#([a-f0-9]{6})/i);
    if (!m) return '#e8eaed';
    const r = parseInt(m[1].slice(0,2),16);
    const g = parseInt(m[1].slice(2,4),16);
    const b = parseInt(m[1].slice(4,6),16);
    // Blend 14% of the slide color into a light neutral base (218)
    const mix = (c) => Math.round(c * 0.14 + 218 * 0.86);
    return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
};