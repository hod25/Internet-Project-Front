import { FC, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../config/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import "../styles/RecipeDetails.css";

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

const PostDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [comment, setComment] = useState<string>("");

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/recipe/${id}`);
        setRecipe(response.data);
      } catch (error) {
        console.error("Error fetching recipe details:", error);
      }
    };
    fetchRecipe();
  }, [id]);

  const handleLike = async () => {
    if (!recipe) return;
    try {
      await axios.post(`${BASE_URL}/recipe/${recipe.id}/like`);
      setRecipe({ ...recipe, likes: recipe.likes + 1 });
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!comment.trim() || !recipe) return;
    try {
      await axios.post(`${BASE_URL}/recipe/${recipe.id}/comment`, { comment });
      setRecipe({ ...recipe, comments: [...recipe.comments, comment] });
      setComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }   
    };

  if (!recipe) return <div>Loading...</div>;

  return (
    <div className="post-details">
      <Link to="/">Back to Home</Link>
      <h2>{recipe.title}</h2>
      {recipe.image && <img src={`${BASE_URL}/${recipe.image}`} alt="Recipe" className="post-image" />}
      <div className="tags">
        {recipe.tags?.map((tag, index) => (
          <span key={index} className="tag">#{tag}</span>
        ))}
      </div>
      <button onClick={handleLike} className="like-button">
        <FontAwesomeIcon icon={faThumbsUp} /> {recipe.likes}
      </button>
      <div className="comments">
        <h3>Comments</h3>
        {recipe.comments && recipe.comments.length > 0 ? ( // added check for recipe.comments
          recipe.comments.map((c, index) => <p key={index}>{c}</p>)
        ) : (
          <p>No comments yet</p>
        )}
        <input
          type="text"
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="comment-input"
        />
        <button onClick={handleCommentSubmit} className="comment-button">Submit</button>
      </div>
    </div>
  );
};

export default PostDetails;
