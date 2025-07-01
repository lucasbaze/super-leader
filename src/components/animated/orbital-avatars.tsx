'use client';

import Image from 'next/image';
import { useMemo } from 'react';

interface OrbitalAvatarsProps {
  count?: number;
  className?: string;
}

const AVATAR_IMAGES = [
  '/images/avatars/kate.png',
  '/images/avatars/maya.png',
  '/images/avatars/baruch.png',
  '/images/avatars/sean.png',
  '/images/avatars/omar.png',
  '/images/avatars/jose.png',
  '/images/avatars/brandon.png',
  '/images/avatars/business-1.png',
  '/images/avatars/designer-1.png',
  '/images/avatars/gianna.png',
  '/images/avatars/girl-1.png',
  '/images/avatars/girl-3.png',
  '/images/avatars/guy-1.png',
  '/images/avatars/guy-2.png',
  '/images/avatars/joey.png',
  '/images/avatars/kosha.png',
  '/images/avatars/lex.png',
  '/images/avatars/lila.png',
  '/images/avatars/richard.png',
  '/images/avatars/savva.png',
  '/images/avatars/tony.png'
];

interface AvatarOrbit {
  id: number;
  src: string;
  size: number;
  orbitRadius: number;
  duration: number;
  delay: number;
  direction: 'clockwise' | 'counterclockwise';
}

export function OrbitalAvatars({ count = 21, className = '' }: OrbitalAvatarsProps) {
  const avatarOrbits = useMemo(() => {
    const orbits: AvatarOrbit[] = [];

    // Define 3 concentric rings
    const rings = [
      { radius: 250, count: 6 }, // Inner ring - 6 avatars
      { radius: 480, count: 6 }, // Middle ring - 6 avatars (expanded for login form clearance)
      { radius: 650, count: 9 } // Outer ring - 9 avatars (expanded and more avatars)
    ];

    let avatarIndex = 0;

    rings.forEach((ring, ringIndex) => {
      // Calculate even spacing for this ring
      const angleStep = 360 / ring.count;
      // Add a random offset for the entire ring to make it look more natural
      const ringOffset = Math.random() * 360;

      for (let i = 0; i < ring.count; i++) {
        const currentAvatarIndex = avatarIndex % AVATAR_IMAGES.length;
        const duration = 40 + Math.random() * 20; // 40-60 seconds per orbit
        const startAngle = i * angleStep + ringOffset;

        // Convert start angle to animation delay (negative delay = start mid-animation)
        const delayFromAngle = -(startAngle / 360) * duration;

        orbits.push({
          id: avatarIndex,
          src: AVATAR_IMAGES[currentAvatarIndex],
          size: Math.random() * 20 + 40, // 40-60px
          orbitRadius: ring.radius,
          duration: duration,
          delay: delayFromAngle, // Negative delay to start at the right position
          direction: Math.random() > 0.5 ? 'clockwise' : 'counterclockwise'
        });

        avatarIndex++;
      }
    });

    return orbits;
  }, [count]);

  return (
    <>
      <style>{`
        @keyframes orbital-clockwise {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes orbital-counterclockwise {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        
        @keyframes counter-clockwise {
          from { transform: translateX(-50%) rotate(0deg); }
          to { transform: translateX(-50%) rotate(-360deg); }
        }
        
        @keyframes counter-counterclockwise {
          from { transform: translateX(-50%) rotate(0deg); }
          to { transform: translateX(-50%) rotate(360deg); }
        }
        
        .orbital-clockwise {
          animation: orbital-clockwise linear infinite;
        }
        
        .orbital-counterclockwise {
          animation: orbital-counterclockwise linear infinite;
        }
        
        .counter-clockwise {
          animation: counter-clockwise linear infinite;
        }
        
        .counter-counterclockwise {
          animation: counter-counterclockwise linear infinite;
        }
      `}</style>

      <div className={`pointer-events-none fixed inset-0 overflow-hidden ${className}`}>
        <div className='absolute inset-0 flex items-center justify-center'>
          {avatarOrbits.map((orbit) => (
            <div
              key={orbit.id}
              className={`absolute ${orbit.direction === 'clockwise' ? 'orbital-clockwise' : 'orbital-counterclockwise'}`}
              style={{
                width: `${orbit.orbitRadius * 2}px`,
                height: `${orbit.orbitRadius * 2}px`,
                animationDuration: `${orbit.duration}s`,
                animationDelay: `${orbit.delay}s` // Start at staggered position
              }}>
              <div
                className={`absolute overflow-hidden rounded-full border border-white/30 bg-white/20 shadow-lg backdrop-blur-sm transition-transform duration-300 hover:scale-110 ${orbit.direction === 'clockwise' ? 'counter-clockwise' : 'counter-counterclockwise'}`}
                style={{
                  width: `${orbit.size}px`,
                  height: `${orbit.size}px`,
                  top: 0,
                  left: '50%',
                  animationDuration: `${orbit.duration}s`, // Same duration to keep in sync
                  animationDelay: `${orbit.delay}s` // Same delay to stay in sync
                }}>
                <Image
                  src={orbit.src}
                  alt='Avatar'
                  width={orbit.size}
                  height={orbit.size}
                  className='size-full object-cover'
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
