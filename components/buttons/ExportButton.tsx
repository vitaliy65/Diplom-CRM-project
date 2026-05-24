import { DownloadCloud } from "lucide-react";
import { Button } from "../ui/button";

export default function ExportButton() {
  return (
    <Button className="button-el">
      <DownloadCloud />
      Export
    </Button>
  );
}
