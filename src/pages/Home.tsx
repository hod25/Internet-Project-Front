import { FC, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Home.css";
import axios from "axios";
import Sidebar from "../components/Sidebar"; 
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

const Home: FC = () => {
  // const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [newPost, setNewPost] = useState("");
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const methods = useForm();

  useEffect(() => {
    const fetchRecipes = async (retryCount = 0) => {
      try {
        const response = await fetch("http://localhost:4040/recipe");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setRecipes(Array.isArray(data) ? data : []);
        setError(null);
      } catch (error) {
        console.error("Error fetching recipes:", error);
        setRecipes([]);
        setError("Failed to fetch recipes. Please try again later.");
        if (retryCount < 3) {
          setTimeout(() => fetchRecipes(retryCount + 1), 3000);
        }
      }
    };
    fetchRecipes();
  }, []);

  const handlePostSubmit = async () => {
    if (title.trim() && (newPost.trim() || image)) {
      try {
        const formData = new FormData();
        formData.append("title", title);
        const ingredientsArray = newPost
        .split("\n") // פיצול לפי שורות חדשות
        .map(ingredient => ingredient.trim()) // ניקוי רווחים מיותרים
        .filter(ingredient => ingredient); // הסרת שורות ריקות
              if (ingredientsArray.length === 0) {
          throw new Error("Ingredients array cannot be empty");
        }
        formData.append("ingredients", JSON.stringify(ingredientsArray));
        formData.append("tags", JSON.stringify(selectedAllergies));
        if (image) {
          formData.append("image", image);
        }
        formData.append("likes", "0");
        formData.append("owner", "user1"); // Adjust this to use the actual user information

        // Debugging: Log the formData entries
        for (let pair of formData.entries()) {
          console.log(pair[0] + ': ' + pair[1]);
        }

        const response = await axios.post(
          "http://localhost:4040/recipe/",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        setRecipes([response.data, ...recipes]);
        setTitle("");
        setNewPost("");
        setImage(null);
        setSelectedAllergies([]);
        methods.reset();
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          console.error("Error creating post:", error.response.data);
        } else if (error instanceof Error) {
          console.error("Error creating post:", error.message);
        } else {
          console.error("An unexpected error occurred:", error);
        }
      }
    } else {
      console.error("Title and either post content or image are required.");
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="home-container">
        <Sidebar />  
        <main className="feed">
          <h2>Feed</h2>
          {error && <div className="error-message">{error}</div>}
          <div className="create-post">
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
            <label>Allergies/Preferences:</label>
            <AllergiesPreferences
            options={[
              "Vegetarian",
              "Vegan",
              "Gluten-Free",
              "Lactose-Free",
              "Nut Allergy",
              "Shellfish Allergy"
            ]}
            onChange={setSelectedAllergies}
/>
            <button onClick={handlePostSubmit} className="post-button">Post</button>
          </div>
          
          {recipes.map((recipe) => (
            <div key={recipe.id} className="post">
              <h3>{recipe.title}</h3>
              {recipe.image && <img src={`http://localhost:4040/${recipe.image}`} alt="Post" className="post-image" />}
              <div className="tags">
                {recipe.tags && recipe.tags.length ? (
                  recipe.tags.map((tag, index) => (
                    <span key={index} className="tag">#{tag}</span>
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
