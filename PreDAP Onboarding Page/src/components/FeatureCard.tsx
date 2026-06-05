
import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  className?: string;
}

const FeatureCard = ({
  title,
  description,
  icon: Icon,
  iconColor,
  iconBgColor,
  className
}: FeatureCardProps) => {
  return (
    <div className={cn("feature-card", className)}>
      <div className={`feature-icon ${iconBgColor}`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default FeatureCard;
