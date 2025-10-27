
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