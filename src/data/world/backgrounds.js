import jezeroUrl from "../../assets/world/jezero_surface.webp";
import meridianiUrl from "../../assets/world/meridiani_surface.webp";

/**
 * Full-width panorama layers selected by the landing-page world choice.
 * `selectedMap` is resolved in logic/profile.js and passed to getScene().
 */
export const BACKGROUNDS_BY_MAP = {
  jezero: [{ id: "surface", src: jezeroUrl, sortY: null }],
  meridiani: [{ id: "surface", src: meridianiUrl, sortY: null }],
};

export function backgroundsFor(mapId) {
  return BACKGROUNDS_BY_MAP[mapId] ?? BACKGROUNDS_BY_MAP.jezero;
}

export const BACKGROUNDS = BACKGROUNDS_BY_MAP.jezero;
