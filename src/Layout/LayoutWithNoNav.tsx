import { Outlet } from "react-router-dom";

const LayoutWithNoNav = () => {
    return (
        <div>
            <Outlet />
        </div>
    );
};

export default LayoutWithNoNav;