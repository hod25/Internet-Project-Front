import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import "../styles/EditProfile.css";
import avatar from "../assets/avatar.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";

const schema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  bio: z.string().max(150, "Bio must be 150 characters or less"),
  allergies: z.array(z.string()).optional(), // אלרגיות/רגישויות
  img: z.instanceof(File).optional(), // Add this line
});

type FormData = z.infer<typeof schema>;

const EditProfilePage: FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const { register, handleSubmit, formState } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log("Profile Updated:", data);
  };

  const allergyOptions = [
    "Vegetarian",
    "Vegan",
    "Gluten-Free",
    "Lactose-Free",
    "Nut Allergy",
    "Shellfish Allergy",
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="edit-profile-container">
      <div className="edit-profile-header">
        <img
          src={file ? URL.createObjectURL(file) : avatar}
          alt="Profile Avatar"
          className="edit-profile-avatar"
        />
        <label className="edit-profile-upload">
          <FontAwesomeIcon icon={faImage} />
          <input
            {...register("img")}
            type="file"
            accept="image/jpeg, image/png"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>

        <label>Username:</label>
        <input {...register("username")} type="text" />
        {formState.errors.username && <p>{formState.errors.username.message}</p>}

        <label>Bio:</label>
        <textarea {...register("bio")} rows={3} />
        {formState.errors.bio && <p>{formState.errors.bio.message}</p>}

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

        <button type="submit">Save Changes</button>
      </div>
    </form>
  );
};

export default EditProfilePage;
