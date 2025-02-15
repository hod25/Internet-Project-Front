import { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import "../styles/login.css";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

const Login: FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log("Login Data:", data);
    navigate("/profile");
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
          onSuccess={() => navigate("/profile")}
          onError={() => console.log("Google Login Error")}
          useOneTap
        />
                <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>

      </div>
    </form>
  );
};

export default Login;
