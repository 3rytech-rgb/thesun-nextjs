// components/home/categories/CombinedSection.tsx
import { WPPostWithMedia, WPCategory } from '../../../types/wordpress';
import CategoryLayout5 from './CategoryLayout5';

interface CombinedSectionProps {
  malaysiaPosts: WPPostWithMedia[];
  worldPosts: WPPostWithMedia[];
  asiaPosts: WPPostWithMedia[];
  categories: WPCategory[];
  isLast?: boolean;
}

export default function CombinedSection({ 
  malaysiaPosts, 
  worldPosts, 
  asiaPosts, 
  categories, 
  isLast = false 
}: CombinedSectionProps) {
  // Cari category object untuk setiap section
  const malaysiaCategory = categories.find((cat: WPCategory) => 
    cat.slug.toLowerCase().includes('malaysia') || 
    cat.name.toLowerCase().includes('malaysia')
  );

  const worldCategory = categories.find((cat: WPCategory) => 
    cat.slug.toLowerCase().includes('world') || 
    cat.name.toLowerCase().includes('world')
  );

  const asiaCategory = categories.find((cat: WPCategory) => 
    cat.slug.toLowerCase().includes('asia') || 
    cat.name.toLowerCase().includes('asia')
  );

  const categoryColumns = [
    {
      name: malaysiaCategory?.name || 'Malaysia',
      slug: malaysiaCategory?.slug || 'malaysia',
      posts: malaysiaPosts,
      category: malaysiaCategory || categories[0]
    },
    {
      name: worldCategory?.name || 'World',
      slug: worldCategory?.slug || 'world',
      posts: worldPosts,
      category: worldCategory || categories[1]
    },
    {
      name: asiaCategory?.name || 'Asia',
      slug: asiaCategory?.slug || 'asia',
      posts: asiaPosts,
      category: asiaCategory || categories[2]
    }
  ];

  return (
    <CategoryLayout5 
      categoryColumns={categoryColumns}
      categories={categories}
      isLast={isLast}
    />
  );
}