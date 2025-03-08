import { FC, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import axios from "axios";
import "../styles/EditProfile.css";
import avatar from "../assets/avatar.png";
import Sidebar from "../components/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";

const schema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  bio: z.string().max(150, "Bio must be 150 characters or less"),
  allergies: z.array(z.string()).optional(),
  img: z.instanceof(File).optional(),
});

type FormData = z.infer<typeof schema>;

const EditProfilePage: FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const { register, handleSubmit, formState, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:4040/users/me", {
          withCredentials: true,
        });
        const userData = response.data;
        console.log("User Data:", userData);

        reset({
          name: userData.name || "",
          bio: userData.bio || "",
          allergies: userData.allergies || [],
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("bio", data.bio);
      if (data.allergies) {
        formData.append("allergies", JSON.stringify(data.allergies));
      }
      if (file) {
        formData.append("img", file);
      }

      const response = await axios.put("http://localhost:4040/users/update", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Profile updated:", response.data);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    }
  };

  const allergyOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Lactose-Free", "Nut Allergy", "Shellfish Allergy"];

  return (
    <div className="edit-profile-container">
      <Sidebar />
      <div className="edit-profile-content">
        <form onSubmit={handleSubmit(onSubmit)} className="edit-profile-form">
          <div className="edit-profile-header">
            <img src={file ? URL.createObjectURL(file) : avatar} alt="Profile Avatar" className="edit-profile-avatar" />
            <label className="edit-profile-upload">
              <FontAwesomeIcon icon={faImage} />
              <input
                {...register("img")}
                type="file"
                accept="image/jpeg, image/png"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>

            <label>Name:</label>
            <input {...register("name")} type="text" />
            {formState.errors.name && <p>{formState.errors.name.message}</p>}

            <label>Bio:</label>
            <textarea {...register("bio")} rows={3} />
            {formState.errors.bio && <p>{formState.errors.bio.message}</p>}

            <label>Allergies/Preferences:</label>
            <div className="allergies-container">
              {allergyOptions.map((option) => (
                <div key={option} className="allergy-option">
                  <input {...register("allergies")} type="checkbox" value={option} id={option} />
                  <label htmlFor={option}>{option}</label>
                </div>
              ))}
            </div>

            <button type="submit">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;