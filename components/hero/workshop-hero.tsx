"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

// Glow Component
const glowVariants = cva("absolute w-full", {
  variants: {
    variant: {
      top: "top-0",
      above: "-top-[128px]",
      bottom: "bottom-0",
      below: "-bottom-[128px]",
      center: "top-[50%]",
    },
  },
  defaultVariants: {
    variant: "top",
  },
});

const Glow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof glowVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(glowVariants({ variant }), className)}
    {...props}
  >
    <div
      className={cn(
        "absolute left-1/2 h-[256px] w-[60%] -translate-x-1/2 scale-[2.5] rounded-[50%] bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.5)_10%,_rgba(59,130,246,0)_60%)] sm:h-[512px]",
        variant === "center" && "-translate-y-1/2"
      )}
    />
    <div
      className={cn(
        "absolute left-1/2 h-[128px] w-[40%] -translate-x-1/2 scale-[2] rounded-[50%] bg-[radial-gradient(ellipse_at_center,_rgba(37,99,235,0.3)_10%,_rgba(37,99,235,0)_60%)] sm:h-[256px]",
        variant === "center" && "-translate-y-1/2"
      )}
    />
  </div>
));
Glow.displayName = "Glow";

// Mockup Components
const mockupVariants = cva(
  "flex relative z-10 overflow-hidden shadow-2xl border border-border/5 border-t-border/15",
  {
    variants: {
      type: {
        mobile: "rounded-[48px] max-w-[350px]",
        responsive: "rounded-md",
      },
    },
    defaultVariants: {
      type: "responsive",
    },
  }
);

interface MockupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof mockupVariants> {}

const Mockup = React.forwardRef<HTMLDivElement, MockupProps>(
  ({ className, type, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(mockupVariants({ type, className }))}
      {...props}
    />
  )
);
Mockup.displayName = "Mockup";

const frameVariants = cva(
  "bg-accent/5 flex relative z-10 overflow-hidden rounded-2xl",
  {
    variants: {
      size: {
        small: "p-2",
        large: "p-4",
      },
    },
    defaultVariants: {
      size: "small",
    },
  }
);

interface MockupFrameProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof frameVariants> {}

const MockupFrame = React.forwardRef<HTMLDivElement, MockupFrameProps>(
  ({ className, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(frameVariants({ size, className }))}
      {...props}
    />
  )
);
MockupFrame.displayName = "MockupFrame";

// Main Hero Component
interface WorkshopHeroProps {
  badge?: {
    text: string;
    action?: {
      text: string;
      href: string;
    };
  };
  title: string;
  description: string;
  primaryCta?: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
  mockupImage?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  className?: string;
}

export function WorkshopHero({
  badge = {
    text: "منصة ورش العمل الرائدة",
    action: {
      text: "اكتشف المزيد",
      href: "#",
    },
  },
  title = "ابدأ رحلتك التعليمية مع أفضل ورش العمل",
  description = "انضم إلى آلاف المتعلمين واكتسب مهارات جديدة من خلال ورش عمل تفاعلية يقدمها خبراء في مجالاتهم. تعلم بالممارسة وحقق أهدافك المهنية.",
  primaryCta = {
    text: "ابدأ الآن",
    href: "#start",
  },
  secondaryCta = {
    text: "تصفح الورش",
    href: "#browse",
  },
  mockupImage,
  className,
}: WorkshopHeroProps) {
  return (
    <>
      <style>{`
        @keyframes appear {
          0% { 
            opacity: 0; 
            transform: translateY(10px); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        @keyframes appear-zoom {
          0% { 
            opacity: 0; 
            transform: scale(0.98); 
          }
          100% { 
            opacity: 1; 
            transform: scale(1); 
          }
        }
        .animate-appear {
          animation: appear 0.5s ease-out forwards;
        }
        .animate-appear-zoom {
          animation: appear-zoom 0.8s ease-out forwards;
        }
        .delay-100 {
          animation-delay: 100ms;
        }
        .delay-300 {
          animation-delay: 300ms;
        }
        .delay-700 {
          animation-delay: 700ms;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
      
      <section
        dir="rtl"
        className={cn(
          "relative bg-background text-foreground",
          "py-12 px-4 md:py-24 lg:py-32",
          "overflow-hidden",
          className
        )}
      >
        <div className="relative mx-auto max-w-[1280px] flex flex-col gap-12 lg:gap-24">
          <div className="relative z-10 flex flex-col items-center gap-6 pt-8 md:pt-16 text-center lg:gap-12">
            {/* Badge */}
            {badge && (
              <Badge
                variant="outline"
                className="animate-appear gap-2 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-blue-600/20 text-foreground"
              >
                <Sparkles className="h-3 w-3 text-blue-600" />
                <span className="text-muted-foreground">{badge.text}</span>
                {badge.action && (
                  <Link
                    href={badge.action.href}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-600/80 transition-colors"
                  >
                    {badge.action.text}
                    <ArrowLeft className="h-3 w-3" />
                  </Link>
                )}
              </Badge>
            )}

            {/* Heading */}
            <h1
              className={cn(
                "inline-block animate-appear",
                "bg-gradient-to-b from-foreground via-foreground/90 to-muted-foreground",
                "bg-clip-text text-transparent",
                "text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl",
                "leading-[1.2] sm:leading-[1.2]",
                "drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]",
                "max-w-4xl"
              )}
            >
              {title}
            </h1>

            {/* Description */}
            <p
              className={cn(
                "max-w-[650px] animate-appear opacity-0 delay-100",
                "text-base sm:text-lg md:text-xl",
                "text-muted-foreground",
                "font-medium leading-relaxed"
              )}
            >
              {description}
            </p>

            {/* CTAs */}
            <div
              className="relative z-10 flex flex-wrap justify-center gap-4 
              animate-appear opacity-0 delay-300"
            >
              <Button
                asChild
                size="lg"
                className={cn(
                  "bg-gradient-to-b from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600",
                  "hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700",
                  "text-white shadow-lg",
                  "transition-all duration-300",
                  "text-base px-8"
                )}
              >
                <Link href={primaryCta.href}>{primaryCta.text}</Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className={cn(
                  "border-2 border-border",
                  "hover:bg-accent hover:text-accent-foreground",
                  "transition-all duration-300",
                  "text-base px-8"
                )}
              >
                <Link href={secondaryCta.href}>{secondaryCta.text}</Link>
              </Button>
            </div>

            {/* Mockup */}
            {mockupImage && (
              <div className="relative w-full pt-12 px-4 sm:px-6 lg:px-8">
                <MockupFrame
                  className={cn(
                    "animate-appear opacity-0 delay-700",
                    "shadow-[0_0_50px_-12px_rgba(0,0,0,0.3)] dark:shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)]",
                    "border-blue-600/10 dark:border-blue-600/5"
                  )}
                  size="small"
                >
                  <Mockup type="responsive">
                    <img
                      src={mockupImage.src}
                      alt={mockupImage.alt}
                      width={mockupImage.width}
                      height={mockupImage.height}
                      className="w-full h-auto rounded-md"
                      loading="lazy"
                    />
                  </Mockup>
                </MockupFrame>
              </div>
            )}
          </div>
        </div>

        {/* Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Glow
            variant="above"
            className="animate-appear-zoom opacity-0 delay-1000"
          />
        </div>
      </section>
    </>
  );
}

