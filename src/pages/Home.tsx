import { FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Home.css";

const Home: FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("User logged out");
    navigate("/login"); // מעבר לעמוד ההתחברות
  };

  return (
    <div className="home-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <Link to="/profile">Profile</Link>
        <button onClick={handleLogout} className="logout-button">Logout</button>
        </aside>

      {/* Feed Section */}
      <main className="feed">
        <h2>Home Feed</h2>
        <div className="post">Post 1</div>
        <div className="post">Post 2</div>
        <div className="post">Post 3</div>
      </main>
    </div>
  );
};

export default Home;
