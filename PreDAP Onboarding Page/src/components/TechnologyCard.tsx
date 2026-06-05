
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TechnologyCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  direction?: 'left' | 'right';
  className?: string;
}

const TechnologyCard = ({
  title,
  description,
  icon: Icon,
  iconColor,
  direction = 'left',
  className
}: TechnologyCardProps) => {
  return (
    <div className={cn(
      "flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl border bg-white shadow-sm",
      direction === 'right' && "md:flex-row-reverse",
      className
    )}>
      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${iconColor} bg-opacity-10 shrink-0`}>
        <Icon className={`h-8 w-8 ${iconColor}`} />
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default TechnologyCard;
