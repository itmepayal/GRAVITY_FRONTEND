import { useEffect, useState } from "react";

export function useVisibleCount() {
  const [visible, setVisible] = useState(3);
  useEffect(() => {
    const sm = window.matchMedia("(min-width: 640px)");
    const lg = window.matchMedia("(min-width: 1024px)");
    const update = () => {
      if (lg.matches) {
        setVisible(3);
      } else if (sm.matches) {
        setVisible(2);
      } else {
        setVisible(1);
      }
    };
    update();
    sm.addEventListener("change", update);
    lg.addEventListener("change", update);
    return () => {
      sm.removeEventListener("change", update);
      lg.removeEventListener("change", update);
    };
  }, []);

  return visible;
}