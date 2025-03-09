import { FC, useEffect, useState } from "react";
import "../styles/profile.css";
import avatar from "../assets/avatar.png";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { BASE_URL } from "../config/constants";

const Profile: FC = () => {
  const [user, setUser] = useState<{ name: string; bio: string; allergies: string[]; img?: string }>({
    name: "",
    bio: "",
    allergies: [],
    img: undefined,
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
          const token = localStorage.getItem("token"); // Ensure you're using the correct key
          if (!token) {
              console.error("No token found, user might be logged out.");
              return;
          }
  
          const response = await axios.get(`${BASE_URL}/users/me`, {
              headers: { Authorization: `Bearer ${token}` }, // Attach token to Authorization header
              withCredentials: true, // Ensure credentials (cookies) are sent
          });
  
          setUser(response.data); // Set user data
      } catch (error) {
          console.error("Error fetching user profile:", error); // Log error for debugging
      }
  };
  

    fetchUserProfile();
  }, []); // Empty dependency array to run only once
  
  
  return (
    <div className="profile-container">
      <Sidebar />
      <div className="profile-header">
        <img src={user.img ? user.img : avatar} alt="Profile" className="profile-avatar" />
        <div className="profile-info">
          <h2>{user.name || "Loading..."}</h2>
          <p className="bio">{user.bio || "No bio available"}</p>
          <div className="allergies-container">
            {user.allergies && user.allergies.length > 0 ? (
              user.allergies.map((option, index) => (
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