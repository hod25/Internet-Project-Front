import { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Register.css";
import { GoogleLogin } from "@react-oauth/google";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  last_name: z.string().min(1, "Last name is required"),
});

type FormData = z.infer<typeof schema>;

const RegisterPage: FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await axios.post("http://localhost:4040/users/register", data, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("User registered:", response.data);

      // שמירת טוקן (אם קיים)
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      // העברת המשתמש לדף הבית
      navigate("/");
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="register-container">
      <div className="register-header">
        <label>Email:</label>
        <input {...register("email")} type="email" />
        {formState.errors.email && <p>{formState.errors.email.message}</p>}

        <label>Password:</label>
        <input {...register("password")} type="password" />
        {formState.errors.password && <p>{formState.errors.password.message}</p>}

        <label>Name:</label>
        <input {...register("name")} type="text" />
        {formState.errors.name && <p>{formState.errors.name.message}</p>}

        <label>Last Name:</label>
        <input {...register("last_name")} type="text" />
        {formState.errors.last_name && <p>{formState.errors.last_name.message}</p>}

        <button type="submit">Register</button>

        <p>Or sign up with:</p>
        <GoogleLogin
          onSuccess={(CredentialResponse) => {
            console.log(CredentialResponse);
          }}
          onError={() => console.log("Google Signup Error")}
        />

        <p>
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </form>
  );
};

export default RegisterPage;
