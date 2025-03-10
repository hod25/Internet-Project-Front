import { FC, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Home.css";
import axios from "axios";
import Sidebar from "../components/Sidebar"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faThumbsUp, faComment } from "@fortawesome/free-solid-svg-icons";
import { useForm, FormProvider } from "react-hook-form";
import AllergiesPreferences from "../components/AllergiesPreferences";
import { BASE_URL } from "../config/constants";
import { jwtDecode } from "jwt-decode"; // יש לוודא שהספרייה מותקנת

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
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [newPost, setNewPost] = useState("");
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState<string>("");
  const methods = useForm();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [showMyPosts, setShowMyPosts] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipes = async (retryCount = 0) => {
      try {
        const response = await fetch(`${BASE_URL}/recipe?page=${page}&limit=10`);
        const data = await response.json();
        console.log("Fetched data:", data); // בדוק מה מחזיר ה-API
        let filteredRecipes = Array.isArray(data.recipes) ? data.recipes : [];
        
        if (filterTag) {
            filteredRecipes = filteredRecipes.filter((recipe: Recipe) => recipe.tags?.includes(filterTag));
        }
        
        if (showMyPosts) {
            filteredRecipes = filteredRecipes.filter((recipe: Recipe) => recipe.owner === userId);
        }
        
        setRecipes(filteredRecipes);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };
    fetchRecipes();
  }, [page, filterTag, showMyPosts]);
    
  const [resetTrigger, setResetTrigger] = useState(false);

  const handlePostSubmit = async () => {
    const trimmedTitle = title.trim();
    const trimmedPost = newPost.trim();
  
    if (!trimmedTitle || (!trimmedPost && !image)) {
      console.error("Title and either post content or image are required.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found in localStorage.");
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
        owner: token,
      };
  
      console.log("Post data being sent:", postData); // Log the post data

      const response = await axios.post(
        `${BASE_URL}/recipe/`,
        postData,
        { headers: { "Content-Type": "application/json" } }
      );
  
      console.log("Response data:", response.data); // Log the response data

      setRecipes([response.data, ...recipes]);
      setTitle("");
      setNewPost("");
      setImage(null);
      setSelectedAllergies([]); // Reset the allergies
      methods.reset();
      setResetTrigger(prev => !prev); // Trigger reset in the allergies component
  
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
      await axios.post(`${BASE_URL}/recipe/${recipeId}/like`);
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
      await axios.post(`${BASE_URL}/recipe/${recipeId}/comment`, { comment });
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

  const handleDelete = async (recipeId: number) => {
    try {
      await axios.delete(`${BASE_URL}/recipe/${recipeId}`);
      setRecipes((prevRecipes) => prevRecipes.filter((recipe) => recipe.id !== recipeId));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleEdit = async (recipeId: number, updatedTitle: string, updatedContent: string, updatedTags: string[]) => {
    try {
      const updatedRecipe = {
        title: updatedTitle,
        ingredients: JSON.stringify(updatedContent
          .split("\n")
          .map(ingredient => ingredient.trim())
          .filter(ingredient => ingredient)),
        tags: JSON.stringify(updatedTags) || [],
      };

      const response = await axios.put(`${BASE_URL}/recipe/${recipeId}`, updatedRecipe, {
        headers: { "Content-Type": "application/json" },
      });

      setRecipes((prevRecipes) =>
        prevRecipes.map((recipe) =>
          recipe.id === recipeId ? { ...recipe, ...response.data } : recipe
        )
      );
    } catch (error) {
      console.error("Error editing post:", error);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="home-container">
        <Sidebar />  
        <main className="feed">
          <h2>Feed</h2>
          {error && <div className="error-message">{error}</div>}
          <div className="filter-options">
            <label>
              Filter by tag:
              <select onChange={(e) => setFilterTag(e.target.value)} value={filterTag || ""}>
                <option value="">All</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Gluten-Free">Gluten-Free</option>
                <option value="Lactose-Free">Lactose-Free</option>
                <option value="Nut Allergy">Nut Allergy</option>
                <option value="Shellfish Allergy">Shellfish Allergy</option>
              </select>
            </label>
            <label>
              <input
                type="checkbox"
                checked={showMyPosts}
                onChange={(e) => setShowMyPosts(e.target.checked)}
              />
              Show my posts
            </label>
          </div>
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
              resetTrigger={resetTrigger} // 🔹 מעביר את הפרופ החדש
            />
            <button onClick={handlePostSubmit} className="post-button">Post</button>
          </div>
          
          {recipes.map((recipe) => (
            <div key={recipe.id} className="post">
              <h3>{recipe.title}</h3>
              {recipe.image && <img src={`${BASE_URL}/${recipe.image}`} alt="Post" className="post-image" />}
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
                {recipe.owner === userId && (
                  <div className="edit-delete-buttons">
                    <button onClick={() => handleEdit(recipe.id, recipe.title, recipe.ingredients.join("\n"), recipe.tags || [])} className="edit-button">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(recipe.id)} className="delete-button">
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div className="pagination">
            <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
              Next
            </button>
          </div>
        </main>
      </div>
    </FormProvider>
  );
};

export default Home;
