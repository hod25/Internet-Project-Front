import { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios"; 
import "../styles/login.css";
import { BASE_URL } from "../config/constants";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

const Login: FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const postData = {
        email: data.email.trim(),
        password: data.password.trim(),
      };

      const response = await axios.post(BASE_URL + "/auth/login", postData, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("Login Response:", response.data); // 🔍 בדיקה שהשרת מחזיר נתונים

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        console.log("Token saved:", localStorage.getItem("token")); // 🔍 בדיקה אם הטוקן נשמר
        navigate("/profile");
      } else {
        console.error("No token received from server");
      }
    } catch (error: any) {
      console.error("Login Error:", error.response?.data?.message || "Login failed");
      setError("password", { message: "Invalid email or password" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Email:</label>
        <input {...register("email")} type="text" />
        {formState.errors.email && <p>{formState.errors.email.message}</p>}

        <label>Password:</label>
        <input {...register("password")} type="password" />
        {formState.errors.password && <p>{formState.errors.password.message}</p>}

        <button type="submit">Login</button>

        <p>Or login with:</p>
        <GoogleLogin
          onSuccess={(response) => {
            const token = response.credential;
            if (token) {
              localStorage.setItem("token", token);
              console.log("Google Token saved:", localStorage.getItem("token")); // 🔍 בדיקה אם הטוקן נשמר
              navigate("/profile");
            } else {
              console.error("No token received from Google");
            }
          }}
          onError={() => console.log("Google Login Error")}
          useOneTap
        />

        <p>Don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </form>
  );
};

export default Login;
