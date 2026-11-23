"use client";

import { cn } from "@/utils";
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";

interface ScrollAreaProps extends ScrollAreaPrimitive.Root.Props {
  scrollbars?: "vertical" | "horizontal" | "both";
  viewportClassName?: string;
}

const ScrollArea = ({
  className,
  viewportClassName,
  scrollbars = "vertical",
  children,
  ...props
}: ScrollAreaProps) => {
  const showVertical = scrollbars === "vertical" || scrollbars === "both";
  const showHorizontal = scrollbars === "horizontal" || scrollbars === "both";

  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className={cn(
          "focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1",
          scrollbars === "vertical" && "overflow-x-hidden",
          viewportClassName,
        )}
      >
        <ScrollAreaPrimitive.Content className="min-w-0">
          {children}
        </ScrollAreaPrimitive.Content>
      </ScrollAreaPrimitive.Viewport>
      {showVertical && <ScrollBar orientation="vertical" />}
      {showHorizontal && <ScrollBar orientation="horizontal" />}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
};

const ScrollBar = ({
  className,
  orientation = "vertical",
  ...props
}: ScrollAreaPrimitive.Scrollbar.Props) => {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "flex touch-none rounded-full bg-transparent transition-colors select-none data-[orientation=horizontal]:h-2 data-[orientation=horizontal]:w-full data-[orientation=horizontal]:flex-col data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className="relative rounded-full border-2 border-transparent bg-gray-300 bg-clip-padding transition-colors hover:bg-gray-400 data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full dark:bg-gray-600 dark:hover:bg-gray-500"
      />
    </ScrollAreaPrimitive.Scrollbar>
  );
};

export { ScrollArea, ScrollBar };

export default ScrollArea;
