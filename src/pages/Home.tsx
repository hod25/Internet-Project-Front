import { FC, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Home.css";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { useForm, FormProvider } from "react-hook-form";
import AllergiesPreferences from "../components/AllergiesPreferences";

interface Recipe {
  id: number;
  title: string;
  image?: string;
  ingredients: string[];
  tags?: string[] | null;
  owner: string;
  likes: number;
}

const allergyTag = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Lactose-Free",
  "Nut Allergy",
  "Shellfish Allergy",
];

const Home: FC = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [newPost, setNewPost] = useState("");
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const methods = useForm();

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch("http://localhost:4040/recipe");
        const data = await response.json();
        if (Array.isArray(data)) {
          setRecipes(data);
        } else {
          setRecipes([]);
        }
      } catch (error) {
        console.error("Error fetching recipes:", error);
        setRecipes([]);
      }
    };

    fetchRecipes();
  }, []);

  const handlePostSubmit = async () => {
    if (title.trim() && (newPost.trim() || image)) {
      try {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("ingredients", JSON.stringify(newPost.split(",")));
        formData.append("tags", JSON.stringify(selectedAllergies)); // ✅ שולח את האלרגיות לשרת
        if (image) {
          formData.append("image", image);
        }
        formData.append("likes", "0");
        formData.append("owner", "user1");

        console.log("FormData being sent:");
        for (const pair of formData.entries()) {
          console.log(pair[0], pair[1]);
        }

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
        setTitle("");
        setNewPost("");
        setImage(null);
        setSelectedAllergies([]); // ✅ איפוס התגיות שנבחרו
        methods.reset();
      } catch (error) {
        console.error("Error creating post:", error);
        if (axios.isAxiosError(error) && error.response) {
          console.error("Server response:", error.response.data);
        }
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    navigate("/login");
  };

  return (
    <FormProvider {...methods}>
      <div className="home-container">
        <aside className="sidebar">
          <Link to="/profile">Profile</Link>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </aside>

        <main className="feed">
          <h2>Home Feed</h2>
          <div className="create-post">
            <div className="post-input-container">
              <input
                className="post-title-input"
                placeholder="Enter recipe title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="post-input"
                placeholder="Write your recipe here..."
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
            <label>Allergies/Preferences:</label>
            <AllergiesPreferences
              options={allergyTag}
              onChange={setSelectedAllergies} // ✅ מעדכן את האלרגיות שנבחרו
            />
            <button onClick={handlePostSubmit} className="post-button">
              Post
            </button>
          </div>
          {recipes.map((recipe) => (
            <div key={recipe.id} className="post">
              <h3>{recipe.title}</h3>
              {recipe.image && (
                <img
                  src={`http://localhost:4040/${recipe.image}`}
                  alt="Post"
                  className="post-image"
                />
              )}
              <div className="tags">
                {recipe.tags && recipe.tags.length ? (
                  recipe.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span>No tags</span>
                )}
              </div>
            </div>
          ))}
        </main>
      </div>
    </FormProvider>
  );
};

export default Home;
