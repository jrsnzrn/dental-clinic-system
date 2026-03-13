import { NavLink, Outlet } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="container">
      <div className="hero">
        <h1>Admin Dashboard</h1>
        <p>Manage patients and appointments.</p>
      </div>

      <div className="navLinks" style={{ marginTop: 16 }}>
        <NavLink className={({isActive}) => "navItem" + (isActive ? " active" : "")} to="patients">
          Patients
        </NavLink>
        <NavLink className={({isActive}) => "navItem" + (isActive ? " active" : "")} to="bookings">
          Bookings
        </NavLink>
      </div>

      <div style={{ marginTop: 18 }}>
        <Outlet />
      </div>
    </div>
  );
}