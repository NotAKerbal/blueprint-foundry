import type { FactorioDirection, FactorioEntityName } from "@t3tools/contracts";

export interface FactorioEntityDefinition {
  readonly label: string;
  readonly short: string;
  readonly width: number;
  readonly height: number;
  readonly color: string;
  readonly kind: "belt" | "inserter" | "machine" | "power" | "container" | "fluid";
}

const belt = (label: string, color: string): FactorioEntityDefinition => ({
  label,
  short: "B",
  width: 1,
  height: 1,
  color,
  kind: "belt",
});

const machine = (
  label: string,
  short: string,
  width: number,
  height: number,
  color: string,
): FactorioEntityDefinition => ({ label, short, width, height, color, kind: "machine" });

export const FACTORIO_ENTITY_CATALOG: Record<FactorioEntityName, FactorioEntityDefinition> = {
  "transport-belt": belt("Transport belt", "#d39a32"),
  "fast-transport-belt": belt("Fast belt", "#c84c3f"),
  "express-transport-belt": belt("Express belt", "#3e82bd"),
  "underground-belt": { ...belt("Underground belt", "#d39a32"), short: "U" },
  "fast-underground-belt": { ...belt("Fast underground", "#c84c3f"), short: "U" },
  "express-underground-belt": { ...belt("Express underground", "#3e82bd"), short: "U" },
  splitter: { ...belt("Splitter", "#d39a32"), short: "S", width: 2 },
  "fast-splitter": { ...belt("Fast splitter", "#c84c3f"), short: "S", width: 2 },
  "express-splitter": { ...belt("Express splitter", "#3e82bd"), short: "S", width: 2 },
  inserter: {
    label: "Inserter",
    short: "I",
    width: 1,
    height: 1,
    color: "#d4b238",
    kind: "inserter",
  },
  "long-handed-inserter": {
    label: "Long inserter",
    short: "L",
    width: 1,
    height: 1,
    color: "#b94b3b",
    kind: "inserter",
  },
  "fast-inserter": {
    label: "Fast inserter",
    short: "I",
    width: 1,
    height: 1,
    color: "#438ac9",
    kind: "inserter",
  },
  "bulk-inserter": {
    label: "Bulk inserter",
    short: "I",
    width: 1,
    height: 1,
    color: "#5aa77b",
    kind: "inserter",
  },
  "assembling-machine-1": machine("Assembler 1", "A1", 3, 3, "#89959b"),
  "assembling-machine-2": machine("Assembler 2", "A2", 3, 3, "#4c86a8"),
  "assembling-machine-3": machine("Assembler 3", "A3", 3, 3, "#c7a344"),
  "stone-furnace": machine("Stone furnace", "F", 2, 2, "#81786d"),
  "steel-furnace": machine("Steel furnace", "F", 2, 2, "#929ca0"),
  "electric-furnace": machine("Electric furnace", "EF", 3, 3, "#b5834b"),
  "electric-mining-drill": machine("Mining drill", "MD", 3, 3, "#6b8c73"),
  pumpjack: {
    label: "Pumpjack",
    short: "PJ",
    width: 3,
    height: 3,
    color: "#777f75",
    kind: "fluid",
  },
  "chemical-plant": {
    label: "Chemical plant",
    short: "CP",
    width: 3,
    height: 3,
    color: "#6d9678",
    kind: "fluid",
  },
  "oil-refinery": {
    label: "Oil refinery",
    short: "OR",
    width: 5,
    height: 5,
    color: "#7a8276",
    kind: "fluid",
  },
  centrifuge: machine("Centrifuge", "C", 3, 3, "#6c9b62"),
  lab: machine("Lab", "LAB", 3, 3, "#9a8069"),
  beacon: machine("Beacon", "BC", 3, 3, "#8272a0"),
  "wooden-chest": {
    label: "Wooden chest",
    short: "C",
    width: 1,
    height: 1,
    color: "#9b7047",
    kind: "container",
  },
  "iron-chest": {
    label: "Iron chest",
    short: "C",
    width: 1,
    height: 1,
    color: "#8d9798",
    kind: "container",
  },
  "steel-chest": {
    label: "Steel chest",
    short: "C",
    width: 1,
    height: 1,
    color: "#a8afb0",
    kind: "container",
  },
  "passive-provider-chest": {
    label: "Provider chest",
    short: "P",
    width: 1,
    height: 1,
    color: "#a94e4a",
    kind: "container",
  },
  "requester-chest": {
    label: "Requester chest",
    short: "R",
    width: 1,
    height: 1,
    color: "#4779a9",
    kind: "container",
  },
  "small-electric-pole": {
    label: "Small pole",
    short: "+",
    width: 1,
    height: 1,
    color: "#9f7951",
    kind: "power",
  },
  "medium-electric-pole": {
    label: "Medium pole",
    short: "+",
    width: 1,
    height: 1,
    color: "#9a8267",
    kind: "power",
  },
  "big-electric-pole": {
    label: "Big pole",
    short: "+",
    width: 2,
    height: 2,
    color: "#85725f",
    kind: "power",
  },
  substation: {
    label: "Substation",
    short: "+",
    width: 2,
    height: 2,
    color: "#7f715e",
    kind: "power",
  },
  pipe: { label: "Pipe", short: "P", width: 1, height: 1, color: "#8d9691", kind: "fluid" },
  "pipe-to-ground": {
    label: "Pipe to ground",
    short: "U",
    width: 1,
    height: 1,
    color: "#8d9691",
    kind: "fluid",
  },
  "storage-tank": {
    label: "Storage tank",
    short: "T",
    width: 3,
    height: 3,
    color: "#777f7d",
    kind: "fluid",
  },
  pump: { label: "Pump", short: "P", width: 1, height: 2, color: "#73827e", kind: "fluid" },
  boiler: { label: "Boiler", short: "BL", width: 3, height: 2, color: "#7e7265", kind: "fluid" },
  "steam-engine": machine("Steam engine", "SE", 5, 3, "#767e7b"),
  "solar-panel": {
    label: "Solar panel",
    short: "SP",
    width: 3,
    height: 3,
    color: "#536b7e",
    kind: "power",
  },
  accumulator: {
    label: "Accumulator",
    short: "AC",
    width: 2,
    height: 2,
    color: "#837b62",
    kind: "power",
  },
};

export function factorioFootprint(name: FactorioEntityName, direction: FactorioDirection) {
  const definition = FACTORIO_ENTITY_CATALOG[name];
  return direction === 4 || direction === 12
    ? { width: definition.height, height: definition.width }
    : { width: definition.width, height: definition.height };
}
