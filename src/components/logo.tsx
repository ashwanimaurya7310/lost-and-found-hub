import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  width?: number;
  height?: number;
  priority?: boolean;
}

export function Logo({
  className = '',
  size = 'md',
  width,
  height,
  priority = false,
}: LogoProps) {
  // Full emblem ratio: 209 / 237 ≈ 0.882
  const sizeMap = {
    sm: { width: 32, height: 36 },
    md: { width: 44, height: 50 },
    lg: { width: 56, height: 64 },
    xl: { width: 75, height: 85 },
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const finalWidth = width ?? currentSize.width;
  const finalHeight = height ?? currentSize.height;

  return (
    <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
      <Image
        src="/logo-ashoka-crest.png"
        alt="Ashoka Varanasi Logo"
        width={finalWidth}
        height={finalHeight}
        className="object-contain h-auto max-w-full"
        priority={priority}
      />
    </div>
  );
}

