import Image from 'next/image';

export function AvatarGroup() {
  // Array of avatar images with names and image paths
  const avatars = [
    {
      id: 1,
      name: 'Baruch',
      image: '/images/avatars/baruch.png',
      fallbackGradient: 'from-blue-400 to-purple-500'
    },
    {
      id: 2,
      name: 'Jose',
      image: '/images/avatars/jose.png',
      fallbackGradient: 'from-green-400 to-blue-500'
    },
    {
      id: 3,
      name: 'Maya',
      image: '/images/avatars/maya.png',
      fallbackGradient: 'from-yellow-400 to-orange-500'
    },
    {
      id: 4,
      name: 'Sean',
      image: '/images/avatars/sean.png',
      fallbackGradient: 'from-pink-400 to-red-500'
    },
    {
      id: 5,
      name: 'Omar',
      image: '/images/avatars/omar.png',
      fallbackGradient: 'from-indigo-400 to-cyan-500'
    }
  ];

  return (
    <div className='flex -space-x-1.5 sm:-space-x-2'>
      {avatars.map((avatar) => (
        <div
          key={avatar.id}
          className='relative size-6 overflow-hidden rounded-full border-2 border-white sm:size-8'>
          <Image
            src={avatar.image}
            alt={avatar.name}
            fill
            className='object-cover'
            sizes='(max-width: 640px) 24px, 32px'
          />
          {/* Fallback gradient background if image fails to load */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${avatar.fallbackGradient} opacity-0 transition-opacity group-[[data-error]]:opacity-100`}
          />
        </div>
      ))}
    </div>
  );
}
