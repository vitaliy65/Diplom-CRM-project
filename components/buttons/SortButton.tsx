import React from "react";
import { Button } from "../ui/button";
import { SortAscIcon } from "lucide-react";

export default function SortButton() {
  return (
    <Button className="button-el">
      <SortAscIcon />
      Sort
    </Button>
  );
}
