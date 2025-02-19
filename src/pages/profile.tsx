import { FC } from "react";
// import { useNavigate } from "react-router-dom";
import "../styles/profile.css";
import avatar from "../assets/avatar.png";
import { Link } from "react-router-dom";


const Profile: FC = () => {
  // const navigate = useNavigate();

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img src={avatar} alt="Profile" className="profile-avatar" />
        <div className="profile-info">
          <h2>John Doe</h2>
          <p>@johndoe</p>
          <p className="bio"> Vegan | Gluten | Coffee Lover</p>
        </div>
        <Link to="/edit-profile">
        <button className="edit-profile">Edit Profile</button>
        </Link>
      </div>

      <div className="profile-stats">
        <div>
          <strong>150</strong>
          <span>Posts</span>
        </div>
        <div>
          <strong>2.5K</strong>
          <span>Followers</span>
        </div>
        <div>
          <strong>1.8K</strong>
          <span>Following</span>
        </div>
      </div>

      <div className="profile-tabs">
        <button className="active">Posts</button>
        <button>Photos</button>
        <button>Friends</button>
      </div>

      <div className="profile-content">
        <div className="post">
          <p>Just launched my new website! 🚀 Check it out: johndoe.dev</p>
        </div>
        <div className="post">
          <p>Working on a new React project! Loving the process! 🔥</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
