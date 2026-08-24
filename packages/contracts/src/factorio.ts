import { Schema } from "effect";
import { TrimmedNonEmptyString } from "./baseSchemas";

export const FACTORIO_BLUEPRINT_FILENAME = "factorio-blueprint.json";

export const FactorioEntityName = Schema.Literals([
  "transport-belt",
  "fast-transport-belt",
  "express-transport-belt",
  "underground-belt",
  "fast-underground-belt",
  "express-underground-belt",
  "splitter",
  "fast-splitter",
  "express-splitter",
  "inserter",
  "long-handed-inserter",
  "fast-inserter",
  "bulk-inserter",
  "assembling-machine-1",
  "assembling-machine-2",
  "assembling-machine-3",
  "stone-furnace",
  "steel-furnace",
  "electric-furnace",
  "electric-mining-drill",
  "pumpjack",
  "chemical-plant",
  "oil-refinery",
  "centrifuge",
  "lab",
  "beacon",
  "wooden-chest",
  "iron-chest",
  "steel-chest",
  "passive-provider-chest",
  "requester-chest",
  "small-electric-pole",
  "medium-electric-pole",
  "big-electric-pole",
  "substation",
  "pipe",
  "pipe-to-ground",
  "storage-tank",
  "pump",
  "boiler",
  "steam-engine",
  "solar-panel",
  "accumulator",
]);
export type FactorioEntityName = typeof FactorioEntityName.Type;

export const FactorioDirection = Schema.Literals([0, 4, 8, 12]);
export type FactorioDirection = typeof FactorioDirection.Type;

export const FactorioPlanEntity = Schema.Struct({
  name: FactorioEntityName,
  x: Schema.Int,
  y: Schema.Int,
  direction: FactorioDirection,
  recipe: Schema.NullOr(Schema.String),
  type: Schema.NullOr(Schema.Literals(["input", "output"])),
});
export type FactorioPlanEntity = typeof FactorioPlanEntity.Type;

export const FactorioBlueprintPlan = Schema.Struct({
  label: TrimmedNonEmptyString,
  description: Schema.String,
  assumptions: Schema.Array(Schema.String),
  entities: Schema.Array(FactorioPlanEntity),
});
export type FactorioBlueprintPlan = typeof FactorioBlueprintPlan.Type;

export const FactorioGetBlueprintInput = Schema.Struct({
  cwd: TrimmedNonEmptyString,
});
export type FactorioGetBlueprintInput = typeof FactorioGetBlueprintInput.Type;

export type FactorioGetBlueprintResult =
  | { status: "empty" }
  | { status: "invalid"; error: string }
  | {
      status: "ready";
      plan: FactorioBlueprintPlan;
      blueprintString: string;
      updatedAt: string;
    };
