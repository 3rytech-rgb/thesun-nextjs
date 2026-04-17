// components/home/categories/VideoSection.tsx
import dynamic from 'next/dynamic';

const CategoryLayout6 = dynamic(() => import('./CategoryLayout6'), { ssr: false });
import { WPPost, WPCategory } from '../../../types/wordpress';

interface VideoSectionProps {
  categories: WPCategory[];
  isLast?: boolean;
}

export default function VideoSection({ categories, isLast = false }: VideoSectionProps) {
  return (
    <CategoryLayout6
      name="Video"
      slug="video"
      categories={categories}
      isLast={isLast}
    />
  );
}