// components/news/FeaturedPost.tsx
import { WPPost } from '../../types/wordpress';
import { getPostUrl } from '../../lib/wordpress';
import Image from 'next/image';

interface FeaturedPostProps {
  post: WPPost;
}

export default function FeaturedPost({ post }: FeaturedPostProps) {
  const featuredImage = post.featured_media_url;
  const postDate = new Date(post.date).toLocaleDateString('ms-MY');
  const excerpt = post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 200) + '...';

  return (
    <div className="featured-post">
      {featuredImage && (
        <div style={{ width: '100%', height: '300px', position: 'relative' }}>
          <Image 
            src={featuredImage} 
            alt={post.featured_media_alt || post.title.rendered}
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
      )}
      <div className="featured-content">
        <div className="flex items-center gap-4 mb-4">
          <span className="breaking-badge">Featured</span>
          <span className="text-sm text-gray-600">{postDate}</span>
        </div>
        <h1 className="featured-title" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
        <div className="featured-excerpt">
          {excerpt}
        </div>
        <a 
          href={getPostUrl(post)}
          className="read-more-btn"
        >
          Read Full Story
        </a>
      </div>
    </div>
  );
}