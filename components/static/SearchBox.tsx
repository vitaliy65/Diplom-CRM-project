import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { useState } from "react";

export default function SearchBox() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex relative max-md:w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="пошук ..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-9 bg-background/50! border-border focus:border-primary/50"
      />
    </div>
  );
}
