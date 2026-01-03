// components/home/categories/BeritaSection.tsx
import CategoryLayout4 from './CategoryLayout4';
import { WPPostWithMedia, WPCategory } from '../../../types/wordpress';

interface BeritaSectionProps {
  posts: WPPostWithMedia[];
  categories: WPCategory[];
  isLast?: boolean;
}

export default function BeritaSection({ posts, categories, isLast = false }: BeritaSectionProps) {
  return (
    <CategoryLayout4
      name="Berita" 
      slug="berita" 
      posts={posts} 
      categories={categories} 
      isLast={isLast}
    />
  );
}