import Image from "next/image";

interface LogoProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

export function Logo({ width = 40, height = 40, className }: LogoProps) {
  const widthNum = typeof width === "string" ? parseInt(width) || 40 : width;
  const heightNum =
    typeof height === "string" ? parseInt(height) || 40 : height;

  return (
    <Image
      src="/logo_png.png"
      alt="GMS by Better Gondia Logo"
      width={widthNum}
      height={heightNum}
      className={className}
      priority
      unoptimized
    />
  );
}
