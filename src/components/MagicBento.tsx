import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import './MagicBento.css';

interface MagicBentoProps {
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  clickEffect?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  glowColor?: string;
  children?: React.ReactNode;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

const MagicBento: React.FC<MagicBentoProps> = ({
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  enableTilt = true,
  enableMagnetism = true,
  clickEffect = true,
  spotlightRadius = 300,
  particleCount = 12,
  glowColor = '132, 0, 255',
  children,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  // Initialize particles
  const initializeParticles = useCallback(() => {
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3
      });
    }
    particlesRef.current = particles;
  }, [particleCount]);

  // Draw particles on canvas
  const drawParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = `rgba(${glowColor}, 0.6)`;

    particlesRef.current.forEach(particle => {
      const x = (particle.x / 100) * canvas.width;
      const y = (particle.y / 100) * canvas.height;

      ctx.beginPath();
      ctx.arc(x, y, particle.size, 0, Math.PI * 2);
      ctx.fill();

      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.opacity += (Math.random() - 0.5) * 0.02;

      if (particle.x < 0 || particle.x > 100) particle.vx *= -1;
      if (particle.y < 0 || particle.y > 100) particle.vy *= -1;

      particle.opacity = Math.max(0.1, Math.min(1, particle.opacity));
    });
  }, [glowColor]);

  // Animate particles
  const animate = useCallback(() => {
    if (enableStars) {
      drawParticles();
    }
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [enableStars, drawParticles]);

  // Handle mouse move for spotlight and tilt
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update spotlight position
    if (enableSpotlight && spotlightRef.current) {
      spotlightRef.current.style.left = `${x - spotlightRadius / 2}px`;
      spotlightRef.current.style.top = `${y - spotlightRadius / 2}px`;
    }

    // Update border glow for cards
    if (enableBorderGlow) {
      const cards = containerRef.current.querySelectorAll('.magic-bento-card');
      cards.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        const cardX = cardRect.left - rect.left + cardRect.width / 2;
        const cardY = cardRect.top - rect.top + cardRect.height / 2;

        const glowX = ((x - cardX) / cardRect.width) * 100 + 50;
        const glowY = ((y - cardY) / cardRect.height) * 100 + 50;

        (card as HTMLElement).style.setProperty('--glow-x', `${Math.max(0, Math.min(100, glowX))}%`);
        (card as HTMLElement).style.setProperty('--glow-y', `${Math.max(0, Math.min(100, glowY))}%`);
        (card as HTMLElement).style.setProperty('--glow-intensity', '1');
      });
    }

    // Update tilt effect
    if (enableTilt) {
      const cards = containerRef.current.querySelectorAll('.magic-bento-card');
      cards.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        const cardCenterX = cardRect.left + cardRect.width / 2;
        const cardCenterY = cardRect.top + cardRect.height / 2;

        const angleX = (e.clientY - cardCenterY) / 10;
        const angleY = (cardCenterX - e.clientX) / 10;

        (card as HTMLElement).style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg)`;
      });
    }
  }, [enableSpotlight, enableBorderGlow, enableTilt, spotlightRadius]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    if (enableBorderGlow) {
      const cards = containerRef.current?.querySelectorAll('.magic-bento-card');
      cards?.forEach(card => {
        (card as HTMLElement).style.setProperty('--glow-intensity', '0');
      });
    }

    if (enableTilt) {
      const cards = containerRef.current?.querySelectorAll('.magic-bento-card');
      cards?.forEach(card => {
        (card as HTMLElement).style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      });
    }
  }, [enableBorderGlow, enableTilt]);

  // Handle click effect
  const handleCardClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!clickEffect) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('div');
    ripple.style.position = 'absolute';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = '0';
    ripple.style.height = '0';
    ripple.style.borderRadius = '50%';
    ripple.style.background = `radial-gradient(circle, rgba(${glowColor}, 0.8), transparent)`;
    ripple.style.pointerEvents = 'none';
    ripple.style.transform = 'translate(-50%, -50%)';

    e.currentTarget.appendChild(ripple);

    const animation = ripple.animate(
      [
        { width: '0', height: '0', opacity: 1 },
        { width: '300px', height: '300px', opacity: 0 }
      ],
      { duration: 600, easing: 'ease-out' }
    );

    animation.onfinish = () => ripple.remove();
  }, [clickEffect, glowColor]);

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    canvas.width = rect.width;
    canvas.height = rect.height;

    initializeParticles();
    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [initializeParticles, animate]);

  // Add event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  const cardClasses = [
    'magic-bento-card',
    textAutoHide && 'magic-bento-card--text-autohide',
    enableBorderGlow && 'magic-bento-card--border-glow'
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={containerRef}
      className={`bento-section ${className}`}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {enableStars && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
      )}

      {enableSpotlight && (
        <div
          ref={spotlightRef}
          className="global-spotlight"
          style={{
            position: 'absolute',
            width: `${spotlightRadius}px`,
            height: `${spotlightRadius}px`,
            background: `radial-gradient(circle, rgba(${glowColor}, 0.15) 0%, transparent 70%)`,
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 200,
            filter: 'blur(40px)'
          }}
        />
      )}

      <div className="card-grid" style={{ position: 'relative', zIndex: 1 }}>
        {children ? (
          children
        ) : (
          <>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                className={cardClasses}
                onClick={handleCardClick}
                style={{ cursor: 'pointer' }}
              >
                <div className="magic-bento-card__header">
                  <span className="magic-bento-card__label">Card {i}</span>
                </div>
                <div className="magic-bento-card__content">
                  <h3 className="magic-bento-card__title">Title {i}</h3>
                  <p className="magic-bento-card__description">
                    This is a magic bento card with interactive effects
                  </p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default MagicBento;
