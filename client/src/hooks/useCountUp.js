import { useState, useEffect } from "react";

const useCountUp = (target, duration = 1000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    const start = performance.now();
    const step = (timestamp) => {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
};

export default useCountUp;
