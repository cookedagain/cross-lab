import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type CollapsibleSectionProps = {
  title: string;
  icon?: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
};

const CollapsibleSection = ({
  title,
  icon,
  description,
  badge,
  defaultOpen = true,
  children,
  className,
}: CollapsibleSectionProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={`mt-8 rounded-[2rem] border-2 border-border bg-card p-5 shadow-sm sm:p-7 ${className ?? ""}`}
    >
      <CollapsibleTrigger className="group flex w-full items-start justify-between gap-3 text-left">
        <div className="flex items-start gap-3">
          {icon && <span className="mt-0.5 text-primary">{icon}</span>}
          <div>
            <h2 className="font-display text-2xl font-black tracking-tight">{title}</h2>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {badge}
          <ChevronDown
            className={`h-5 w-5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-5">{children}</CollapsibleContent>
    </Collapsible>
  );
};

export default CollapsibleSection;