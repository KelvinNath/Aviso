import Image from "next/image";

import { cn } from "@/lib/cn";

type AvisoLogoProps = {
  textClassName?: string;
  imageClassName?: string;
};

const defaultTextClassName = "font-heading text-xl font-bold tracking-tight";
const defaultImageClassName = "h-9 w-auto";

export function AvisoLogo({
  textClassName,
  imageClassName,
}: AvisoLogoProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <Image
        src="/logo.png"
        alt=""
        width={598}
        height={636}
        aria-hidden
        className={cn(defaultImageClassName, imageClassName)}
        priority
      />
      <span
        className={cn(defaultTextClassName, textClassName)}
        aria-label="AvisoMe"
      >
        <span className="text-aviso-dark dark:text-aviso-light">Aviso</span>
        <span className="text-aviso-lime [-webkit-text-stroke:2px_#111111] [paint-order:stroke_fill] dark:[-webkit-text-stroke:0]">
          Me
        </span>
      </span>
    </span>
  );
}
