import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface SearchBoxProps {
  onSearch: (query: string) => void;
}

export default function SearchBox({ onSearch }: SearchBoxProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className="flex relative max-md:w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="пошук..."
        value={searchQuery}
        onChange={handleChange}
        className="pl-9 bg-background/50! border-border focus:border-primary/50"
      />
    </div>
  );
}
