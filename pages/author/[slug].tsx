// pages/author/[slug].tsx - REWRITTEN AND FIXED
import { GetStaticProps, GetStaticPaths } from 'next';
import { getPostsByAuthor, getCategories, getPosts, getShortenedCategorySlug, getPostUrl } from '../../lib/wordpress';
import { WPAuthor, WPPostWithMedia, WPCategory } from '../../types/wordpress';
import Layout from '../../components/layout/Layout';
import Breadcrumb from '../../components/common/Breadcrumb';
import NetworkImage from '../../components/common/NetworkImage';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Props {
  author: WPAuthor | null;
  posts: WPPostWithMedia[];
  categories: WPCategory[];
  latestPosts: WPPostWithMedia[];
  error?: string;
}

// Helper function to get author from post embedded data (only byline author)
function getAuthorFromPost(post: WPPostWithMedia): WPAuthor | null {
  // Always return the first author (byline author), not the second one (uploader)
  if (post.authors && post.authors.length > 0) {
    return post.authors[0];
  }

  if (post._embedded?.author?.[0]) {
    const rawAuthor = post._embedded.author[0];
    return {
      term_id: rawAuthor.id || rawAuthor.term_id || 0,
      user_id: rawAuthor.user_id || 0,
      is_guest: rawAuthor.is_guest || 0,
      slug: rawAuthor.slug || '',
      job_title: rawAuthor.job_title || '',
      display_name: rawAuthor.name || rawAuthor.display_name || 'Author',
      avatar_url: {
        url: rawAuthor.avatar_urls?.['96'] || rawAuthor.avatar_url?.url || '/default-avatar.png',
        url2x: rawAuthor.avatar_urls?.['2*96'] || rawAuthor.avatar_url?.url2x || ''
      },
      author_category: rawAuthor.author_category || '',
      first_name: rawAuthor.first_name || '',
      last_name: rawAuthor.last_name || '',
      description: rawAuthor.description || rawAuthor.bio || ''
    };
  }

  return null;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Date not available';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return 'Date not available';
  }
}

// Decode HTML entities and special characters from content with multiple passes
function cleanHtmlContent(html: string): string {
  if (!html || typeof html !== 'string') return '';

  let result = html;

  // Multiple passes to handle nested/double-encoded entities
  for (let pass = 0; pass < 3; pass++) {
    result = result
      // Step 1: Decode numeric HTML entities (decimal and hexadecimal)
      .replace(/&#(\d+);/g, (_, dec) => {
        const code = parseInt(dec, 10);
        return code >= 0 && code <= 0x10FFFF ? String.fromCharCode(code) : '';
      })
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
        const code = parseInt(hex, 16);
        return code >= 0 && code <= 0x10FFFF ? String.fromCharCode(code) : '';
      })

      // Step 2: Decode essential named entities (in correct order)
      .replace(/&amp;/g, '&')
      .replace(/&#038;/g, '&')  // Alternative ampersand
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')

      // Step 3: Decode all quote and apostrophe variants
      .replace(/&#39;/g, "'")    // Decimal apostrophe
      .replace(/&#x27;/g, "'")   // Hex apostrophe
      .replace(/&apos;/g, "'")   // Named apostrophe
      .replace(/&#8216;/g, "'")  // Left single quotation mark
      .replace(/&#8217;/g, "'")  // Right single quotation mark
      .replace(/&#8220;/g, '"')  // Left double quotation mark
      .replace(/&#8221;/g, '"')  // Right double quotation mark

      // Step 4: Decode whitespace and special characters
      .replace(/&nbsp;/g, ' ')
      .replace(/&#160;/g, ' ')   // Non-breaking space
      .replace(/&#8211;/g, '–')  // En dash
      .replace(/&#8212;/g, '—')  // Em dash
      .replace(/&#8230;/g, '…')  // Horizontal ellipsis

      // Step 5: Remove any remaining unhandled named entities
      .replace(/&[a-zA-Z][a-zA-Z0-9]*;?/g, '');
  }

  // Final cleanup
  return result.trim();
}

// Strip HTML tags and decode entities for plain text content
function cleanTextContent(text: string): string {
  if (!text || typeof text !== 'string') return '';

  // Remove HTML tags first, then decode entities
  return cleanHtmlContent(text.replace(/<[^>]*>/g, ''));
}

const AuthorProfilePage = ({ author, posts: initialPosts, categories, latestPosts, error }: Props) => {
  const [allPosts, setAllPosts] = useState(initialPosts);
  const [filteredPosts, setFilteredPosts] = useState<WPPostWithMedia[]>(initialPosts);
  const [visibleCount, setVisibleCount] = useState(9);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [totalArticleCount, setTotalArticleCount] = useState<number | null>(null);
  const [dateFilter, setDateFilter] = useState<string>('all'); // 'all', 'today', 'this-week', 'last-week', 'this-month', 'last-month', 'this-year', 'last-year'
  const [searchQuery, setSearchQuery] = useState('');
  
  const displayedPosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length || hasMorePosts;

  // Function to filter posts by date
  const filterPostsByDate = (posts: WPPostWithMedia[], filter: string): WPPostWithMedia[] => {
    if (filter === 'all') return posts;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return posts.filter(post => {
      const postDate = new Date(post.date);
      
      switch (filter) {
        case 'today':
          return postDate >= today;
          
        case 'this-week': {
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
          return postDate >= startOfWeek;
        }
          
        case 'last-week': {
          const startOfLastWeek = new Date(today);
          startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
          const endOfLastWeek = new Date(today);
          endOfLastWeek.setDate(today.getDate() - today.getDay() - 1);
          return postDate >= startOfLastWeek && postDate <= endOfLastWeek;
        }
          
        case 'this-month': {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          return postDate >= startOfMonth;
        }
          
        case 'last-month': {
          const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
          return postDate >= startOfLastMonth && postDate <= endOfLastMonth;
        }
          
        case 'this-year': {
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          return postDate >= startOfYear;
        }
          
        case 'last-year': {
          const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
          const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31);
          return postDate >= startOfLastYear && postDate <= endOfLastYear;
        }
          
        default:
          return true;
      }
    });
  };

  // Function to search posts by title
  const searchPosts = (posts: WPPostWithMedia[], query: string): WPPostWithMedia[] => {
    if (!query.trim()) return posts;
    
    const searchTerm = query.toLowerCase();
    return posts.filter(post => 
      cleanTextContent(post.title.rendered || '').toLowerCase().includes(searchTerm)
    );
  };

  // Update filtered posts when allPosts, dateFilter, or searchQuery changes
  useEffect(() => {
    let result = allPosts;
    
    // Apply date filter
    result = filterPostsByDate(result, dateFilter);
    
    // Apply search filter
    result = searchPosts(result, searchQuery);
    
    setFilteredPosts(result);
    setVisibleCount(9); // Reset visible count when filters change
  }, [allPosts, dateFilter, searchQuery]);

  // Function to fetch ALL posts for author (infinite loading)
  const fetchAllPosts = async () => {
    if (!author || loading) return;
    
    setLoading(true);
    try {
      let currentPage = 1;
      let allFetchedPosts: WPPostWithMedia[] = [];
      let hasMore = true;
      let totalCount = 0;
      
      // First fetch to get total count
      const firstRes = await fetch(
        `https://thesun.my/wp-json/wp/v2/posts?ppma_author=${author.term_id}&per_page=1&page=1&_embed=wp:featuredmedia,author,wp:term`
      );
      
      if (!firstRes.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      // Get total count from headers
      const totalHeader = firstRes.headers.get('X-WP-Total');
      totalCount = totalHeader ? parseInt(totalHeader) : 0;
      setTotalArticleCount(totalCount);
      
      // Now fetch all posts in batches
      while (hasMore) {
        const res = await fetch(
          `https://thesun.my/wp-json/wp/v2/posts?ppma_author=${author.term_id}&per_page=100&page=${currentPage}&_embed=wp:featuredmedia,author,wp:term`
        );
        
        if (!res.ok) {
          if (res.status === 400) {
            hasMore = false;
            break;
          }
          throw new Error('Failed to fetch posts');
        }
        
        const newPosts = await res.json();
        
        if (newPosts.length === 0) {
          hasMore = false;
        } else {
          // Process new posts
          const processedPosts = newPosts.map((post: any) => ({
            ...post,
            featured_media_url: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
            authors: post._embedded?.author || []
          }));
          
          allFetchedPosts = [...allFetchedPosts, ...processedPosts];
          currentPage++;
          
          // Update state incrementally for better UX
          setAllPosts(allFetchedPosts);
          
          // Small delay to prevent overwhelming the browser
          if (currentPage % 3 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }
      
      setHasMorePosts(false); // No more posts to fetch
      console.log(`✅ Loaded ${allFetchedPosts.length} posts for author ${author.display_name}`);
      
    } catch (err) {
      console.error('Error fetching all posts:', err);
      setHasMorePosts(false);
    } finally {
      setLoading(false);
    }
  };

  // Legacy function for backward compatibility
  const fetchMorePosts = async () => {
    await fetchAllPosts();
  };

  // Handle load more
  const handleLoadMore = async () => {
    // If we haven't loaded all posts yet, fetch them all
    if (hasMorePosts && dateFilter === 'all' && !searchQuery) {
      await fetchAllPosts();
    }
    // Always increase visible count
    setVisibleCount(c => c + 9);
  };

  // Auto-fetch all posts on initial load if author has many articles
  useEffect(() => {
    if (author && hasMorePosts && initialPosts.length > 0) {
      // Check if we should fetch all posts
      const shouldFetchAll = initialPosts.length < 50; // If initial load got less than 50, author might have more
      
      if (shouldFetchAll) {
        console.log(`🔄 Author ${author.display_name} has ${initialPosts.length} initial posts, fetching all...`);
        fetchAllPosts();
      } else {
        // Get total count from initial fetch
        // We need to make a separate request to get total count
        const getTotalCount = async () => {
          try {
            const res = await fetch(
              `https://thesun.my/wp-json/wp/v2/posts?ppma_author=${author.term_id}&per_page=1&page=1`
            );
            if (res.ok) {
              const totalHeader = res.headers.get('X-WP-Total');
              const total = totalHeader ? parseInt(totalHeader) : initialPosts.length;
              setTotalArticleCount(total);
              setHasMorePosts(total > initialPosts.length);
            }
          } catch (err) {
            console.error('Error getting total count:', err);
          }
        };
        
        getTotalCount();
      }
    }
    
    console.log('🔍 Author Profile Page Data:', {
      author: author ? {
        slug: author.slug,
        name: author.display_name,
        id: author.term_id
      } : 'No author',
      postCount: allPosts.length,
      totalCount: totalArticleCount,
      error: error
    });
  }, [author]);

  // If there's an error AND no author data, show error message
  if (error && !author) {
    return (
      <Layout 
        categories={categories}
        title="Error Loading Author | The Sun Malaysia"
        description="Error loading author profile"
      >
      <Breadcrumb categories={categories} />
        <main className="bg-gray-50 min-h-screen py-20">
          <div className="container mx-auto px-4 max-w-7xl text-center">
            <section className="bg-white rounded-2xl shadow-lg p-12">
              <h1 className="text-3xl font-bold text-red-600 mb-6">Error Loading Author Profile</h1>
              <p className="text-gray-600 mb-8">{error}</p>
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Return to Homepage
              </Link>
            </section>
          </div>
        </main>
      </Layout>
    );
  }

  // If no author data
  if (!author) {
    return (
      <Layout 
        categories={categories}
        title="Author Not Found | The Sun Malaysia"
        description="Author profile not found"
      >
      <Breadcrumb categories={categories} />
        <main className="bg-gray-50 min-h-screen py-20">
          <div className="container mx-auto px-4 max-w-7xl text-center">
            <section className="bg-white rounded-2xl shadow-lg p-12">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Author Not Found</h1>
              <p className="text-gray-600 mb-8">The author profile you're looking for does not exist.</p>
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Return to Homepage
              </Link>
            </section>
          </div>
        </main>
      </Layout>
    );
  }

  const displayName = cleanTextContent(author.display_name) || 'Author';
  const avatar = author.avatar_url?.url || '/default-avatar.png';
  const description = author.description ? cleanTextContent(author.description) : '';

    return (
      <Layout 
        categories={categories}
        title={`${author.display_name} | The Sun Malaysia`}
        description={description || `Articles by ${author.display_name} on The Sun Malaysia`}
      >
      <Breadcrumb categories={categories} />
      <main className="bg-gray-50 min-h-screen py-10">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Debug info - only in development */}
          {process.env.NODE_ENV === 'development' && (
            <aside className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg" aria-label="Debug information">
              <p className="text-sm text-yellow-800">
                <strong>Debug Info:</strong> Author Slug: {author.slug} | ID: {author.term_id} | Posts: {allPosts.length}
              </p>
            </aside>
          )}

          {/* Author Profile Header */}
          <header className="bg-white rounded-2xl shadow-lg overflow-hidden mb-10">
            <div className="p-8 md:p-12 text-center">
               <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-md opacity-30"></div>
                <NetworkImage
                  src={avatar}
                  alt={`Profile picture of ${displayName}`}
                  width={160}
                  height={160}
                  className="rounded-full border-4 border-white shadow-xl relative z-10"
                  fallbackSrc="/default-avatar.png"
                />
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-3">{displayName}</h1>

              {author.job_title && (
                <p className="text-xl text-gray-600 mb-6">{cleanTextContent(author.job_title)}</p>
              )}

              {description && (
                <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
                  {description}
                </p>
              )}

               <p className="text-gray-600 font-medium mb-6" aria-label="Article count">
                {totalArticleCount !== null ? totalArticleCount : allPosts.length} articles published • {filteredPosts.length} shown
              </p>

              {/* Search and Filter Section */}
              <div className="max-w-4xl mx-auto mb-8">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  {/* Search Input */}
                  <div className="flex-1 w-full md:w-auto">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search articles by title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Date Filter Dropdown */}
                  <div className="w-full md:w-auto">
                    <div className="relative">
                      <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="this-week">This Week</option>
                        <option value="last-week">Last Week</option>
                        <option value="this-month">This Month</option>
                        <option value="last-month">Last Month</option>
                        <option value="this-year">This Year</option>
                        <option value="last-year">Last Year</option>
                      </select>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Filter Buttons */}
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {['today', 'this-week', 'this-month', 'this-year'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setDateFilter(filter)}
                      className={`px-4 py-2 text-sm rounded-full transition-colors ${
                        dateFilter === filter 
                          ? 'bg-red-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {filter.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setDateFilter('all');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 text-sm bg-gray-800 text-white rounded-full hover:bg-gray-900 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </header>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Articles Section */}
            <section className="lg:w-3/4" aria-labelledby="articles-heading">
              <h2 id="articles-heading" className="text-3xl font-bold mb-8 pb-4 border-b-4 border-red-600 inline-block">
                Latest Articles
              </h2>

               {displayedPosts.length === 0 ? (
                <section className="bg-white p-12 text-center rounded-xl shadow">
                  <p className="text-xl text-gray-600 mb-4">
                    {allPosts.length === 0 
                      ? 'No articles published yet.' 
                      : `No articles found${searchQuery ? ` for "${searchQuery}"` : ''}${dateFilter !== 'all' ? ` in ${dateFilter.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}` : ''}.`
                    }
                  </p>
                  {(searchQuery || dateFilter !== 'all') && allPosts.length > 0 && (
                    <button
                      onClick={() => {
                        setDateFilter('all');
                        setSearchQuery('');
                      }}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </section>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
                    {displayedPosts.map(post => {
                      const postTitle = post.title?.rendered ? cleanTextContent(post.title.rendered) : 'No Title';
                      const postExcerpt = post.excerpt?.rendered ? cleanTextContent(post.excerpt.rendered) : '';
                      const featuredImage = post.featured_media_url || '';

                      return (
                        <article key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full" role="listitem">
                          {featuredImage && (
                            <figure className="aspect-[4/3] relative">
                              <NetworkImage
                                src={featuredImage}
                                alt={postTitle}
                                fill
                                className="object-cover"
                                fallbackSrc="/default-image.png"
                              />
                            </figure>
                          )}
                          <div className="p-5">
                            <header>
                              <Link href={getPostUrl(post)} className="group">
                                <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-red-600 transition-colors duration-200">
                                  {postTitle}
                                </h3>
                              </Link>
                              <time className="text-sm text-gray-500 block" dateTime={post.date}>
                                {formatDate(post.date)}
                              </time>
                            </header>
                            {postExcerpt && (
                              <p className="text-gray-600 text-sm line-clamp-3 mt-3">
                                {postExcerpt}
                              </p>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {hasMore && (
                    <nav className="mt-12 text-center" aria-label="Pagination">
                       <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="px-10 py-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Load more articles"
                      >
                        {loading ? 'Loading All Articles...' : hasMorePosts ? 'Load All Articles' : 'Show More Articles'}
                      </button>
                    </nav>
                  )}
                </>
              )}
            </section>

            {/* Sidebar */}
            <aside className="lg:w-1/4 space-y-6">
              {/* Latest Stories Section */}
              <section className="bg-white rounded-xl shadow-md p-6" aria-labelledby="latest-stories-heading">
                <h3 id="latest-stories-heading" className="text-xl font-bold mb-4 pb-2 border-b-2 border-red-600">
                  Latest Stories
                </h3>
                <nav aria-label="Latest stories">
                  <ul className="space-y-4">
                    {latestPosts.slice(0, 5).map(post => {
                      const postTitle = post.title?.rendered ? cleanTextContent(post.title.rendered) : 'No Title';

                      return (
                        <li key={post.id} className="border-b pb-4 last:border-0">
                          <article>
                            <Link href={getPostUrl(post)} className="group block">
                              <h4 className="font-medium line-clamp-2 mb-1 group-hover:text-red-600 transition-colors duration-200">
                                {postTitle}
                              </h4>
                            </Link>
                            <time className="text-xs text-gray-500 block" dateTime={post.date}>
                              {formatDate(post.date)}
                            </time>
                          </article>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </section>

              {/* Categories Section */}
              <section className="bg-white rounded-xl shadow-md p-6" aria-labelledby="categories-heading">
                <h3 id="categories-heading" className="text-xl font-bold mb-4 pb-2 border-b-2 border-red-600">
                  Categories
                </h3>
                <nav aria-label="Article categories">
                  <ul className="space-y-2">
                    {categories.slice(0, 8).map(category => (
                      <li key={category.id}>
                        <Link
                          href={`/category/${category.slug}`}
                          className="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          aria-label={`${category.name} category with ${category.count || 0} articles`}
                        >
                          <span className="text-gray-700 hover:text-red-600 transition-colors duration-200">
                             {cleanHtmlContent(category.name)}
                          </span>
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded" aria-label={`${category.count || 0} articles`}>
                            {category.count || 0}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default AuthorProfilePage;

export const getStaticPaths: GetStaticPaths = async () => {
  console.log('🔄 Generating static paths for authors...');

  try {
    // Pre-generate some common author pages that we know exist
    // In a production app, you might fetch popular authors from analytics
    const commonAuthors = ['the-sun-webdesk', 'bernama'];

    return {
      paths: commonAuthors.map(slug => ({
        params: { slug }
      })),
      fallback: 'blocking'
    };
  } catch (error) {
    console.error('Error generating author paths:', error);
    return {
      paths: [],
      fallback: 'blocking'
    };
  }
};

// Helper function to get author by slug
async function getAuthorBySlugDirect(slug: string): Promise<WPAuthor | null> {
  try {
    const WORDPRESS_API_URL = 'https://thesun.my/wp-json/wp/v2';
    console.log(`🔍 Trying to fetch author by slug: ${slug}`);

    // Method 1: Fetch posts and look for author in the authors array
    try {
      console.log('🔍 Fetching recent posts to find author data...');
      // Increase to 200 posts to find more authors
      const postsUrl = `${WORDPRESS_API_URL}/posts?per_page=200&_embed=author`;
      const res = await fetch(postsUrl, { next: { revalidate: 300 } });

      if (res.ok) {
        const posts: any[] = await res.json();
        console.log(`✅ Fetched ${posts.length} posts to search for author`);

        // Look through posts to find one with matching author slug in authors array
        // Check all authors in the array
        for (const post of posts) {
          if (post.authors && Array.isArray(post.authors)) {
            // Check all authors in the array
            for (const authorData of post.authors) {
              if (authorData.slug === slug) {
                console.log(`✅ Found author in post ${post.id}: ${authorData.display_name} (${authorData.slug})`);
                return {
                  term_id: authorData.term_id || authorData.id || 0,
                  user_id: authorData.user_id || 0,
                  is_guest: authorData.is_guest || 0,
                  slug: authorData.slug || slug,
                  job_title: authorData.job_title || '',
                  display_name: authorData.display_name || authorData.name || 'Author',
                  avatar_url: {
                    url: authorData.avatar_url?.url || authorData.avatar_urls?.['96'] || '/default-avatar.png',
                    url2x: authorData.avatar_url?.url2x || authorData.avatar_urls?.['2*96'] || ''
                  },
                  author_category: authorData.author_category || '',
                  first_name: authorData.first_name || '',
                  last_name: authorData.last_name || '',
                  description: authorData.description || authorData.bio || ''
                };
              }
            }
          }
        }
      }
    } catch (postsErr) {
      console.log('⚠️ Failed to fetch posts for author lookup');
    }

    // Method 2: Try searching posts by the slug (as a fallback)
    try {
      console.log('🔍 Trying search method as fallback...');
      // Try multiple search approaches
      const searchUrls = [
        `${WORDPRESS_API_URL}/posts?search=${slug}&per_page=100`,
        `${WORDPRESS_API_URL}/posts?author_name=${slug}&per_page=50`,
        `${WORDPRESS_API_URL}/posts?per_page=50&_embed=author` // Get more posts to search through
      ];

      for (const searchUrl of searchUrls) {
        try {
          const searchRes = await fetch(searchUrl, { next: { revalidate: 300 } });

          if (searchRes.ok) {
            const posts: any[] = await searchRes.json();
            console.log(`✅ Search returned ${posts.length} posts from ${searchUrl}`);

            // Look through search results for author data (check all authors)
            for (const post of posts) {
              if (post.authors && Array.isArray(post.authors)) {
                // Check all authors in the array
                for (const authorData of post.authors) {
                  if (authorData.slug === slug) {
                    console.log(`✅ Found author via search: ${authorData.display_name} (${authorData.slug})`);
                    return {
                      term_id: authorData.term_id || authorData.id || 0,
                      user_id: authorData.user_id || 0,
                      is_guest: authorData.is_guest || 0,
                      slug: authorData.slug || slug,
                      job_title: authorData.job_title || '',
                      display_name: authorData.display_name || authorData.name || 'Author',
                      avatar_url: {
                        url: authorData.avatar_url?.url || authorData.avatar_urls?.['96'] || '/default-avatar.png',
                        url2x: authorData.avatar_url?.url2x || authorData.avatar_urls?.['2*96'] || ''
                      },
                      author_category: authorData.author_category || '',
                      first_name: authorData.first_name || '',
                      last_name: authorData.last_name || '',
                      description: authorData.description || authorData.bio || ''
                    };
                  }
                }
              }
            }
          }
        } catch (urlError) {
          console.log(`⚠️ Search URL failed: ${searchUrl}`);
        }
      }
    } catch (searchErr) {
      console.log('⚠️ Search method failed');
    }

    // Method 3: If still not found, create a basic author profile
    // This allows author pages to exist even for authors not yet indexed
    console.log(`⚠️ Author "${slug}" not found in posts, creating basic profile`);
    return {
      term_id: 0,
      user_id: 0,
      is_guest: 1,
      slug: slug,
      job_title: '',
      display_name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
      avatar_url: {
        url: '/default-avatar.png',
        url2x: '/default-avatar.png'
      },
      author_category: '',
      first_name: '',
      last_name: '',
      description: `Articles by ${slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ')}`
    };
  } catch (err) {
    console.error('💥 Error in getAuthorBySlugDirect:', err);
    return null;
  }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug as string | undefined;

  console.log(`🔍 getStaticProps called for author slug: "${slug}"`);

  if (!slug) {
    console.log('❌ No slug provided');
    return { notFound: true };
  }

  try {
    console.log(`📥 Fetching author data for slug: "${slug}"`);
    const author = await getAuthorBySlugDirect(slug);

    if (!author) {
      console.log(`❌ Author not found for slug: "${slug}"`);
      // Return a page that shows "Author not found" instead of 404
      return {
        props: {
          author: null,
          posts: [],
          categories: [],
          latestPosts: [],
          error: `Author "${slug}" not found`
        }
      };
    }

    console.log(`✅ Author found/created: ${author.display_name} (ID: ${author.term_id})`);

    // Fetch posts using author ID
    console.log(`📥 Fetching posts for author ID: ${author.term_id}`);
    let posts: WPPostWithMedia[] = [];

    // Get posts with author ID
    try {
      if (author.term_id > 0) {
        posts = await getPostsByAuthor(author.term_id, 100);
        console.log(`✅ Found ${posts.length} posts via author ID`);
      } else {
        console.log(`⚠️ No valid author ID (${author.term_id}), this might be a generated profile`);
        posts = []; // No posts for generated profiles
      }
    } catch (error) {
      console.error('Error fetching posts for author:', error);
      posts = []; // Continue with empty posts array rather than failing
    }

    // Fetch categories and latest posts
    const categories = await getCategories();
    const latestPosts = await getPosts(6);

    console.log(`✅ Data fetched successfully for author: ${author.display_name}`);

    return {
      props: {
        author,
        posts,
        categories,
        latestPosts
      },
      revalidate: 300 // 5 minutes
    };
  } catch (err) {
    console.error('💥 Error in getStaticProps:', err);
    return {
      props: {
        author: null,
        posts: [],
        categories: [],
        latestPosts: [],
        error: err instanceof Error ? err.message : 'Unknown error'
      }
    };
  }
};