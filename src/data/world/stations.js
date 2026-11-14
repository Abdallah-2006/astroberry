import solarPanelUrl from "../../assets/props/solar_panels.png";
import oxygenStationUrl from "../../assets/props/oxygen_station.png";
import habitatDomeUrl from "../../assets/props/habitat_dome.png";
import airlockUrl from "../../assets/props/airlock.png";
import greenhouseUrl from "../../assets/props/greenhouse.svg";
import telescopeUrl from "../../assets/props/telescope.svg";

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
    blocking: false,
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
  // Decorative additions: visual-only props with no interaction or story hooks.
  {
    id: "greenhouse-decor",
    sprite: { src: greenhouseUrl },
    x: 0.475,
    y: 484,
    scale: 0.9,
    repeat: false,
    mirror: false,
    blocking: false,
    shadow: true,
  },
  {
    id: "telescope-west-decor",
    sprite: { src: telescopeUrl },
    x: 0.505,
    y: 484,
    scale: 0.72,
    repeat: false,
    mirror: false,
    blocking: false,
    shadow: true,
  },
  {
    id: "telescope-east-decor",
    sprite: { src: telescopeUrl },
    x: 0.535,
    y: 484,
    scale: 0.72,
    repeat: false,
    mirror: false,
    blocking: false,
    shadow: true,
  },
];
