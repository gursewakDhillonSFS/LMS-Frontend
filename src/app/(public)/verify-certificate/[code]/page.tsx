"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function VerifyCertificateAliasPage() {
  const params = useParams();
  const router = useRouter();
  const code = params?.code as string;

  useEffect(() => {
    if (code) {
      router.replace(`/certificate/verify/${encodeURIComponent(code)}`);
    } else {
      router.replace("/");
    }
  }, [code, router]);

  return null;
}
