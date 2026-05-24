"use client";
import { useEffect, useRef, useState } from "react";

export default function Loading() {
  const [dots, setDots] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timeoutRef.current = setInterval(() => {
      setDots((prev) => (prev + 1) % 4);
    }, 500);
    return () => {
      if (timeoutRef.current) clearInterval(timeoutRef.current);
    };
  }, []);

  return (
    <div className="flex items-center justify-center w-full text-lg font-semibold">
      Loading{Array(dots).fill(".").join("")}
    </div>
  );
}
