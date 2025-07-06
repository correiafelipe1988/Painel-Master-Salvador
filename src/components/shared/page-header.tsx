
import type React from 'react';
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  icon?: React.ElementType;
  iconContainerClassName?: string;
}

export function PageHeader({ title, description, actions, icon: Icon, iconContainerClassName }: PageHeaderProps) {
  return (
    <div className="mb-6 md:flex md:items-center md:justify-between">
      <div className="min-w-0 flex-1 flex items-center gap-3">
        {Icon && (
          <div className={cn("p-2 rounded-lg", iconContainerClassName)}>
            <Icon className="h-8 w-8 text-primary-foreground" />
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold leading-7 text-foreground sm:truncate sm:text-3xl sm:tracking-tight font-headline">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="mt-4 flex flex-shrink-0 md:ml-4 md:mt-0 gap-2">{actions}</div>}
    </div>
  );
}
