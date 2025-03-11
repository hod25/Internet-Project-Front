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
import { BASE_URL } from "../config/constants";

const schema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  background: z.string().optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  img: z.any().optional(),
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
        const email = localStorage.getItem("userId");
        if (!email) {
          console.error("No email found, user might be logged out.");
          return;
        }

        const response = await axios.get(`${BASE_URL}/users/${email}`);
        const userData = response.data[0];

        const tagsResponse = await axios.get(`${BASE_URL}/users/tags/${userData._id}`);
        
        reset({
          name: userData.name || "",
          background: userData.background || "",
          tags: tagsResponse.data.tags.map((tag: { name: string }) => tag.name) || [],
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [reset]);

  const onSubmit = async (data: FormData) => {
    try {
      console.log("submit");
      console.log("Form data:", data);  // מדפיס את הנתונים שמתקבלים בטופס

      // אם הנתון התקבל כמערך, נחבר אותו חזרה למחרוזת לפני שנפצל לפסיקים
      const tagsString = Array.isArray(data.tags) ? data.tags.join(",") : data.tags || "";
        
      // המרת tags ממחרוזת למערך (אם יש נתונים)
      const tagsArray = tagsString.split(",").map(tag => tag.trim()).filter(tag => tag !== "");

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("background", data.background || "");
      formData.append("tags", JSON.stringify(tagsArray)); // שליחה כ-JSON

      const email = localStorage.getItem("userId");  // כאן אתה מקבל את המייל
      if (email) {
        formData.append("email", email);  // מוסיף את המייל ל-FormData
      } else {
        console.error("No email found in localStorage");
      }

      if (file) {
          formData.append("img", file);
      }

      var response;
      const token = localStorage.getItem("token");

      try {
        for (let [key, value] of formData.entries()) {
          console.log(`${key}: ${value}`);
        }
        response =await axios.put(`${BASE_URL}/users/`, formData, {
            withCredentials: true,
            headers: { "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
        });
        console.log(response)
      } catch (error: any) {
          if (error.response && error.response.status === 401) {
              console.warn("JWT לא תקף, מנסה שוב עם Google Token...");

              try {
                  response = await axios.put(`${BASE_URL}/users/`, formData, {
                      withCredentials: true,
                      headers: { "Content-Type": "application/json",
                      Authorization: `JWT ${token}`}
                    });
                  console.log(response)
              } catch (googleError) {
                  console.error("ניסיון עם Google Token נכשל:", googleError);
                  throw googleError; // זריקת השגיאה החוצה אם גם Google נכשל
              }
          } else {
              console.error("שגיאה בשליחת הבקשה:", error);
              throw error;
          }
      }

      console.log("Profile updated:", response.data);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    }
  };

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

            <label>Background:</label>
            <input {...register("background")} type="text" />

            <label>Tags:</label>
            <input {...register("tags")} type="text" />

            <button type="submit" onClick={() => console.log("Form errors:", formState.errors)}>Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;