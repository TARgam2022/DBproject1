"use client";
import { useEffect, useState } from "react";

export function useApiData<T>(url: string, key: string, fallback: T[] = []): T[] {
  const [data, setData] = useState<T[]>(fallback);

  useEffect(() => {
    let active = true;
    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (active) {
          setData(json?.[key] ?? fallback);
        }
      })
      .catch(() => {
        if (active) setData(fallback);
      });
    return () => {
      active = false;
    };
  }, [url, key]);

  return data;
}
