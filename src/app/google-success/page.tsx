"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function GoogleSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");

    if (accessToken) {
      localStorage.setItem("token", accessToken);
      router.push("/");
    }
  }, [searchParams, router]);

  return <div>Google login...</div>;
}
