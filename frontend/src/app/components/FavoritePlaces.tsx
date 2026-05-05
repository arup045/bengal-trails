import React, { memo } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { buildSrcSet } from '../utils/responsiveImage';

import { OptimizedImage } from './OptimizedImage';
const PlaceCardMemo = memo(({ place }: { place: { name: string; slug: string; image: string } }) => (
  <a 
    href={`#/explore/${place.slug}`}
    className="group cursor-pointer block"
  >
    <div className="relative w-48 h-64 overflow-hidden rounded-[100px] shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
      <ImageWithFallback
        src={place.image}
        alt={place.name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        loading="lazy"
        decoding="async"
        srcSet={buildSrcSet(place.image)}
        sizes="192px"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <h3 className="text-white text-lg px-2">{place.name}</h3>
      </div>
    </div>
  </a>
));

PlaceCardMemo.displayName = 'PlaceCard';

export function FavoritePlaces() {
  const places = [
    {
      name: 'Darjeeling',
      slug: 'darjeeling',
      image: 'https://images.unsplash.com/photo-1679418536818-7a7fb2db49bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJqZWVsaW5nJTIwdGVhJTIwZ2FyZGVuc3xlbnwxfHx8fDE3NjM0NDc5MDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Victoria Memorial',
      slug: 'victoria-memorial-kolkata',
      image: 'https://images.unsplash.com/photo-1697817665440-f988c6d5080f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWN0b3JpYSUyMG1lbW9yaWFsJTIwa29sa2F0YXxlbnwxfHx8fDE3NjM0NzU2MTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Sundarbans',
      slug: 'sundarbans-national-park',
      image: 'https://images.unsplash.com/photo-1705521680496-d5d7b22c14f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5kYXJiYW5zJTIwbWFuZ3JvdmUlMjBmb3Jlc3R8ZW58MXx8fHwxNzYzNTMwNjU1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Kalimpong',
      slug: 'kalimpong',
      image: 'https://images.unsplash.com/photo-1637825987997-6e6d117b81b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrYWxpbXBvbmclMjBtb25hc3Rlcnl8ZW58MXx8fHwxNzYzNTMwNjU1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Digha',
      slug: 'digha',
      image: 'https://images.unsplash.com/photo-1695332599891-7c85956b9f46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdoYSUyMGJlYWNoJTIwc3Vuc2V0fGVufDF8fHx8MTc2MzUzMDY1NXww&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-orange-600 uppercase tracking-wide mb-2">Iconic Destinations</p>
          <h2 className="text-4xl md:text-5xl">Most Popular Places in West Bengal</h2>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {places.map((place) => (
            <PlaceCardMemo key={place.slug} place={place} />
          ))}
        </div>
      </div>
    </section>
  );
}