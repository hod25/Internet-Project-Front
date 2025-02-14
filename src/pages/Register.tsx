import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import avatar from "../assets/avatar.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import "../styles/RegistrationForm.css";
import { Link } from "react-router-dom";
// import "../styles/AuthForm.css";


const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  img: z.instanceof(FileList).optional(),
});

type FormData = z.infer<typeof schema>;

const RegistrationForm: FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const { register, handleSubmit, formState } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log("Form Submitted:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <div>
          <img src={file ? URL.createObjectURL(file) : avatar} />
          <label>
            <FontAwesomeIcon icon={faImage} />
            <input
              {...register("img")}
              type="file"
              accept="image/jpeg, image/png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        <label>Email:</label>
        <input {...register("email")} type="text" />
        {formState.errors.email && <p>{formState.errors.email.message}</p>}

        <label>Password:</label>
        <input {...register("password")} type="password" />
        {formState.errors.password && <p>{formState.errors.password.message}</p>}

        <button type="submit">Register</button>

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </form>
  );
};

export default RegistrationForm;
