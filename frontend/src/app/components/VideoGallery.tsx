import React, { useState } from 'react';
import { Play, X, Youtube } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VideoItem {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  thumbnail: string;
  duration: string;
  views: string;
  category: string;
}

interface VideoGalleryProps {
  destinationSlug?: string;
}

export const VideoGallery: React.FC<VideoGalleryProps> = ({ destinationSlug }) => {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  const videos: VideoItem[] = [
    {
      id: '1',
      title: 'Darjeeling Tea Gardens - Complete Travel Guide',
      description: 'Explore the magnificent tea estates of Darjeeling',
      youtubeId: 'dQw4w9WgXcQ', // Replace with actual video IDs
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      duration: '12:34',
      views: '45K',
      category: 'Destinations',
    },
    {
      id: '2',
      title: 'Sundarbans Tiger Safari Experience',
      description: 'An incredible journey through the mangrove forests',
      youtubeId: 'dQw4w9WgXcQ',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      duration: '15:20',
      views: '89K',
      category: 'Wildlife',
    },
    {
      id: '3',
      title: 'Kolkata Street Food Tour',
      description: 'Best Bengali street food in Kolkata',
      youtubeId: 'dQw4w9WgXcQ',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      duration: '10:15',
      views: '125K',
      category: 'Food',
    },
  ];

  return (
    <div className="py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Youtube className="w-8 h-8 text-red-600" />
          <h2 className="text-3xl font-bold text-gray-900">Video Guides</h2>
        </div>
        <p className="text-gray-600">Watch destination guides and travel tips</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {videos.map((video) => (
          <motion.div
            key={video.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer group"
            onClick={() => setSelectedVideo(video)}
          >
            <div className="relative">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
              <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-semibold">
                {video.duration}
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                  {video.category}
                </span>
                <span className="text-sm text-gray-500">{video.views} views</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                {video.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2">{video.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
              <div className="relative pb-[56.25%] bg-black rounded-2xl overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full"
                ></iframe>
              </div>
              <div className="mt-6 text-white">
                <h3 className="text-2xl font-bold mb-2">{selectedVideo.title}</h3>
                <p className="text-gray-300">{selectedVideo.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
