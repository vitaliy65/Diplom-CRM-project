import { FilterIcon } from "lucide-react";
import { Button } from "../ui/button";

export default function FilterButton() {
  return (
    <Button className="button-el">
      <FilterIcon />
      Filter
    </Button>
  );
}
