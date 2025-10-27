
import { useEffect } from 'react'

const usePreventRefresh = () => {

      useEffect(() => {
        const disableBackButton = () => {
          window.history.pushState(null, "", window.location.href);
          window.onpopstate = () => {
            window.history.go(1);
          };
        };
    
        const disableRefresh = (event: KeyboardEvent) => {
          if (event.key === "F5" || (event.ctrlKey && event.key === "r")) {
            event.preventDefault();
            alert("Refresh is disabled on this page!");
          }
        };
    
        // Disable back button
        disableBackButton();
    
        // Disable refresh button (F5, Ctrl+R)
        window.addEventListener("keydown", disableRefresh);
    
        return () => {
          window.onpopstate = null;
          window.removeEventListener("keydown", disableRefresh);
        };
      }, []);
    };
    
    


export default usePreventRefresh