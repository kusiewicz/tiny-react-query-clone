import { createContext, ReactNode, useContext } from "react";
import { QueryClient } from "./query-client";

const QueryClientContext = createContext<QueryClient | null>(null);

export const ReactQueryProvider = ({
  client,
  children,
}: {
  client: QueryClient;
  children: ReactNode;
}) => {
  return (
    <QueryClientContext.Provider value={client}>
      {children}
    </QueryClientContext.Provider>
  );
};

export const useQueryClient = (): QueryClient => {
  const context = useContext(QueryClientContext);
  if (!context) {
    throw new Error("useQueryClient must be used within a DataClientProvider");
  }
  return context;
};
