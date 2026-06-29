"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getLocalePreference } from "@/lib/locale-storage";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const saved = getLocalePreference();
    const locale = saved === "zh" ? "zh" : "en";
    router.replace(`/${locale}`);
  }, [router]);

  return null;
}
