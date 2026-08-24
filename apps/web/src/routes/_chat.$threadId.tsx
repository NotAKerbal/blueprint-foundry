import { ThreadId } from "@t3tools/contracts";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import ChatView from "../components/ChatView";
import { FactorioBoard } from "../components/FactorioBoard";
import { useComposerDraftStore } from "../composerDraftStore";
import { useStore } from "../store";

function BlueprintThreadRoute() {
  const threadsHydrated = useStore((store) => store.threadsHydrated);
  const navigate = useNavigate();
  const threadId = Route.useParams({
    select: (params) => ThreadId.makeUnsafe(params.threadId),
  });
  const thread = useStore((store) => store.threads.find((item) => item.id === threadId));
  const project = useStore((store) => store.projects.find((item) => item.id === thread?.projectId));
  const draftThreadExists = useComposerDraftStore((store) =>
    Object.hasOwn(store.draftThreadsByThreadId, threadId),
  );

  useEffect(() => {
    if (threadsHydrated && !thread && !draftThreadExists) {
      void navigate({ to: "/", replace: true });
    }
  }, [draftThreadExists, navigate, thread, threadsHydrated]);

  if (!threadsHydrated || (!thread && !draftThreadExists)) return null;

  return (
    <main className="flex h-dvh min-h-0 min-w-0 flex-1 overflow-hidden bg-background text-foreground">
      <aside className="flex min-h-0 w-[min(430px,42vw)] min-w-[340px] shrink-0 border-r border-border">
        <ChatView key={threadId} threadId={threadId} />
      </aside>
      <FactorioBoard cwd={thread?.worktreePath ?? project?.cwd ?? null} />
    </main>
  );
}

export const Route = createFileRoute("/_chat/$threadId")({
  component: BlueprintThreadRoute,
});
