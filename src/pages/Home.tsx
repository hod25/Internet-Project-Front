import { FC, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Home.css";
import axios from "axios";
import Sidebar from "../components/Sidebar"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faThumbsUp, faComment } from "@fortawesome/free-solid-svg-icons";
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
  comments: string[];
}

const Home: FC = () => {
  // const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [newPost, setNewPost] = useState("");
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState<string>("");
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
    const trimmedTitle = title.trim();
    const trimmedPost = newPost.trim();
  
    if (!trimmedTitle || (!trimmedPost && !image)) {
      console.error("Title and either post content or image are required.");
      return;
    }
  
    try {
      const postData = {
        title: trimmedTitle,
        ingredients: JSON.stringify(trimmedPost
          .split("\n")
          .map(ingredient => ingredient.trim())
          .filter(ingredient => ingredient)),
        tags: JSON.stringify(selectedAllergies) || [],
        likes: 0,
        owner: "67bf367a6596d896e4ffed31"
      };
  
      const response = await axios.post(
        "http://localhost:4040/recipe/",
        postData, // שינוי כאן
        { headers: { "Content-Type": "application/json" } } // שינוי כאן
      );
  
      setRecipes([response.data, ...recipes]);
      setTitle("");
      setNewPost("");
      setImage(null);
      setSelectedAllergies([]);
      methods.reset();
    } catch (error : any) {
      if (axios.isAxiosError(error) && error.response) {
        console.error("Error creating post:", error.response.data);
      } else {
        console.error("An error occurred:", error.message);
      }
    }
  };

  const handleLike = async (recipeId: number) => {
    try {
      await axios.post(`http://localhost:4040/recipe/${recipeId}/like`);
      setRecipes((prevRecipes) =>
        prevRecipes.map((recipe) =>
          recipe.id === recipeId ? { ...recipe, likes: recipe.likes + 1 } : recipe
        )
      );
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleCommentSubmit = async (recipeId: number) => {
    if (!comment.trim()) return;

    try {
      await axios.post(`http://localhost:4040/recipe/${recipeId}/comment`, { comment });
      setRecipes((prevRecipes) =>
        prevRecipes.map((recipe) =>
          recipe.id === recipeId ? { ...recipe, comments: [...recipe.comments, comment] } : recipe
        )
      );
      setComment("");
    } catch (error) {
      console.error("Error commenting on post:", error);
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
              <div className="post-actions">
                <button onClick={() => handleLike(recipe.id)} className="like-button">
                  <FontAwesomeIcon icon={faThumbsUp} /> {recipe.likes}
                </button>
                <div className="comments-section">
                  {recipe.comments.map((comment, index) => (
                    <div key={index} className="comment">{comment}</div>
                  ))}
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="comment-input"
                  />
                  <button onClick={() => handleCommentSubmit(recipe.id)} className="comment-button">
                    <FontAwesomeIcon icon={faComment} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </main>
      </div>
    </FormProvider>
  );
};

export default Home;
