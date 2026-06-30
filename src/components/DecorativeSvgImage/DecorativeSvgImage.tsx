import Image from 'next/image';

type DecorativeSvgImageProps = {
  className?: string;
  dataIconId?: string;
  dataTestId?: string;
  height?: number;
  src: string;
  width?: number;
};

export function DecorativeSvgImage({
  className,
  dataIconId,
  dataTestId,
  height = 16,
  src,
  width = 16,
}: DecorativeSvgImageProps) {
  return (
    <Image
      alt=""
      aria-hidden="true"
      className={className}
      data-icon-id={dataIconId}
      data-testid={dataTestId}
      draggable={false}
      height={height}
      src={src}
      unoptimized
      width={width}
    />
  );
}
