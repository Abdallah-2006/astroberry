import solarPanelUrl from "../../assets/props/solar_panels.png";
import oxygenStationUrl from "../../assets/props/oxygen_station.png";
import habitatDomeUrl from "../../assets/props/habitat_dome.png";
import airlockUrl from "../../assets/props/airlock.png";
import greenhouseUrl from "../../assets/props/greenhouse.png";
import telescopeUrl from "../../assets/props/telescope.png";
import radarDishUrl from "../../assets/props/radar_dish.png";
import storageCrateUrl from "../../assets/props/storage_crate.png";
import oreCrystalUrl from "../../assets/props/ore_crystal.png";

/**
 * Unique outpost stations. `repeat` and `mirror` are off so each interactive
 * target exists exactly once and never gets a duplicate in the mirrored world.
 *
 * `x` is a fraction of the world repeat period. The three stations are spaced
 * out so none of them crowds the lander or each other — there is a clear gap
 * of roughly 45px between the edge of one prop and the edge of the next.
 */
export const OUTPOST_STATIONS = [
  {
    id: "power-junction",
    sprite: { src: solarPanelUrl },
    x: 0.3030,
    y: 400,
    scale: 1.15,
    repeat: false,
    mirror: false,
    blocking: true,
    footR: 30,
    shadow: true,
    behavior: { type: "station", config: { seconds: 2.0 } },
    interactive: {
      kind: "inspect",
      targetId: "power_junction",
      label: "Inspect power",
    },
  },
  {
    id: "life-support",
    sprite: { src: oxygenStationUrl },
    x: 0.3560,
    y: 484,
    scale: 1.15,
    repeat: false,
    mirror: false,
    blocking: true,
    footR: 30,
    shadow: true,
    behavior: { type: "station", config: { seconds: 2.0 } },
    interactive: {
      kind: "inspect",
      targetId: "life_support",
      label: "Check life support",
    },
  },
  {
    id: "airlock",
    sprite: { src: airlockUrl },
    x: 0.4450,
    y: 484,
    scale: 1.35,
    repeat: false,
    mirror: false,
    blocking: true,
    footR: 38,
    shadow: true,
  },
  {
    id: "habitat-dome",
    sprite: { src: habitatDomeUrl },
    x: 0.4070,
    y: 400,
    scale: 1.25,
    repeat: false,
    mirror: false,
    blocking: true,
    footR: 58,
    shadow: true,
    behavior: { type: "station", config: { seconds: 2.0 } },
    interactive: {
      kind: "inspect",
      targetId: "habitat",
      label: "Inspect habitat",
    },
  },
  // Decorative-only props: collision-blocking, but no interaction or story hooks.
  // Greenhouse sits slightly behind the main station line.
  {
    id: "greenhouse-decor",
    sprite: { src: greenhouseUrl },
    x: 0.372,
    y: 448,
    scale: 1.22,
    repeat: false,
    mirror: false,
    blocking: true,
    footR: 48,
    shadow: true,
  },
  // Two telescopes remain as light decoration at different depths.
  {
    id: "telescope-back-west-decor",
    sprite: { src: telescopeUrl },
    x: 0.275,
    y: 448,
    scale: 0.58,
    repeat: false,
    mirror: false,
    blocking: true,
    footR: 20,
    shadow: true,
  },
  {
    id: "telescope-front-east-decor",
    sprite: { src: telescopeUrl },
    x: 0.615,
    y: 488,
    scale: 0.82,
    repeat: false,
    mirror: false,
    blocking: true,
    footR: 20,
    shadow: true,
  },
  // Communications radar beside the lander, to the left of the rocket.
  {
    id: "landing-radar-decor",
    sprite: { src: radarDishUrl },
    x: 0.211,
    y: 492,
    scale: 0.78,
    repeat: false,
    mirror: false,
    blocking: true,
    footR: 24,
    shadow: true,
  },
  // Small outpost details to make use of the wider terrain without crowding stations.
  {
    id: "supply-crate-decor",
    sprite: { src: storageCrateUrl },
    x: 0.535,
    y: 490,
    scale: 0.58,
    repeat: false,
    mirror: false,
    blocking: true,
    footR: 18,
    shadow: true,
  },
  {
    id: "ore-crystal-decor",
    sprite: { src: oreCrystalUrl },
    x: 0.665,
    y: 474,
    scale: 0.62,
    repeat: false,
    mirror: false,
    blocking: true,
    footR: 17,
    shadow: true,
  },
];
