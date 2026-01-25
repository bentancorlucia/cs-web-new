"use client";

import { forwardRef, type HTMLAttributes } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined" | "glass";
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "default",
      hover = false,
      padding = "md",
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = "rounded-2xl overflow-hidden transition-[transform,box-shadow,background,border-color] duration-300 motion-reduce:transition-none";

    const variants = {
      default: cn(
        "bg-white",
        "shadow-lg shadow-black/5",
        hover && "hover:shadow-xl hover:shadow-bordo/10 hover:-translate-y-1"
      ),
      elevated: cn(
        "bg-white",
        "shadow-xl shadow-black/10",
        "border border-gray-100",
        hover && "hover:shadow-2xl hover:shadow-bordo/15 hover:-translate-y-2"
      ),
      outlined: cn(
        "bg-white",
        "border-2 border-gray-200",
        hover && "hover:border-bordo/30 hover:shadow-lg hover:shadow-bordo/10"
      ),
      glass: cn(
        "bg-white/80 backdrop-blur-xl",
        "border border-white/50",
        "shadow-xl shadow-black/5",
        hover && "hover:bg-white/90 hover:shadow-2xl hover:-translate-y-1"
      ),
    };

    const paddings = {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// Card Header
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

// Card Title
interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = "h3", ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(
        "text-xl font-semibold text-gray-900 tracking-tight",
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

// Card Description
interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-gray-600 leading-relaxed", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

// Card Content
interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

// Card Footer
interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center pt-4", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

// Card Image
interface CardImageProps extends HTMLAttributes<HTMLDivElement> {
  src: string;
  alt: string;
  aspectRatio?: "video" | "square" | "portrait";
}

const CardImage = forwardRef<HTMLDivElement, CardImageProps>(
  ({ className, src, alt, aspectRatio = "video", ...props }, ref) => {
    const aspectRatios = {
      video: "aspect-video",
      square: "aspect-square",
      portrait: "aspect-[3/4]",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden -mx-6 -mt-6 mb-4",
          aspectRatios[aspectRatio],
          className
        )}
        {...props}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
    );
  }
);
CardImage.displayName = "CardImage";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardImage,
};
