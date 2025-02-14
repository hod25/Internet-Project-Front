import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/login";
import Recipe from "./Recipe";
import Register from "./RegistrationForm";
// import Profile from "./pages/Profile";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/recipe" element={<Recipe />} />
                <Route path="/register" element={<Register />} />
                {/* <Route path="/profile" element={<Profile />} /> */}
            </Routes>
        </Router>
    );
}

export default App;
