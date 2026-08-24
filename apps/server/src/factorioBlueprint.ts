import { deflateSync } from "node:zlib";

import {
  FactorioBlueprintPlan,
  type FactorioBlueprintPlan as FactorioBlueprintPlanType,
} from "@t3tools/contracts";
import { FACTORIO_ENTITY_CATALOG, factorioFootprint } from "@t3tools/shared/factorio";
import { Schema } from "effect";

export const FACTORIO_2_VERSION = 562949953421312;
const MAX_BLUEPRINT_ENTITIES = 500;

export function parseFactorioBlueprintPlan(contents: string): FactorioBlueprintPlanType {
  const parsed: unknown = JSON.parse(contents);
  const plan = Schema.decodeUnknownSync(FactorioBlueprintPlan)(parsed);
  if (plan.entities.length === 0) {
    throw new Error("The blueprint has no entities.");
  }
  if (plan.entities.length > MAX_BLUEPRINT_ENTITIES) {
    throw new Error(`The blueprint exceeds the ${MAX_BLUEPRINT_ENTITIES} entity preview limit.`);
  }
  validateFactorioLayout(plan);
  return plan;
}

function validateFactorioLayout(plan: FactorioBlueprintPlanType): void {
  const occupied = new Map<string, string>();
  for (const [index, entity] of plan.entities.entries()) {
    if (Math.abs(entity.x) > 5000 || Math.abs(entity.y) > 5000) {
      throw new Error(`Entity ${index + 1} is outside the supported 10,000 tile board.`);
    }
    const isUndergroundBelt = entity.name.includes("underground-belt");
    if (isUndergroundBelt !== (entity.type !== null)) {
      throw new Error(
        `Entity ${index + 1} must ${isUndergroundBelt ? "set" : "not set"} an underground type.`,
      );
    }
    const footprint = factorioFootprint(entity.name, entity.direction);
    for (let x = entity.x; x < entity.x + footprint.width; x += 1) {
      for (let y = entity.y; y < entity.y + footprint.height; y += 1) {
        const key = `${x}:${y}`;
        const previous = occupied.get(key);
        if (previous) {
          throw new Error(
            `Entity ${index + 1} overlaps ${previous} on tile ${x}, ${y}. Ask Codex to repair the layout.`,
          );
        }
        occupied.set(key, `entity ${index + 1}`);
      }
    }
  }
}

export function makeFactorioBlueprintJson(plan: FactorioBlueprintPlanType) {
  const iconNames = [...new Set(plan.entities.map((entity) => entity.name))]
    .toSorted((a, b) => {
      const aCount = plan.entities.filter((entity) => entity.name === a).length;
      const bCount = plan.entities.filter((entity) => entity.name === b).length;
      return bCount - aCount;
    })
    .slice(0, 4);

  return {
    blueprint: {
      item: "blueprint",
      label: plan.label,
      description: plan.description,
      icons: iconNames.map((name, index) => ({
        index: index + 1,
        signal: { type: "item", name },
      })),
      entities: plan.entities.map((entity, index) => {
        const footprint = factorioFootprint(entity.name, entity.direction);
        return {
          entity_number: index + 1,
          name: entity.name,
          position: {
            x: entity.x + footprint.width / 2,
            y: entity.y + footprint.height / 2,
          },
          ...(entity.direction === 0 ? {} : { direction: entity.direction }),
          ...(entity.recipe ? { recipe: entity.recipe } : {}),
          ...(entity.type ? { type: entity.type } : {}),
        };
      }),
      version: FACTORIO_2_VERSION,
    },
  };
}

export function encodeFactorioBlueprint(plan: FactorioBlueprintPlanType): string {
  const encoded = JSON.stringify(makeFactorioBlueprintJson(plan));
  return `0${deflateSync(encoded, { level: 9 }).toString("base64")}`;
}

export function listFactorioEntityNames(): string {
  return Object.keys(FACTORIO_ENTITY_CATALOG).join(", ");
}
