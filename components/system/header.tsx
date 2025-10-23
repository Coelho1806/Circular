"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type HeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function Header({ title, description, actions, className }: HeaderProps) {
  return (
    <div className={cn("mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between", className)}>
      <div>
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        {description && <p className="text-sm text-slate-400">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
