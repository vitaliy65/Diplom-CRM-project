import React from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

interface DialogInputI {
  name: string;
  label: string;
  value: string | number;
  placeholder?: string;
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
        placeholder={props.placeholder}
        value={props.value}
        onChange={props.onChange}
        className="bg-secondary border-border focus:border-primary/50 inset-shadow-sm"
        required
      />
    </div>
  );
}
