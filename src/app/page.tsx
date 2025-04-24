"use client";

import { UsageExampleComponent } from "@/usage-example/usage-example";
import { QueryClient, ReactQueryProvider } from "../../react-query";

const queryClient = new QueryClient();

export default function Home() {
  return (
    <ReactQueryProvider client={queryClient}>
      <UsageExampleComponent />
    </ReactQueryProvider>
  );
}
