import { FC, useEffect, useState } from "react";
import "../styles/profile.css";
import avatar from "../assets/avatar.png";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { BASE_URL } from "../config/constants";
import { log } from "console";

const Profile: FC = () => {
  const [user, setUser] = useState<{ name: string; background: string; tags: { name: string }[]; img?: string }>({
    name: "",
    background: "",
    tags: [],
    img: undefined,
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const email = localStorage.getItem("userId"); // Ensure you're using the correct key
        console.log(email);
        
        if (!email) {
            console.error("No email found, user might be logged out.");
            return;
        }

        // קריאה ל-API של היוזר
        const response = await axios.get(`${BASE_URL}/users/${email}`);
        console.log(response.data[0]);
        setUser(prevState => ({
          ...prevState,
          name: response.data[0].name,
          background: response.data[0].background,
          img: response.data[0].img
        }));

        // קריאה ל-API של התגיות
        const tagsResponse = await axios.get(`${BASE_URL}/users/tags/${response.data[0]._id}`);
        console.log(tagsResponse.data);
        setUser(prevState => ({
          ...prevState,
          tags: tagsResponse.data.tags
        }));
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
          <p className="bio">{user.background || "No bio available"}</p>
          <div className="tags-container">
            {user.tags && user.tags.length > 0 ? (
              user.tags.map((tag, index) => (
                <span key={index} className="tag-option">
                  #{typeof tag === "string" ? tag : tag.name} {/* אם tag הוא אובייקט, הצג את ה-name */}
                </span>
              ))
            ) : (
              <p>No tags selected</p>
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