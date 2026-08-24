declare module "@factorio-editor-runtime" {
  export class Blueprint {
    private readonly __blueprintBrand: never;
  }

  export class Book {
    selectBlueprint(index?: number): Blueprint;
  }

  export class Editor {
    init(
      canvas: HTMLCanvasElement,
      logger?: (message: { text: string; type?: "info" | "success" | "warning" | "error" }) => void,
    ): Promise<void>;
    setViewportInsets(
      insets: Partial<{ left: number; top: number; right: number; bottom: number }>,
    ): void;
    onBlueprintChange(callback: () => void): void;
    loadBlueprint(blueprint: Blueprint): Promise<void>;
  }

  export function encode(blueprint: Blueprint | Book): Promise<string>;
  export function getBlueprintOrBookFromSource(source: string): Promise<Blueprint | Book>;
}

declare module "@factorio-editor-globals" {
  const globals: {
    app: {
      start(): void;
      stop(): void;
    };
  };

  export default globals;
}
