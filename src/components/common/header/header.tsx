// import React, { useEffect, ReactNode } from "react";
// import Layout from "./layout";
// interface HeaderProps {
//     children: ReactNode;
//   }

// const Header: React.FC<HeaderProps> = ({ children }) => {

//     useEffect(() => {
//         const handleResize = () => {
//             // setIsMobile(window.innerWidth <= 550);
//         };
//         window.addEventListener("resize", handleResize);
//         return () => window.removeEventListener("resize", handleResize);
//     }, []);

//     // const contentStyle: React.CSSProperties = {
//     //     display: "flex",
//     //     justifyContent: "center",
//     //     alignItems: "center",
//     //     flexGrow: 1,
//     //     marginTop: isMobile ? "2.5rem" : "4rem",
//     // };

//     return (
//         <div style={layoutStyle}>
//             <Layout />
//             <div>{children}</div>
//         </div>
//     );
// };

// const layoutStyle: React.CSSProperties = {
//     display: "flex",
//     flexDirection: "column",
//     height: "100vh",
//     width: "100%",
// };

// export default Header;
import React, { ReactNode } from "react";
import Layout from "./layout";
import './../../../App.css';

interface HeaderProps {
  children?: ReactNode;  // ✅ Make children optional
}

const Header: React.FC<HeaderProps> = ({ children }) => {
  return (
    <header className="header">
      <Layout />
      {children && <div className="headerContent">{children}</div>}
    </header>
  );
};

export default Header;