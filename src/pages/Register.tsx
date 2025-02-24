import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import "../styles/Register.css";
import avatar from "../assets/avatar.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  last_name: z.string().min(1, "Last name is required"),
  background: z.string().optional(),
  img: z.instanceof(File).optional(),
  profile: z.string().optional(),
  allergies: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof schema>;

const RegisterPage: FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const { register, handleSubmit, formState } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    console.log("Submitting form data:", data); // בדיקה אם הקוד בכלל רץ
    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("name", data.name);
      formData.append("last_name", data.last_name);
      formData.append("background", data.background || "");
      if (data.img) formData.append("img", data.img);
      formData.append("profile", data.profile || "");
      formData.append("allergies", JSON.stringify(data.allergies || []));
  
      const response = await axios.post("http://localhost:4040/users/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      console.log("User registered:", response.data);
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };
  

  // const handleGoogleSignup = (response: any) => {
  //   console.log("Google Signup Response:", response);
  //   // Handle Google signup here
  // };

  const allergyOptions = [
    "Vegetarian",
    "Vegan",
    "Gluten-Free",
    "Lactose-Free",
    "Nut Allergy",
    "Shellfish Allergy",
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="register-container">
      <div className="register-header">
        <img
          src={file ? URL.createObjectURL(file) : avatar}
          alt="Profile Avatar"
          className="register-avatar"
        />
        <label className="register-upload">
          <FontAwesomeIcon icon={faImage} />
          <input
            {...register("img")}
            type="file"
            accept="image/jpeg, image/png"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>

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

        {/* <label>Background:</label>
        <input {...register("background")} type="text" /> */}

        {/* <label>Profile:</label>
        <input {...register("profile")} type="text" /> */}

        <label>Allergies/Preferences:</label>
        <div className="allergies-container">
          {allergyOptions.map((option) => (
            <div key={option} className="allergy-option">
              <input
                {...register("allergies")}
                type="checkbox"
                value={option}
                id={option}
              />
              <label htmlFor={option}>{option}</label>
            </div>
          ))}
        </div>

        <button type="submit">Register</button>

        <p>Or sign up with:</p>
        <GoogleLogin
          onSuccess={(CredentialResponse) => {
            console.log(CredentialResponse);
          }}
          onError={() => console.log("Google Signup Error")}
        />
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </form>
  );
};

export default RegisterPage;
