import { ReactNode } from "react";
import FilterButton from "./FilterButton";
import SortButton from "./SortButton";
import ExportButton from "./ExportButton";
import SearchBox from "../static/SearchBox";
import DividerVertical from "../static/DividerVertical";

interface TopViewButtonsI {
  ChildrenCreateDialog: ReactNode;
}

export default function TopViewButtons({
  ChildrenCreateDialog,
}: TopViewButtonsI) {
  return (
    <div className="flex h-8 justify-between">
      <div className="flex w-fit h-full gap-4">
        <SearchBox />
        <DividerVertical />
        <FilterButton />
        <SortButton />
      </div>
      <div className="flex w-fit h-full gap-4">
        <ExportButton />
        {ChildrenCreateDialog}
      </div>
    </div>
  );
}
