// // src/pages/Recipes.tsx
// import React from "react";
// import "./Recipes.css";

// const recipes = [
//     {
//         id: 1,
//         title: "פסטה ברוטב עגבניות",
//         description: "מתכון פשוט וטעים לפסטה ברוטב עגבניות קלאסי.",
//         image: "https://source.unsplash.com/400x300/?pasta",
//     },
//     {
//         id: 2,
//         title: "סלט יווני מרענן",
//         description: "סלט יווני קלאסי עם גבינת פטה וזיתים.",
//         image: "https://source.unsplash.com/400x300/?salad",
//     },
//     {
//         id: 3,
//         title: "שקשוקה חריפה",
//         description: "שקשוקה עם עגבניות, פלפלים וביצים.",
//         image: "https://source.unsplash.com/400x300/?shakshuka",
//     },
//     {
//         id: 4,
//         title: "עוגת שוקולד מפנקת",
//         description: "עוגת שוקולד קלה להכנה וטעימה במיוחד.",
//         image: "https://source.unsplash.com/400x300/?chocolate-cake",
//     },
// ];

// const Recipes = () => {
//     return (
//         <div className="recipes-container">
//             <h2>מתכונים</h2>
//             <div className="recipes-grid">
//                 {recipes.map((recipe) => (
//                     <div key={recipe.id} className="recipe-card">
//                         <img src={recipe.image} alt={recipe.title} />
//                         <div className="recipe-info">
//                             <h3>{recipe.title}</h3>
//                             <p>{recipe.description}</p>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default Recipes;
