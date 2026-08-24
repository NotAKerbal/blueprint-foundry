import type { FactorioBlueprintPlan, FactorioGetBlueprintResult } from "@t3tools/contracts";
import { FACTORIO_ENTITY_CATALOG, factorioFootprint } from "@t3tools/shared/factorio";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangleIcon,
  BoxIcon,
  CheckIcon,
  CopyIcon,
  MinusIcon,
  PencilRulerIcon,
  PlusIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { readNativeApi } from "../nativeApi";
import { Button } from "./ui/button";
import { FactorioEditor } from "./FactorioEditor";
import { cn } from "../lib/utils";

const TILE_SIZE = 28;
const BOARD_PADDING = 4;
const EDITED_BLUEPRINT_STORAGE_KEY = "blueprint-foundry:edited-blueprint:v1";

function getBounds(plan: FactorioBlueprintPlan) {
  let minX = 0;
  let minY = 0;
  let maxX = 1;
  let maxY = 1;
  for (const entity of plan.entities) {
    const footprint = factorioFootprint(entity.name, entity.direction);
    minX = Math.min(minX, entity.x);
    minY = Math.min(minY, entity.y);
    maxX = Math.max(maxX, entity.x + footprint.width);
    maxY = Math.max(maxY, entity.y + footprint.height);
  }
  return { minX, minY, maxX, maxY };
}

function BoardEmptyState() {
  return (
    <div className="flex h-full min-h-96 items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
          <BoxIcon className="size-6" />
        </div>
        <h2 className="text-lg font-medium text-foreground">Describe the factory you need</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Ask Codex for a smelter, mall block, science build, refinery, or power setup. It will
          research the ratios, place the entities here, and prepare the import string.
        </p>
        <div className="mt-5 grid gap-2 text-left text-xs text-muted-foreground">
          <p className="rounded-lg border border-border/80 bg-card/60 px-3 py-2.5">
            "Build a compact early-game green circuit line"
          </p>
          <p className="rounded-lg border border-border/80 bg-card/60 px-3 py-2.5">
            "I need one red belt of iron plates using electric furnaces"
          </p>
        </div>
      </div>
    </div>
  );
}

function BoardCanvas(props: {
  plan: FactorioBlueprintPlan;
  zoom: number;
  selectedIndex: number | null;
  onSelect: (index: number | null) => void;
}) {
  const bounds = useMemo(() => getBounds(props.plan), [props.plan]);
  const tile = TILE_SIZE * props.zoom;
  const width = (bounds.maxX - bounds.minX + BOARD_PADDING * 2) * tile;
  const height = (bounds.maxY - bounds.minY + BOARD_PADDING * 2) * tile;

  return (
    <div
      className="relative m-auto min-h-full min-w-full"
      style={{ width: Math.max(width, 720), height: Math.max(height, 520) }}
      onClick={() => props.onSelect(null)}
    >
      <div
        className="absolute left-1/2 top-1/2 overflow-hidden rounded-xl border border-white/8 bg-[#171d18] shadow-2xl shadow-black/20"
        style={{
          width,
          height,
          transform: "translate(-50%, -50%)",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.055) 1px, transparent 1px)",
          backgroundSize: `${tile}px ${tile}px`,
        }}
      >
        {props.plan.entities.map((entity, index) => {
          const definition = FACTORIO_ENTITY_CATALOG[entity.name];
          const footprint = factorioFootprint(entity.name, entity.direction);
          const selected = props.selectedIndex === index;
          return (
            <button
              key={`${entity.name}:${entity.x}:${entity.y}:${entity.direction}`}
              type="button"
              title={`${definition.label}${entity.recipe ? ` · ${entity.recipe}` : ""}`}
              className={cn(
                "absolute flex select-none items-center justify-center overflow-hidden rounded-[4px] border text-[10px] font-bold text-white shadow-sm transition-[filter,outline] duration-100",
                selected
                  ? "z-20 outline-2 outline-offset-2 outline-amber-300"
                  : "hover:z-10 hover:brightness-125",
              )}
              style={{
                left: (entity.x - bounds.minX + BOARD_PADDING) * tile,
                top: (entity.y - bounds.minY + BOARD_PADDING) * tile,
                width: footprint.width * tile,
                height: footprint.height * tile,
                backgroundColor: definition.color,
                borderColor: "rgba(0,0,0,.45)",
                backgroundImage:
                  definition.kind === "belt"
                    ? "repeating-linear-gradient(135deg, transparent 0 6px, rgba(0,0,0,.14) 6px 9px)"
                    : "linear-gradient(145deg, rgba(255,255,255,.14), rgba(0,0,0,.18))",
              }}
              onClick={(event) => {
                event.stopPropagation();
                props.onSelect(index);
              }}
            >
              <span
                className="drop-shadow-sm"
                style={{ transform: `rotate(${entity.direction * 22.5}deg)` }}
              >
                {definition.short}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function FactorioBoard(props: { cwd: string | null }) {
  const [zoom, setZoom] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editedBlueprint, setEditedBlueprint] = useState<{
    sourceUpdatedAt: string;
    blueprintString: string;
  } | null>(null);
  const query = useQuery<FactorioGetBlueprintResult>({
    queryKey: ["factorio-blueprint", props.cwd],
    enabled: Boolean(props.cwd),
    queryFn: async () => {
      const api = readNativeApi();
      if (!api || !props.cwd) return { status: "empty" };
      return api.factorio.getBlueprint({ cwd: props.cwd });
    },
    refetchInterval: 800,
    retry: false,
  });
  const result = query.data;
  const ready = result?.status === "ready" ? result : null;
  const readyUpdatedAt = ready?.updatedAt;

  useEffect(() => {
    if (!readyUpdatedAt || !props.cwd) return;
    try {
      const stored = JSON.parse(localStorage.getItem(EDITED_BLUEPRINT_STORAGE_KEY) ?? "null") as {
        cwd?: string;
        sourceUpdatedAt?: string;
        blueprintString?: string;
      } | null;
      if (
        stored?.cwd === props.cwd &&
        stored.sourceUpdatedAt === readyUpdatedAt &&
        typeof stored.blueprintString === "string"
      ) {
        setEditedBlueprint({
          sourceUpdatedAt: stored.sourceUpdatedAt,
          blueprintString: stored.blueprintString,
        });
      } else {
        setEditedBlueprint(null);
      }
    } catch {
      setEditedBlueprint(null);
    }
  }, [props.cwd, readyUpdatedAt]);

  const effectiveBlueprintString =
    ready && editedBlueprint?.sourceUpdatedAt === ready.updatedAt
      ? editedBlueprint.blueprintString
      : ready?.blueprintString;
  const selected =
    ready && selectedIndex !== null ? (ready.plan.entities[selectedIndex] ?? null) : null;

  const copyBlueprint = async () => {
    if (!effectiveBlueprintString) return;
    await navigator.clipboard.writeText(effectiveBlueprintString);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#111512] text-foreground">
      <header className="flex h-[53px] shrink-0 items-center justify-between border-b border-white/8 px-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-sm bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,.35)]" />
            <h1 className="truncate text-sm font-semibold">
              {ready?.plan.label ?? "Blueprint board"}
            </h1>
          </div>
          {ready ? (
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {ready.plan.entities.length} entities · Factorio 2.0
              {effectiveBlueprintString !== ready.blueprintString ? " · edited export" : ""}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5">
          {ready ? (
            <>
              <Button size="sm" variant="outline" onClick={() => setEditorOpen(true)}>
                <PencilRulerIcon />
                Edit
              </Button>
              <div className="mr-1 hidden items-center rounded-md border border-white/8 bg-black/15 sm:flex">
                <Button
                  size="icon-xs"
                  variant="ghost"
                  aria-label="Zoom out"
                  onClick={() => setZoom((value) => Math.max(0.6, value - 0.2))}
                >
                  <MinusIcon />
                </Button>
                <span className="w-10 text-center text-[10px] text-muted-foreground">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  aria-label="Zoom in"
                  onClick={() => setZoom((value) => Math.min(1.6, value + 0.2))}
                >
                  <PlusIcon />
                </Button>
              </div>
              <Button
                size="sm"
                className="bg-amber-400 text-black hover:bg-amber-300"
                onClick={copyBlueprint}
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
                {copied ? "Copied" : "Copy blueprint"}
              </Button>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">Waiting for a design</span>
          )}
        </div>
      </header>

      <div className="relative min-h-0 flex-1 overflow-auto">
        {!result || result.status === "empty" ? <BoardEmptyState /> : null}
        {result?.status === "invalid" ? (
          <div className="flex h-full items-center justify-center p-8">
            <div className="max-w-md rounded-xl border border-red-500/20 bg-red-500/8 p-5 text-center">
              <AlertTriangleIcon className="mx-auto mb-3 size-6 text-red-400" />
              <h2 className="text-sm font-medium">Codex wrote an invalid blueprint</h2>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{result.error}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                Ask Codex to inspect and repair the board file.
              </p>
            </div>
          </div>
        ) : null}
        {ready ? (
          <BoardCanvas
            plan={ready.plan}
            zoom={zoom}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
          />
        ) : null}

        {selected ? (
          <div className="sticky bottom-3 ml-auto mr-3 w-fit max-w-72 rounded-lg border border-white/10 bg-[#202620]/95 px-3 py-2 shadow-xl backdrop-blur-sm">
            <p className="text-xs font-medium">{FACTORIO_ENTITY_CATALOG[selected.name].label}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              x {selected.x}, y {selected.y} · direction {selected.direction}
              {selected.recipe ? ` · ${selected.recipe}` : ""}
            </p>
          </div>
        ) : null}
      </div>

      {ready ? (
        <footer className="flex shrink-0 items-center gap-3 border-t border-white/8 bg-black/10 px-4 py-2.5">
          <code className="min-w-0 flex-1 truncate text-[10px] text-muted-foreground/70">
            {effectiveBlueprintString}
          </code>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {((effectiveBlueprintString?.length ?? 0) / 1000).toFixed(1)}k chars
          </span>
        </footer>
      ) : null}

      {ready && effectiveBlueprintString ? (
        <FactorioEditor
          open={editorOpen}
          blueprintString={effectiveBlueprintString}
          label={ready.plan.label}
          onClose={() => setEditorOpen(false)}
          onUseBlueprint={(blueprintString) => {
            const edited = { sourceUpdatedAt: ready.updatedAt, blueprintString };
            setEditedBlueprint(edited);
            try {
              localStorage.setItem(
                EDITED_BLUEPRINT_STORAGE_KEY,
                JSON.stringify({ cwd: props.cwd, ...edited }),
              );
            } catch {
              // The current page still keeps the edit when storage is unavailable.
            }
          }}
        />
      ) : null}
    </section>
  );
}
