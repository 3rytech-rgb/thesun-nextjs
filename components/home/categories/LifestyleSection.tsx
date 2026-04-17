// components/home/categories/LifestyleSection.tsx
import CategoryLayout3 from './CategoryLayout3';
import { WPPostWithMedia, WPCategory } from '../../../types/wordpress';

interface LifestyleSectionProps {
  posts: WPPostWithMedia[];
  categories: WPCategory[];
  isLast?: boolean;
}

export default function LifestyleSection({ posts, categories, isLast = false }: LifestyleSectionProps) {
  return (
    <CategoryLayout3 
      name="Lifestyle" 
      slug="lifestyle" 
      posts={posts} 
      categories={categories} 
      isLast={isLast}
    />
  );
}