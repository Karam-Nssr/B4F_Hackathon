import { Link } from "@/i18n/navigation";
import { ChevronRightIcon, HorizontalDotsIcon } from "@/icons";
import { cn } from "@/utils";
import * as React from "react";

const Breadcrumb = ({ className, ...props }: React.ComponentProps<"nav">) => {
  return (
    <nav
      aria-label="breadcrumb"
      data-slot="breadcrumb"
      className={cn(className)}
      {...props}
    />
  );
};

const BreadcrumbList = ({ className, ...props }: React.ComponentProps<"ol">) => {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm wrap-break-word",
        className,
      )}
      {...props}
    />
  );
};

const BreadcrumbItem = ({ className, ...props }: React.ComponentProps<"li">) => {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  );
};

const BreadcrumbLink = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Link>) => {
  return (
    <Link
      slot="breadcrumb-link"
      className={cn(
        "inline-flex items-center gap-1 text-[#6A7282] transition-colors hover:text-brand-500",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
};

const BreadcrumbPage = ({ className, ...props }: React.ComponentProps<"span">) => {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn(
        "font-normal text-[#1E2939] dark:text-[rgba(255,255,255,0.90)]",
        className,
      )}
      {...props}
    />
  );
};

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) => {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn(
        "text-[#6A7282] rtl:*:rotate-180 [&>svg]:size-4",
        className,
      )}
      {...props}
    >
      {children ?? <ChevronRightIcon />}
    </li>
  );
};

const BreadcrumbEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn(
        "flex size-5 items-center justify-center text-[#6A7282] [&>svg]:size-4",
        className,
      )}
      {...props}
    >
      <HorizontalDotsIcon />
      <span className="sr-only">More</span>
    </span>
  );
};

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
};

export default Breadcrumb;
