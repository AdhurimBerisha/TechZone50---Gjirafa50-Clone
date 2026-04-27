import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { SubcategoryOption } from "@/lib/adminSubcategoryOptions";

type ProductSubcategoryPickerProps = {
  idPrefix: string;
  options: SubcategoryOption[];
  value: string[];
  onChange: (slugs: string[]) => void;
  disabled?: boolean;
};

export function ProductSubcategoryPicker({
  idPrefix,
  options,
  value,
  onChange,
  disabled,
}: ProductSubcategoryPickerProps) {
  const toggle = (slug: string, checked: boolean) => {
    if (checked) {
      if (value.includes(slug)) return;
      onChange([...value, slug]);
    } else {
      onChange(value.filter((s) => s !== slug));
    }
  };

  if (options.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Nuk ka nën-kategori të definuara për këtë kategori në sistem.
      </p>
    );
  }

  return (
    <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border border-border p-3">
      {options.map((opt) => {
        const id = `${idPrefix}-${opt.slug}`;
        const checked = value.includes(opt.slug);
        return (
          <div key={opt.slug} className="flex items-start gap-2">
            <Checkbox
              id={id}
              checked={checked}
              onCheckedChange={(v) => toggle(opt.slug, v === true)}
              disabled={disabled}
            />
            <Label htmlFor={id} className="cursor-pointer font-normal leading-tight">
              {opt.label}
              <span className="ml-1 text-xs text-muted-foreground">({opt.slug})</span>
            </Label>
          </div>
        );
      })}
    </div>
  );
}
