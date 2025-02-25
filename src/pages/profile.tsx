import { FC } from "react";
import "../styles/profile.css";
import avatar from "../assets/avatar.png";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar"; // Adjust the path as necessary

const Profile: FC = () => {
  const username = "John Doe"; // שם המשתמש מהשרת 
  const bio = "Vegan | Gluten | Coffee Lover"; // הביו מהשרת
  const allergies = ["Vegetarian", "Gluten-Free"]; // התגיות מהשרת
  return (
    <div className="profile-container">
    <Sidebar /> 
      <div className="profile-header">
        <img src={avatar} alt="Profile" className="profile-avatar" />
        <div className="profile-info">
          <h2>{username}</h2>
          <p className="bio">{bio}</p>
          <div className="allergies-container">
          {allergies.length > 0 ? (
            allergies.map((option, index) => (
              <span key={index} className="allergy-option">#{option}</span> 
            ))
          ) : (
            <p>No allergies/preferences selected</p>
          )}
          </div>
        </div>
      </div>
          
          <Link to="/edit-profile">
          <button className="edit-profile">Edit Profile</button>
        </Link>
        </div>
  );
};

export default Profile;
