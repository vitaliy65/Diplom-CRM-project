"use client";

import { useCallback } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterIcon, X } from "lucide-react";
import { useIsMobile } from "@/components/ui/use-mobile";
import { EntityFilterSortConfig, FilterFieldConfig } from "@/filters/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface FilterPanelProps<T> {
  config: EntityFilterSortConfig<T>;
  activeFilters: Array<{ field: keyof T; value: unknown }>;
  onSetFilter: (field: keyof T, value: unknown) => void;
  onClearFilters: () => void;
}

// ─── Field renderers ──────────────────────────────────────────────────────────

function TextField<T>({
  fieldCfg,
  value,
  onChange,
}: {
  fieldCfg: FilterFieldConfig<T>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {fieldCfg.label}
      </Label>
      <Input
        placeholder={`Пошук по ${fieldCfg.label.toLowerCase()}...`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 text-sm bg-background border border-border"
      />
    </div>
  );
}

function SelectField<T>({
  fieldCfg,
  value,
  onChange,
}: {
  fieldCfg: FilterFieldConfig<T>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {fieldCfg.label}
      </Label>
      <Select
        value={value || "__all__"}
        onValueChange={(v) => onChange(v === "__all__" ? "" : v)}
      >
        <SelectTrigger className="h-8 text-sm bg-background border border-border">
          <SelectValue placeholder="Всі" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Всі</SelectItem>
          {fieldCfg.options?.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function MultiSelectField<T>({
  fieldCfg,
  value,
  onChange,
}: {
  fieldCfg: FilterFieldConfig<T>;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (v: string) => {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {fieldCfg.label}
      </Label>
      <div className="flex flex-wrap gap-1.5">
        {fieldCfg.options?.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              value.includes(opt.value)
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border hover:bg-muted"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function BooleanField<T>({
  fieldCfg,
  value,
  onChange,
}: {
  fieldCfg: FilterFieldConfig<T>;
  value: boolean | undefined;
  onChange: (v: boolean | undefined) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {fieldCfg.label}
      </Label>
      <Switch
        checked={value === true}
        onCheckedChange={(checked) => onChange(checked ? true : undefined)}
        className="bg-background border border-border"
      />
    </div>
  );
}

function NumberRangeField<T>({
  fieldCfg,
  value,
  onChange,
}: {
  fieldCfg: FilterFieldConfig<T>;
  value: [number?, number?];
  onChange: (v: [number?, number?]) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {fieldCfg.label}
      </Label>
      <div className="flex gap-2 items-center">
        <Input
          type="number"
          placeholder="Від"
          className="h-8 text-sm bg-background border border-border"
          value={value[0] ?? ""}
          onChange={(e) =>
            onChange([
              e.target.value ? Number(e.target.value) : undefined,
              value[1],
            ])
          }
        />
        <span className="text-muted-foreground text-xs">—</span>
        <Input
          type="number"
          placeholder="До"
          className="h-8 text-sm bg-background border border-border"
          value={value[1] ?? ""}
          onChange={(e) =>
            onChange([
              value[0],
              e.target.value ? Number(e.target.value) : undefined,
            ])
          }
        />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FilterPanel<T>({
  config,
  activeFilters,
  onSetFilter,
  onClearFilters,
}: FilterPanelProps<T>) {
  const isMobile = useIsMobile();
  const activeCount = activeFilters.length;

  const getFieldValue = useCallback(
    (field: keyof T) => activeFilters.find((f) => f.field === field)?.value,
    [activeFilters],
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="button-el relative">
          <FilterIcon className="h-4 w-4" />
          {!isMobile && <span>Фільтр</span>}
          {activeCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1.5 -right-1.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] rounded-full"
            >
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0 shadow-2xl bg-card"
        align="center"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="text-sm font-semibold">Фільтри</span>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClearFilters}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="h-3 w-3" />
              Скинути всі
            </button>
          )}
        </div>

        {/* Fields */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {config.filters.map((fieldCfg) => {
            const key = String(fieldCfg.field);
            const currentValue = getFieldValue(fieldCfg.field);

            if (fieldCfg.type === "text") {
              return (
                <TextField
                  key={key}
                  fieldCfg={fieldCfg}
                  value={(currentValue as string) ?? ""}
                  onChange={(v) => onSetFilter(fieldCfg.field, v)}
                />
              );
            }

            if (fieldCfg.type === "select") {
              return (
                <SelectField
                  key={key}
                  fieldCfg={fieldCfg}
                  value={(currentValue as string) ?? ""}
                  onChange={(v) => onSetFilter(fieldCfg.field, v)}
                />
              );
            }

            if (fieldCfg.type === "multi-select") {
              return (
                <MultiSelectField
                  key={key}
                  fieldCfg={fieldCfg}
                  value={(currentValue as string[]) ?? []}
                  onChange={(v) => onSetFilter(fieldCfg.field, v)}
                />
              );
            }

            if (fieldCfg.type === "boolean") {
              return (
                <BooleanField
                  key={key}
                  fieldCfg={fieldCfg}
                  value={currentValue as boolean | undefined}
                  onChange={(v) => onSetFilter(fieldCfg.field, v)}
                />
              );
            }

            if (fieldCfg.type === "number-range") {
              return (
                <NumberRangeField
                  key={key}
                  fieldCfg={fieldCfg}
                  value={(currentValue as [number?, number?]) ?? []}
                  onChange={(v) => onSetFilter(fieldCfg.field, v)}
                />
              );
            }

            return null;
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
