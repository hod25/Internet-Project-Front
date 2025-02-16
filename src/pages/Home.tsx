// Home.tsx
// This is the Home page of the social media platform. It should display a feed of posts,
// a sidebar with navigation links, and a section for trending topics or suggested users.

import { FC } from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

const Home: FC = () => {
  return (
    <div className="home-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <Link to="/profile">Profile</Link>
        <Link to="/edit-profile">Edit Profile</Link>
        {/* <Link to="/settings">Settings</Link> */}
      </aside>

      {/* Feed Section */}
      <main className="feed">
        <h2>Home Feed</h2>
        <div className="post">Post 1</div>
        <div className="post">Post 2</div>
        <div className="post">Post 3</div>
      </main>

      {/* Trending / Suggested */}
      <aside className="trending">
        <h3>Trending Topics</h3>
        <p>#React</p>
        <p>#TypeScript</p>
      </aside>
    </div>
  );
};

export default Home;
