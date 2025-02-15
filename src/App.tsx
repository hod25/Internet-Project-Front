import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/login";
import Profile from "./pages/profile";
// import Recipe from "./pages/Recipe";
import Register from "./pages/Register";
// import Profile from "./pages/Profile";
import EditProfilePage from "./pages/EditProfile";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                {/* <Route path="/recipe" element={<Recipe />} /> */}
                <Route path="/register" element={<Register />} />
                {/* <Route path="/profile" element={<Profile />} /> */}
                <Route path="/edit-profile" element={<EditProfilePage />} />
            </Routes>
        </Router>
    );
}

export default App;
