// components/home/categories/SpotlightSection.tsx
import CategoryLayout1 from './CategoryLayout1';
import { WPPostWithMedia, WPCategory } from '../../../types/wordpress';

interface SpotlightSectionProps {
  posts: WPPostWithMedia[];
  categories: WPCategory[];
  isLast?: boolean;
}

export default function SpotlightSection({ posts, categories, isLast = false }: SpotlightSectionProps) {
  return (
    <CategoryLayout1 
      name="Spotlight" 
      slug="spotlight" 
      posts={posts} 
      categories={categories} 
      isLast={isLast}
    />
  );
}