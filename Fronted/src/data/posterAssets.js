import poster1 from '../../Assets/Posters/Poster1.webp';
import poster2 from '../../Assets/Posters/Poster2.webp';
import poster3 from '../../Assets/Posters/Poster3.webp';
import poster4 from '../../Assets/Posters/Poster4.webp';
import poster5 from '../../Assets/Posters/Poster5.webp';
import poster6 from '../../Assets/Posters/Poster6.webp';
import poster7 from '../../Assets/Posters/Poster7.webp';
import poster8 from '../../Assets/Posters/Poster8.webp';
import poster9 from '../../Assets/Posters/Poster9.webp';

export const posterImages = [
  poster1,
  poster2,
  poster3,
  poster4,
  poster5,
  poster6,
  poster7,
  poster8,
  poster9,
];

export const getRandomPoster = (used = []) => {
  const available = posterImages.filter((poster) => !used.includes(poster));
  const pool = available.length ? available : posterImages;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
};

export const getRandomPosterSet = (count = 2, used = []) => {
  const safeCount = Math.min(Math.max(1, count), posterImages.length);
  const available = posterImages.filter((poster) => !used.includes(poster));
  const pool = available.length >= safeCount ? available : posterImages;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, safeCount);

  return selected;
};
