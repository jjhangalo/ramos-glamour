"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  speed?: number; // Deslocamento Y em pixels, padrão 40
}

export function ParallaxImage({
  src,
  alt,
  className = "",
  containerClassName = "",
  fill = true,
  width,
  height,
  priority = false,
  sizes = "100vw",
  speed = 40,
}: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(true);

  // Hook do framer-motion para acompanhar o progresso de scroll do elemento dentro do viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Transforma o progresso de 0 a 1 em um deslocamento Y de -speed a speed
  const yTransform = useTransform(scrollYProgress, [0, 1], [-speed, speed]);
  
  // Se for mobile (< 768px), o valor de translação Y é neutralizado (fixado em 0)
  const y = isMobile ? 0 : yTransform;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Inicializar no cliente
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${containerClassName}`}
      style={{ willChange: "transform" }} // Garante aceleração por hardware
    >
      <motion.div
        style={{ 
          y,
          height: fill ? "120%" : "auto", // Espaço extra para a translação sem revelar bordas brancas
          top: fill ? "-10%" : "0",
          position: fill ? "absolute" : "relative",
          width: "100%",
        }}
        className="w-full"
      >
        {fill ? (
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes={sizes}
            className={`object-cover ${className}`}
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            priority={priority}
            className={`w-full h-auto object-cover ${className}`}
          />
        )}
      </motion.div>
    </div>
  );
}
