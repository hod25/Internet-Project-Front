import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/sidebar.css";

const DynamicSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    window.location.reload(); // מרענן את הדף כדי לוודא שהמצב מתאפס
  };
  

  return (
    <aside className="sidebar">
      {/* <h2 className="sidebar-title">Menu</h2> */}
      
      {location.pathname === "/" && (
        <>
          <Link to="/profile" className="sidebar-link">Profile</Link>
          <button onClick={handleLogout} className="sidebar-logout">Logout</button>
        </>
      )}

      {location.pathname === "/profile" && (
        <>
          <Link to="/" className="sidebar-link">Home</Link>
          <Link to="/edit-profile" className="sidebar-link">Edit Profile</Link>
          <button onClick={handleLogout} className="sidebar-logout">Logout</button>
        </>
      )}

      {location.pathname === "/edit-profile" && (
        <>
          <Link to="/" className="sidebar-link">Home</Link>
          <Link to="/profile" className="sidebar-link">Back to Profile</Link>
          <button onClick={handleLogout} className="sidebar-logout">Logout</button>
        </>
      )}
    </aside>
  );
};

export default DynamicSidebar;
