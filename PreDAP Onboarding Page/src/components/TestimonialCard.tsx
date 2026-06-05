
import React from 'react';
import { cn } from '@/lib/utils';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  className?: string;
}

const TestimonialCard = ({
  quote,
  author,
  role,
  className
}: TestimonialCardProps) => {
  return (
    <div className={cn("p-6 rounded-2xl hack-card", className)}>
      <div className="mb-4 text-2xl text-orange-500">"</div>
      <p className="italic mb-6 text-foreground/90">{quote}</p>
      <div>
        <p className="font-semibold">{author}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
    </div>
  );
};

export default TestimonialCard;
