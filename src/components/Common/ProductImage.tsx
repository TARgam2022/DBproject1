"use client";
import React from "react";
import Image from "next/image";

type Props = {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
};

const isExternal = (src: string) => /^https?:\/\//i.test(src);

export default function ProductImage({
  src,
  alt = "",
  width,
  height,
  className,
}: Props) {
  if (isExternal(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading="lazy"
      />
    );
  }
  return (
    <Image src={src} alt={alt} width={width} height={height} className={className} />
  );
}
