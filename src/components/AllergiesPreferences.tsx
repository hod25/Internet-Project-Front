import React, { FC, useState, ReactNode } from "react";
import { useFormContext } from "react-hook-form";

interface AllergiesPreferencesProps {
  options: string[];
  onChange: (selected: string[]) => void;
}

const AllergiesPreferences: FC<AllergiesPreferencesProps> = ({ options, onChange }) => {
  const { register } = useFormContext();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleOptionChange = (option: string) => {
    const newSelectedOptions = selectedOptions.includes(option)
      ? selectedOptions.filter((item) => item !== option)
      : [...selectedOptions, option];
    setSelectedOptions(newSelectedOptions);
    onChange(newSelectedOptions);
  };

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
      <p>Selected: {selectedOptions.join(", ")}</p> {/* הצגת התגיות שנבחרו */}
    </div>
  );
};

class ErrorBoundary extends React.Component<{ children: ReactNode }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Error caught in ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h2>Something went wrong.</h2>;
    }

    return this.props.children;
  }
}

const AllergiesPreferencesWithErrorBoundary: FC<AllergiesPreferencesProps> = (props) => (
  <ErrorBoundary>
    <AllergiesPreferences {...props} />
  </ErrorBoundary>
);

export default AllergiesPreferencesWithErrorBoundary;
