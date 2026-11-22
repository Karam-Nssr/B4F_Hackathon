"use client";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import { type VariantProps } from "class-variance-authority";
import * as React from "react";

import { toggleVariants } from "@/components/ui/toggle";
import { cn } from "@/utils";

type ToggleGroupSpacing = 0 | 1 | 2 | 3 | 4;

const spacingClasses: Record<ToggleGroupSpacing, string> = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
};

type ToggleGroupProps = Omit<ToggleGroupPrimitive.Props, "style"> &
  VariantProps<typeof toggleVariants> & {
    spacing?: ToggleGroupSpacing;
    orientation?: "horizontal" | "vertical";
  };

type ToggleGroupItemProps = Omit<TogglePrimitive.Props, "style"> &
  VariantProps<typeof toggleVariants>;

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: ToggleGroupSpacing;
    orientation?: "horizontal" | "vertical";
  }
>({
  size: "default",
  variant: "default",
  spacing: 2,
  orientation: "horizontal",
});

const ToggleGroup = ({
  className,
  variant = "default",
  size = "default",
  spacing = 2,
  orientation = "horizontal",
  children,
  ...props
}: ToggleGroupProps) => {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      className={cn(
        "group/toggle-group flex w-fit flex-row items-center data-vertical:flex-col data-vertical:items-stretch",
        spacingClasses[spacing],
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{ variant, size, spacing, orientation }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  );
};

const ToggleGroupItem = ({
  className,
  children,
  variant,
  size,
  ...props
}: ToggleGroupItemProps) => {
  const context = React.useContext(ToggleGroupContext);
  const resolvedVariant = variant ?? context.variant ?? "default";
  const resolvedSize = size ?? context.size ?? "default";

  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      data-variant={resolvedVariant}
      data-size={resolvedSize}
      data-spacing={context.spacing}
      className={cn(
        "shrink-0 hover:relative hover:z-1 focus-visible:relative focus-visible:z-10 aria-pressed:relative aria-pressed:z-10 data-pressed:relative data-pressed:z-10",
        // Connected item styling when spacing is 0
        "group-data-[spacing=0]/toggle-group:rounded-none",
        // Horizontal orientation - corner rounding
        "group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-s-[10px] group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-e-[10px]",
        "data-[size=sm]:group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-s-lg data-[size=sm]:group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-e-lg",
        "data-[size=xs]:group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-s-lg data-[size=xs]:group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-e-lg",
        "data-[size=icon-sm]:group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-s-lg data-[size=icon-sm]:group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-e-lg",
        "data-[size=icon-xs]:group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-s-lg data-[size=icon-xs]:group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-e-lg",
        // Horizontal orientation - outline border deduplication (RTL-aware)
        "group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:not-first:border-s-0",
        // Vertical orientation - corner rounding
        "group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-[10px] group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-[10px]",
        "data-[size=sm]:group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-lg data-[size=sm]:group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-lg",
        "data-[size=xs]:group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-lg data-[size=xs]:group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-lg",
        "data-[size=icon-sm]:group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-lg data-[size=icon-sm]:group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-lg",
        "data-[size=icon-xs]:group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-lg data-[size=icon-xs]:group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-lg",
        // Vertical orientation - outline border deduplication
        "group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:not-first:border-t-0",
        toggleVariants({
          variant: resolvedVariant,
          size: resolvedSize,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </TogglePrimitive>
  );
};

export { ToggleGroup, ToggleGroupItem };

export default ToggleGroup;
