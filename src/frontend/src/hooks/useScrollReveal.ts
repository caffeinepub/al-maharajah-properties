import { useEffect, useRef } from "react";

export function useScrollReveal() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    const elements = document.querySelectorAll(".reveal-on-scroll");
    for (const el of elements) {
      observerRef.current?.observe(el);
    }

    return () => observerRef.current?.disconnect();
  }, []);
}
