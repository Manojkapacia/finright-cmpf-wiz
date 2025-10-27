import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const container = document.querySelector(".appContainer");
    if (container) {
      container.scrollTop = 0; // Reset to top
    }
  }, [pathname]);

  return null;
}


export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0); // scrolls to the top
  }, [pathname]);

  return null;
};
