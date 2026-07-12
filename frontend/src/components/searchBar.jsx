import { Input } from "./ui/input";

function SearchBar({ value, onChange, placeholder = "Search..." }) {
  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full sm:w-72"
    />
  );
}

export default SearchBar;
