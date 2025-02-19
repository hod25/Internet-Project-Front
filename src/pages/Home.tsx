import { FC, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Home.css";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";

interface Recipe {
  id: number;
  content: string;
  image?: string;
}

const Home: FC = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [newPost, setNewPost] = useState("");
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch("http://localhost:4040/recipe", { mode: "no-cors" });
        setRecipes(response.data);
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
        formData.append("content", newPost);
        if (image) {
          formData.append("image", image);
        }
  
        const response = await axios.post(
          "http://localhost:4040/recipe",
          {
            content: newPost,
            image: image ? URL.createObjectURL(image) : undefined,
            tags: [],
          },
          {
            headers: {
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
  
        setRecipes([response.data, ...recipes]);
        setNewPost("");
        setImage(null);
      } catch (error) {
        console.error("Error creating post:", error);
      }
    
    }

  };
  
  return (
    <div className="home-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <Link to="/profile">Profile</Link>
        {/* <button onClick={handleLogout} className="logout-button">Logout</button> */}
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
        {/* {recipes.map((recipe) => (
          <div key={recipe.id} className="post">
            {recipe.image && <img src={recipe.image} alt="Post" className="post-image" />}
            <p>{recipe.content}</p>
          </div>
        ))} */}
      </main>
    </div>
  );
};

export default Home;