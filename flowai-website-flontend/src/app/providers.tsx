"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { ToastHost } from "@/components/ui/toast";
import { createQueryClient } from "@/lib/queryClient";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={client}>
      {children}
      <ToastHost />
    </QueryClientProvider>
  );
}
