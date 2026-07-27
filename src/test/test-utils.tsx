import { ReactElement, ReactNode } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";

/** A QueryClient tuned for tests: no retries, no caching between tests. */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
}

interface ProvidersProps {
  children: ReactNode;
  /** Initial router entries (defaults to "/"). */
  route?: string;
}

function AllProviders({ children, route = "/" }: ProvidersProps) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <TooltipProvider>{children}</TooltipProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

/**
 * Render a component wrapped in the app's common providers
 * (React Query + Router + Tooltip). Use for component/integration tests.
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    route,
    ...options
  }: { route?: string } & Omit<RenderOptions, "wrapper"> = {},
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders route={route}>{children}</AllProviders>
    ),
    ...options,
  });
}

// Re-export everything from testing-library so tests import from one place.
export * from "@testing-library/react";
