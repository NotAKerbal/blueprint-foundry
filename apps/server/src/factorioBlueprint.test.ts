import { inflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";

import { encodeFactorioBlueprint, parseFactorioBlueprintPlan } from "./factorioBlueprint";

describe("Factorio blueprint artifact", () => {
  it("validates and encodes an importable blueprint envelope", () => {
    const plan = parseFactorioBlueprintPlan(
      JSON.stringify({
        label: "Test smelter",
        description: "One furnace",
        assumptions: ["Factorio 2.0"],
        entities: [
          {
            name: "steel-furnace",
            x: 2,
            y: 4,
            direction: 0,
            recipe: null,
            type: null,
          },
        ],
      }),
    );

    const blueprintString = encodeFactorioBlueprint(plan);
    const decoded = JSON.parse(
      inflateSync(Buffer.from(blueprintString.slice(1), "base64")).toString("utf8"),
    );

    expect(blueprintString.startsWith("0eN")).toBe(true);
    expect(decoded.blueprint.label).toBe("Test smelter");
    expect(decoded.blueprint.entities[0]).toMatchObject({
      entity_number: 1,
      name: "steel-furnace",
      position: { x: 3, y: 5 },
    });
  });

  it("rejects unsupported prototype names", () => {
    expect(() =>
      parseFactorioBlueprintPlan(
        JSON.stringify({
          label: "Bad plan",
          description: "",
          assumptions: [],
          entities: [
            { name: "made-up-machine", x: 0, y: 0, direction: 0, recipe: null, type: null },
          ],
        }),
      ),
    ).toThrow();
  });

  it("rejects overlapping footprints", () => {
    expect(() =>
      parseFactorioBlueprintPlan(
        JSON.stringify({
          label: "Overlapping plan",
          description: "",
          assumptions: [],
          entities: [
            { name: "steel-furnace", x: 0, y: 0, direction: 0, recipe: null, type: null },
            { name: "inserter", x: 1, y: 1, direction: 0, recipe: null, type: null },
          ],
        }),
      ),
    ).toThrow(/overlaps/);
  });
});
