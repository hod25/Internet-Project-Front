import { FC, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Home.css";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";

interface Recipe {
  id: number;
  title: string;
  image?: string;
  ingredients: string[] ;
  tags: string[];
  owner: string;
  likes: number;
}

const Home: FC = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [newPost, setNewPost] = useState("");
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch("http://localhost:4040/recipe");
        const data = await response.json();
        setRecipes(data);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };

    fetchRecipes();
  }, []);

  const handlePostSubmit = async () => {
    if (newPost.trim() || image) {
      try {
        const formData = new FormData();
        formData.append("title", newPost); // Ensure the title is set
        if (image) {
          formData.append("image", image);
        }
        formData.append("likes", "0"); // Default likes to 0
        formData.append("owner", "user1"); // Assuming a default owner for simplicity

        const response = await axios.post(
          "http://localhost:4040/recipe",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setRecipes([response.data, ...recipes]);
        setNewPost("");
        setImage(null);
      } catch (error) {
        console.error("Error creating post:", error);
        if (axios.isAxiosError(error) && error.response) {
          console.error("Server response:", error.response.data);
        }
      }
    }
  };

  const handleLogout = () => {
    // Clear user data (e.g., tokens, user info)
    localStorage.removeItem("userToken");
    // Redirect to login page
    navigate("/login");
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
        <div className="create-post">
          <div className="post-input-container">
            <textarea
              className="post-input"
              placeholder="What's on your mind?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
            />
            <label className="image-upload-label">
              <FontAwesomeIcon icon={faImage} className="image-upload-icon" />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="hidden-image-input"
              />
            </label>
          </div>
          <button onClick={handlePostSubmit} className="post-button">Post</button>
        </div>
        {recipes.map((recipe) => (
          <div key={recipe.id} className="post">
            <h3>{recipe.title}</h3>
            {recipe.image && <img src={`http://localhost:4040/${recipe.image}`} alt="Post" className="post-image" />}
            <div className="tags">
              {recipe.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default Home;