"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const GoogleSuccessContent = () => {
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
};

// useSearchParams при сборке (prerender) требует Suspense, иначе `next build` падает
export default function GoogleSuccess() {
  return (
    <Suspense fallback={<div>Google login...</div>}>
      <GoogleSuccessContent />
    </Suspense>
  );
}
