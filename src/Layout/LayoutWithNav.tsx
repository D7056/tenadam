import { Outlet } from "react-router-dom";
import Navbar from "../components/NavBar";

const LayoutWithNav = () => {
  return (
    <div>
      <Navbar />
      <main className="content-with-nav">
        <Outlet />
      </main>
    </div>
  );
};

export default LayoutWithNav;
