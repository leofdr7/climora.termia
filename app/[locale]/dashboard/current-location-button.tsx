"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type LocationState = "idle" | "loading" | "error";

export function CurrentLocationButton() {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState<LocationState>("idle");

  function useCurrentLocation() {
    if (!("geolocation" in navigator)) {
      setState("error");
      return;
    }

    setState("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("previewLat", position.coords.latitude.toFixed(6));
        params.set("previewLon", position.coords.longitude.toFixed(6));
        params.set(
          "previewTz",
          Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        );
        params.set("preview", "current");
        router.push(`${pathname}?${params.toString()}`);
        setState("idle");
      },
      () => {
        setState("error");
      },
      { enableHighAccuracy: false, maximumAge: 15 * 60 * 1000, timeout: 10000 },
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={useCurrentLocation}
        disabled={state === "loading"}
        className="w-fit rounded-full bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:-translate-y-0.5 hover:bg-indigo-700 disabled:translate-y-0 disabled:opacity-60"
      >
        {state === "loading" ? t("currentLocationLoading") : t("currentLocationButton")}
      </button>
      {state === "error" ? (
        <p className="max-w-xl text-xs leading-5 text-red-600 dark:text-red-300">
          {t("currentLocationError")}
        </p>
      ) : null}
    </div>
  );
}
