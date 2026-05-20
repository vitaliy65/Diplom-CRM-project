import React from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

interface DialogInputI {
  name: string;
  label: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}

export default function DialogInput(props: DialogInputI) {
  return (
    <div className="space-y-2">
      <Label htmlFor={props.name} className="text-sm text-foreground">
        {props.label}
      </Label>
      <Input
        id={props.name}
        name={props.name}
        placeholder="Дисплей iPhone 12"
        value={props.value}
        onChange={props.onChange}
        className="bg-secondary/50 border-border/50 focus:border-primary/50"
        required
      />
    </div>
  );
}
