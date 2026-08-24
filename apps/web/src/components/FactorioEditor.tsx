import { CheckIcon, CopyIcon, RotateCcwIcon, SaveIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "./ui/button";

const DEFAULT_DATA_PACK = "vanilla-2.0-slim";

type EditorModule = typeof import("@factorio-editor-runtime");
type EditorGlobals = typeof import("@factorio-editor-globals");
type LoadedBlueprint = Awaited<ReturnType<EditorModule["getBlueprintOrBookFromSource"]>>;

interface EditorRuntime {
  editor: InstanceType<EditorModule["Editor"]>;
  module: EditorModule;
  globals: EditorGlobals;
}

export function FactorioEditor(props: {
  blueprintString: string;
  label: string;
  open: boolean;
  onClose: () => void;
  onUseBlueprint: (blueprintString: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<EditorRuntime | null>(null);
  const runtimePromiseRef = useRef<Promise<EditorRuntime> | null>(null);
  const blueprintRef = useRef<LoadedBlueprint | null>(null);
  const loadedStringRef = useRef<string | null>(null);
  const loadingBlueprintRef = useRef(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [copied, setCopied] = useState(false);

  const ensureRuntime = useCallback(async () => {
    if (runtimeRef.current) return runtimeRef.current;
    if (runtimePromiseRef.current) return runtimePromiseRef.current;

    runtimePromiseRef.current = (async () => {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("The editor canvas is unavailable.");

      try {
        if (!localStorage.getItem("fbe:dataPack")) {
          localStorage.setItem("fbe:dataPack", DEFAULT_DATA_PACK);
        }
      } catch {
        // Private browsing can block storage. The editor will use its vanilla default.
      }

      const [module, globals] = await Promise.all([
        import("@factorio-editor-runtime"),
        import("@factorio-editor-globals"),
      ]);
      const editor = new module.Editor();
      await editor.init(canvas, ({ text, type }) => {
        if (type === "error") console.error(`[Factorio editor] ${text}`);
      });
      editor.setViewportInsets({ top: 56 });
      editor.onBlueprintChange(() => {
        if (!loadingBlueprintRef.current) setDirty(true);
      });

      const runtime = { editor, module, globals };
      runtimeRef.current = runtime;
      return runtime;
    })();

    try {
      return await runtimePromiseRef.current;
    } catch (runtimeError) {
      runtimePromiseRef.current = null;
      throw runtimeError;
    }
  }, []);

  const loadBlueprint = useCallback(
    async (blueprintString: string) => {
      setStatus("loading");
      setError(null);
      const runtime = await ensureRuntime();
      loadingBlueprintRef.current = true;
      try {
        const decoded = await runtime.module.getBlueprintOrBookFromSource(blueprintString);
        const blueprint =
          decoded instanceof runtime.module.Book ? decoded.selectBlueprint(0) : decoded;
        await runtime.editor.loadBlueprint(blueprint);
        blueprintRef.current = blueprint;
        loadedStringRef.current = blueprintString;
        setDirty(false);
        setStatus("ready");
        window.requestAnimationFrame(() => canvasRef.current?.focus());
      } finally {
        loadingBlueprintRef.current = false;
      }
    },
    [ensureRuntime],
  );

  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!props.open) {
      runtime?.globals.default.app?.stop();
      return;
    }

    let cancelled = false;
    const openEditor = async () => {
      try {
        const readyRuntime = await ensureRuntime();
        if (cancelled) return;
        readyRuntime.globals.default.app.start();
        window.dispatchEvent(new Event("resize"));
        if (loadedStringRef.current !== props.blueprintString) {
          await loadBlueprint(props.blueprintString);
        } else {
          setStatus("ready");
          window.requestAnimationFrame(() => canvasRef.current?.focus());
        }
      } catch (loadError) {
        if (cancelled) return;
        setStatus("error");
        setError(loadError instanceof Error ? loadError.message : String(loadError));
      }
    };
    void openEditor();
    return () => {
      cancelled = true;
    };
  }, [ensureRuntime, loadBlueprint, props.blueprintString, props.open]);

  const encodeCurrent = async () => {
    const runtime = runtimeRef.current;
    const blueprint = blueprintRef.current;
    if (!runtime || !blueprint) throw new Error("The editor has not loaded a blueprint.");
    return runtime.module.encode(blueprint);
  };

  const copyCurrent = async () => {
    const blueprintString = await encodeCurrent();
    await navigator.clipboard.writeText(blueprintString);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const useCurrent = async () => {
    const blueprintString = await encodeCurrent();
    loadedStringRef.current = blueprintString;
    props.onUseBlueprint(blueprintString);
    setDirty(false);
    props.onClose();
  };

  return (
    <div
      className={props.open ? "fixed inset-0 z-50 bg-[#111512]" : "fixed hidden"}
      aria-hidden={!props.open}
    >
      <canvas
        ref={canvasRef}
        tabIndex={0}
        aria-label="Factorio blueprint editor"
        className="absolute inset-0 size-full outline-none"
      />

      <header className="absolute inset-x-0 top-0 z-10 flex h-14 items-center justify-between border-b border-white/10 bg-[#111512]/94 px-4 shadow-lg backdrop-blur-sm">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-sm bg-amber-400" />
            <h2 className="truncate text-sm font-semibold text-white">{props.label}</h2>
            {dirty ? <span className="text-[11px] text-amber-300">Edited</span> : null}
          </div>
          <p className="mt-0.5 text-[10px] text-white/50">
            Trisiak editor · Factorio 2.0 slim graphics
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            className="text-white/75 hover:bg-white/10 hover:text-white"
            disabled={status !== "ready"}
            onClick={() => void loadBlueprint(props.blueprintString)}
          >
            <RotateCcwIcon />
            Reset
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-white/75 hover:bg-white/10 hover:text-white"
            disabled={status !== "ready"}
            onClick={() => void copyCurrent()}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button
            size="sm"
            className="bg-amber-400 text-black hover:bg-amber-300"
            disabled={status !== "ready"}
            onClick={() => void useCurrent()}
          >
            <SaveIcon />
            Use edits
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Close editor"
            className="text-white/75 hover:bg-white/10 hover:text-white"
            onClick={props.onClose}
          >
            <XIcon />
          </Button>
        </div>
      </header>

      {status === "loading" ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#111512]">
          <div className="w-72 space-y-3" role="status" aria-label="Loading Factorio editor">
            <div className="h-5 w-40 animate-pulse rounded bg-white/12" />
            <div className="h-3 w-full animate-pulse rounded bg-white/7" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-white/7" />
          </div>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#111512] p-8">
          <div className="max-w-md text-center">
            <h2 className="text-sm font-medium text-red-300">
              The 2.0 editor could not load this blueprint
            </h2>
            <p className="mt-2 text-xs leading-5 text-white/55">{error}</p>
            <Button className="mt-4" variant="outline" onClick={props.onClose}>
              Return to board
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
