// components/news/PostCard.tsx
import { WPPost, WPCategory } from '../../types/wordpress';
import { getPostUrl } from '../../lib/wordpress';
import Image from 'next/image';

interface PostCardProps {
  post: WPPost;
}

export default function PostCard({ post }: PostCardProps) {
  const featuredImage = post.featured_media_url;
  const postDate = new Date(post.date).toLocaleDateString('ms-MY');
  const excerpt = post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 120) + '...';
  
  // Get category name jika available
  const getCategoryName = () => {
    if (post.categories.length === 0) return 'Uncategorized';
    
    const firstCategory = post.categories[0];
    if (typeof firstCategory === 'object' && 'name' in firstCategory) {
      return (firstCategory as WPCategory).name;
    }
    
    return `Category ${firstCategory}`;
  };

  return (
    <article className="post-card">
      {/* Featured Image dengan Next.js Image */}
      <div className="post-image">
        {featuredImage ? (
          <Image 
            src={featuredImage} 
            alt={post.featured_media_alt || post.title.rendered}
            width={400}
            height={200}
            style={{
              width: '100%',
              height: '12rem',
              objectFit: 'cover'
            }}
            loading="lazy"
          />
        ) : (
          <div style={{
            width: '100%',
            height: '12rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
            color: '#94a3b8'
          }}>
            No Image
          </div>
        )}
      </div>
      
      <div className="post-content">
        <div className="post-meta">
          <span className="category-tag">
            {getCategoryName()}
          </span>
          <span className="post-date">{postDate}</span>
        </div>
        
        <h3 
          className="post-title" 
          dangerouslySetInnerHTML={{ __html: post.title.rendered }} 
        />
        
        <div className="post-excerpt">
          {excerpt}
        </div>
        
        <a 
          href={getPostUrl(post)}
          className="post-link"
        >
          Read More →
        </a>
      </div>
    </article>
  );
}