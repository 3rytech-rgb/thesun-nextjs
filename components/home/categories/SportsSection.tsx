// components/home/categories/SportsSection.tsx
import CategoryLayout2 from './CategoryLayout2';
import { WPPostWithMedia, WPCategory } from '../../../types/wordpress';

interface SportsSectionProps {
  posts: WPPostWithMedia[];
  categories: WPCategory[];
  isLast?: boolean;
}

export default function SportsSection({ posts, categories, isLast = false }: SportsSectionProps) {
  return (
    <CategoryLayout2 
      name="Sports" 
      slug="sports" 
      posts={posts} 
      categories={categories} 
      isLast={isLast}
    />
  );
}