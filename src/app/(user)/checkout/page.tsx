"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RoutePaths } from "@/utils/enums";

export default function CheckoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Shopping cart is removed in favor of direct course purchase.
    router.replace(RoutePaths?.MyExplore || "/my-explore");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]" />
    </div>
  );
}
