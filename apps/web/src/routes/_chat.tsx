import { Outlet, createFileRoute } from "@tanstack/react-router";

import { SidebarProvider } from "~/components/ui/sidebar";

function BlueprintLayout() {
  return (
    <SidebarProvider defaultOpen={false} className="min-h-0">
      <Outlet />
    </SidebarProvider>
  );
}

export const Route = createFileRoute("/_chat")({
  component: BlueprintLayout,
});
