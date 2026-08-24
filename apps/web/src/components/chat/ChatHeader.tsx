import type {
  EditorId,
  ProjectScript,
  ResolvedKeybindingsConfig,
  ThreadId,
} from "@t3tools/contracts";
import { memo } from "react";
import type { NewProjectScriptInput } from "../ProjectScriptsControl";

interface ChatHeaderProps {
  activeThreadId: ThreadId;
  activeThreadTitle: string;
  activeProjectName: string | undefined;
  isGitRepo: boolean;
  openInCwd: string | null;
  activeProjectScripts: ProjectScript[] | undefined;
  preferredScriptId: string | null;
  keybindings: ResolvedKeybindingsConfig;
  availableEditors: ReadonlyArray<EditorId>;
  diffToggleShortcutLabel: string | null;
  gitCwd: string | null;
  diffOpen: boolean;
  onRunProjectScript: (script: ProjectScript) => void;
  onAddProjectScript: (input: NewProjectScriptInput) => Promise<void>;
  onUpdateProjectScript: (scriptId: string, input: NewProjectScriptInput) => Promise<void>;
  onDeleteProjectScript: (scriptId: string) => Promise<void>;
  onToggleDiff: () => void;
}

export const ChatHeader = memo(function ChatHeader({ activeThreadTitle }: ChatHeaderProps) {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-tight">Blueprint Foundry</span>
          <span className="rounded border border-border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
            Codex
          </span>
        </div>
        <p className="mt-0.5 truncate text-[10px] text-muted-foreground" title={activeThreadTitle}>
          {activeThreadTitle}
        </p>
      </div>
      <span className="shrink-0 text-[10px] text-muted-foreground">Vanilla 2.0</span>
    </div>
  );
});
