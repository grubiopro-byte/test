"use client";

import { BookingProvider } from "@/context/BookingContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <BookingProvider>{children}</BookingProvider>;
}
