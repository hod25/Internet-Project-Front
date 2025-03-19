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
import { log } from "console";
//import RecipeComments from './Comments';

interface Recipe {
  _id: number;
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
  const [comments, setComments] = useState<{ [key: string]: string[] }>({});
  const methods = useForm();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [showMyPosts, setShowMyPosts] = useState<boolean>(false);
  //const [userId, setUserId] = useState<string | null>(null);
  const userId = localStorage.getItem('userId')||""; // שליפת ה-userId מה-LocalStorage
  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});  // מאגר שמות המשתמשים
  const [newComment, setNewComment] = useState<string>('');
  

  useEffect(() => {
    const fetchRecipes = async (retryCount = 0) => {
      try {
        const response = await fetch(`${BASE_URL}/recipe?page=${page}&limit=10`);
        const data = await response.json();
        console.log("Fetched data:", data); // בדוק מה מחזיר ה-API
        let filteredRecipes = Array.isArray(data.recipes) ? data.recipes : [];

        filteredRecipes.forEach((recipe:Recipe) => {
          console.log(`${BASE_URL}/${recipe.image}`); // בדיקה אם הכתובת של התמונה מגיעה נכון
        });
        
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

  useEffect(() => {
    // עבור כל מתכון, נבצע את הקריאה ל-fetchComments
    recipes.forEach(recipe => {
      fetchComments(recipe._id); // שליפת התגובות עבור המתכון הזה
    });
  }, [recipes]);  // קריאה פעם אחת לאחר שהמתכונים נטענו


  const handleCommentChange = (e : string) => {
    // הוספת התו החדש לתגובה הקודמת
    setNewComment(e);
  };

  useEffect(() => {
    if (userId) {
      const fetchUserName = async (userId: string) => {
        try {
          const response = await axios.get(`${BASE_URL}/users/${userId}`);
          setUserNames(prevUserNames => ({
            ...prevUserNames,
            [userId]: `${response.data.name} ${response.data.last_name}`,  // מניח ששם המשתמש נמצא בשדות "name" ו-"last_name"
          }));
        } catch (error) {
          setError('Failed to fetch user name');
        }
      };

      fetchUserName(userId);
    }
  }, [userId]);
  
    
  const [resetTrigger, setResetTrigger] = useState(false);

  const handlePostSubmit = async () => {
    const trimmedTitle = title.trim();
    const trimmedPost = newPost.trim();
  
    if (!trimmedTitle || (!trimmedPost && !image)) {
      alert("Title and either post content or image are required.");
      return;
    }

    const token = localStorage.getItem("token");
    const email = localStorage.getItem("userId");
  
    if (!email || !token) {
      console.error("No email or token found in localStorage.");
      return;
    }

    let userId = ""

    try {
      // שליחת המייל לשרת על מנת לקבל את מזהה המשתמש
        const response = await axios.get(`${BASE_URL}/users/${email}`);
        userId = response.data[0]._id; // קבלת מזהה המשתמש מהשרת

      if (!token) {
        console.error("No token found in localStorage.");
        return;
      }
    }catch {
      console.log("User id not found");
      return;
    }
    
    try {
      let postData = new FormData();
      let imageUri=""

      if (image) {
        postData.append("image", image);
        response = await axios.post(
          `${BASE_URL}/recipe/upload/`,
          postData,
          {
              headers: {
                  "Content-Type": "multipart/form-data" 
              }
          }
        );
        if (response.status==200)
          imageUri = response.data.url.replace(/\\/g, "/")
      }

      postData = new FormData()
      postData.append("title", trimmedTitle);
      postData.append("ingredients", JSON.stringify(trimmedPost
          .split("\n")
          .map(ingredient => ingredient.trim())
          .filter(ingredient => ingredient)));
      postData.append("tags", selectedAllergies.length > 0 ? JSON.stringify(selectedAllergies) : JSON.stringify([]));
      postData.append("likes", "0");
      postData.append("owner", userId);
      postData.append("image", imageUri)
      
      var response;
      try {

        response = await axios.post(
            `${BASE_URL}/recipe/`,
            postData,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`  
                }
            }
        );
        console.log(response);
        
      } catch (error: any) {
          if (error.response && error.response.status === 401) {
              console.warn("JWT לא תקף, מנסה שוב עם Google Token...");

              try {
                  response = await axios.post(
                      `${BASE_URL}/recipe/`,
                      postData,
                      {
                          headers: {
                              "Content-Type": "application/json",
                              Authorization: `JWT ${token}`
                          }
                      }
                  );
              } catch (googleError) {
                  console.error("ניסיון עם Google Token נכשל:", googleError);
                  throw googleError; // זריקת השגיאה החוצה אם גם Google נכשל
              }
          } else {
              console.error("שגיאה בשליחת הבקשה:", error);
              throw error;
          }
      }
  
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

  const createRandomRecipe = async () => {
    var response;

    try {
      const token = localStorage.getItem("token");
      response = await axios.get(`${BASE_URL}/users/${userId}`);
      let Id :string = response.data[0]._id; // קבלת מזהה המשתמש מהשרת
      
      try {
        response = await axios.post(
            `${BASE_URL}/recipe/random`,
            { owner: Id },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`  
                }
            }
        );
      } catch (error: any) {
          if (error.response && error.response.status === 401) {
              console.warn("JWT לא תקף, מנסה שוב עם Google Token...");

              try {
                  response = await axios.post(
                      `${BASE_URL}/recipe/random`,
                      { owner: Id },
                      {
                          headers: {
                              "Content-Type": "application/json",
                              Authorization: `JWT ${token}`
                          }
                      }
                  );
              } catch (googleError) {
                  console.error("ניסיון עם Google Token נכשל:", googleError);
                  throw googleError; // זריקת השגיאה החוצה אם גם Google נכשל
              }
          } else {
              console.error("שגיאה בשליחת הבקשה:", error);
              throw error;
          }
      }
      const randomRecipe = response.data;
  
      if (randomRecipe) {
        setRecipes((prevRecipes) => [randomRecipe, ...prevRecipes]);
      }
    } catch (error) {
      console.error("Error fetching random recipe:", error);
    }
  };
  

  const fetchComments = async (recipeId: number) => {
    try {
      const response = await axios.get(`${BASE_URL}/comments/recipe/${recipeId}`);
      const commentsWithUserNames = await Promise.all(response.data.map(async (comment: any) => {
        // שליפת שם המשתמש לפי ה-ID של ה-owner
        const userResponse = await axios.get(`${BASE_URL}/users/id/${comment.owner}`);
        
        return {
          ...comment,
          ownerName: `${userResponse.data.name} ${userResponse.data.last_name}`,  // שמירה של שם המשתמש עם התגובה
        };
      }));

      setComments((prevComments) => ({
        ...prevComments,
        [recipeId]: commentsWithUserNames,
      }));
    } catch (error) {
      setError('Failed to fetch comments');
    }
  };

  const handleLike = async (recipeId: number) => {  
    if (!recipeId) {
      console.error("Error: recipeId is undefined");
      return;
    }
    try {
      await axios.put(`${BASE_URL}/recipe/like/${recipeId}`);
      setRecipes((prevRecipes) =>
        prevRecipes.map((recipe) =>
          recipe._id === recipeId ? { ...recipe, likes: recipe.likes + 1 } : recipe
        )
      );
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleCommentSubmit = async (recipeId: number) => {
    const commentText = newComment;
    
    if (!commentText) return;
  
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("userId");
  
    if (!email || !token) {
      console.error("No email or token found in localStorage.");
      return;
    }
    let postResponse;
    try {
      // שליחת המייל לשרת על מנת לקבל את מזהה המשתמש
      const response = await axios.get(`${BASE_URL}/users/${email}`);
      let userId :string = response.data[0]._id; // קבלת מזהה המשתמש מהשרת
      //userId=userId.replace("=","");
      
      try {
        // שליחת הבקשה עם ה-JWT
        postResponse = await axios.post(
          `${BASE_URL}/comments/`,
          { 
            comment: commentText,
            recipeId: recipeId,
            owner: userId,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        setRecipes((prevRecipes) =>
          prevRecipes.map((recipe) =>
            recipe._id === recipeId
              ? {
                  ...recipe,
                  comments: Array.isArray(recipe.comments) 
                    ? [...recipe.comments, commentText] 
                    : [commentText], // אם comments לא מערך, ניצור מערך חדש
              }
              : recipe
          )
        );
        
  
        setComments((prevComments) => ({
          ...prevComments,
          [recipeId]: [], 
        }));
  
      } catch (error: any) {
        if (error.response && error.response.status === 401) {
          console.warn("JWT לא תקף, מנסה שוב עם Google Token...");
  
          try {
            postResponse = await axios.post(
              `${BASE_URL}/comments/`,
              { 
                comment: commentText,
                recipe: recipeId,
                owner: userId,
              },
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `JWT ${token}`,
                },
              }
            );
  
            setRecipes((prevRecipes) =>
              prevRecipes.map((recipe) =>
                recipe._id === recipeId
                  ? { ...recipe, comments: [...recipe.comments, commentText] }
                  : recipe
              )
            );
  
            setComments((prevComments) => ({
              ...prevComments,
              [recipeId]: [], // Reset comment after submission
            }));
            fetchComments(recipeId);
          } catch (googleError) {
            console.error("ניסיון עם Google Token נכשל:", googleError);
          }
        } else {
          console.error("Error commenting on post:", error);
        }
      }
    } catch (error) {
      console.error("Error retrieving user id:", error);
    }
  };

  const setFileToImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validImageTypes.includes(selectedFile.type)) {
        alert("Invalid file type! Please select an image (JPEG, PNG, GIF, WebP).");
        return;
      }

      setImage(selectedFile)
    }
  };

  const handleDelete = async (recipeId: number) => {
    try {
      await axios.delete(`${BASE_URL}/recipe/${recipeId}`);
      setRecipes((prevRecipes) => prevRecipes.filter((recipe) => recipe._id !== recipeId));
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
          recipe._id === recipeId ? { ...recipe, ...response.data } : recipe
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
          {error && error !== "Failed to fetch comments" && <div className="error-message">{error}</div>}
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
                  onChange={(e) => {setFileToImage(e)} }
                  className="hidden-image-input"
                />
              </label>
              <label>Tags:</label>
              <AllergiesPreferences
                options={[
                  "Vegetarian",
                  "Vegan",  
                  "Gluten-Free",
                  "Lactose-Free",
                  "Nut Allergy",
                  "Shellfish Allergy",
                ]}
                onChange={setSelectedAllergies}
                resetTrigger={resetTrigger}
              />
              <button onClick={handlePostSubmit} className="post-button">Post</button>
              <button onClick={createRandomRecipe} className="surprise-button">
                Surprise Me!
              </button>
          </div>

          {recipes.map((recipe) => (
            <div key={recipe._id} className="post">
              <h3>{recipe.title}</h3>
              {recipe.image && <img src={
                recipe.image.startsWith("http") // אם זה כבר URL מלא (התחיל ב-http)
                    ? recipe.image // השתמש בקישור המלא
                    : `${BASE_URL}/${recipe.image}` // אחרת, השתמש ב-BASE_URL של השרת
                } 
                alt="Post" className="post-image" />}
              <h4 className="ingredients-title">Ingredients:</h4>
              <ul className="ingredients-list">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>              
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
                <button onClick={() => handleLike(recipe._id)} className="like-button">
                  <FontAwesomeIcon icon={faThumbsUp} /> {recipe.likes}
                </button>
                <div className="comments-section">
                  {/* Input לשליחת תגובה */}
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    //value={comments[recipe._id] || ""}
                    onChange={(e) => handleCommentChange(e.target.value)}
                    className="comment-input"
                  />
                  <button onClick={() => handleCommentSubmit(recipe._id)} className="comment-button">
                    <FontAwesomeIcon icon={faComment} />
                  </button>
                  <div className="comments-list">
                    {Array.isArray(comments[recipe._id]) && comments[recipe._id].length > 0 ? (
                      comments[recipe._id].map((comment: any, index: number) => (
                        <p key={index}>
                          <div className="comment-header">
                            <span className="comment-owner">{comment.ownerName}</span>
                          </div>
                          <p className="comment-text">{comment.comment}</p>
                        </p>
                      ))
                    ) : (
                      <p>No comments yet...</p>
                    )}
                  </div>


                </div>
                {recipe.owner === userId && (
                  <div className="edit-delete-buttons">
                    <button onClick={() => handleEdit(recipe._id, recipe.title, recipe.ingredients.join("\n"), recipe.tags || [])} className="edit-button">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(recipe._id)} className="delete-button">
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
