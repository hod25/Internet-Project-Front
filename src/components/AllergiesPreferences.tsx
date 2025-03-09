import React, { FC, useState, useEffect, ReactNode } from "react";
import { useFormContext } from "react-hook-form";

interface AllergiesPreferencesProps {
  options: string[];
  onChange: (selected: string[]) => void;
  resetTrigger: boolean; // נוסיף פרופ שעוזר לאפס
}

const AllergiesPreferences: FC<AllergiesPreferencesProps> = ({ options, onChange, resetTrigger }) => {
  const { register } = useFormContext();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleOptionChange = (option: string) => {
    const newSelectedOptions = selectedOptions.includes(option)
      ? selectedOptions.filter((item) => item !== option)
      : [...selectedOptions, option];

    setSelectedOptions(newSelectedOptions);
    onChange(newSelectedOptions);
  };

  // 🛠️ בכל פעם ש- resetTrigger משתנה (אחרי פרסום), נאפס את הבחירות
  useEffect(() => {
    setSelectedOptions([]);
  }, [resetTrigger]);

  return (
    <div className="allergies-container">
      {options.map((option) => (
        <div key={option} className="allergy-option">
          <input
            {...register("allergies")}
            type="checkbox"
            value={option}
            id={option}
            checked={selectedOptions.includes(option)}
            onChange={() => handleOptionChange(option)}
          />
          <label htmlFor={option}>{option}</label>
        </div>
      ))}
    </div>
  );
};

export default AllergiesPreferences;
