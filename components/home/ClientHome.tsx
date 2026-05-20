import { useState, useEffect } from 'react';
import { WPPost, WPCategory } from '../../types/wordpress';
import Link from 'next/link';
import { getPostUrl } from '../../lib/wordpress';

interface HomeData {
  posts: WPPost[];
  categories: WPCategory[];
  pinnedPosts: WPPost[];
  topStoriesPosts: WPPost[];
  newsPosts: WPPost[];
  beritaPosts: WPPost[];
  lifestylePosts: WPPost[];
  goingViralPosts: WPPost[];
  sportsPosts: WPPost[];
  malaysiaPosts: WPPost[];
  worldPosts: WPPost[];
  asiaPosts: WPPost[];
  businessPosts: WPPost[];
  prnPosts: WPPost[];
  palestinePosts: WPPost[];
  chinaPosts: WPPost[];
  spotlightPosts: WPPost[];
  videoPosts: WPPost[];
  opinionPosts: WPPost[];
}

export function ClientHome({ serverData }: { serverData: HomeData }) {
  const [data, setData] = useState<HomeData>(serverData);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/home-data');
        if (res.ok) {
          const fresh = await res.json();
          setData(fresh);
        }
      } catch {
      } finally {
        setLoaded(true);
      }
    }
    fetchData();
  }, []);

  const cats = data.categories;
  const pinnedPost = data.pinnedPosts?.[0] || null;
  const morePinned = (data.pinnedPosts || []).slice(1, 5);

  return (
    <div className="container mx-auto px-1 sm:px-2 lg:px-3 py-6 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 sm:mb-10 lg:mb-12">
        <div className="lg:col-span-9">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-200">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Top Story</h2>
          </div>
          {pinnedPost ? (
            <Link href={getPostUrl(pinnedPost)} className="block group">
              <article className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
                {pinnedPost.featured_media_url && (
                  <div className="w-full h-64 sm:h-80 relative">
                    <img src={pinnedPost.featured_media_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                <div className="p-4 sm:p-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2" dangerouslySetInnerHTML={{ __html: pinnedPost.title.rendered }} />
                  {pinnedPost.excerpt?.rendered && (
                    <p className="text-gray-600 mt-2 line-clamp-3" dangerouslySetInnerHTML={{ __html: pinnedPost.excerpt.rendered }} />
                  )}
                </div>
              </article>
            </Link>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 text-center">
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-700 mb-2 sm:mb-3 lg:mb-4">No featured story available</h3>
              <p className="text-gray-500 text-xs sm:text-sm lg:text-base">Check back later for the latest news</p>
            </div>
          )}
          {morePinned.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mt-6">
              {morePinned.map((post) => (
                <Link key={post.id} href={getPostUrl(post)} className="block group">
                  <article className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                    <div className="w-full h-56 relative bg-gray-100 flex-shrink-0">
                      {post.featured_media_url && (
                        <img src={post.featured_media_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                      <p className="text-xs text-gray-500 mt-1">{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="lg:col-span-3">
          <LatestNewsSidebar posts={data.posts} categories={cats} />
        </div>
      </div>

      <div className="border-t border-gray-300 my-6 sm:my-10 lg:my-16" />

      <div className="mb-16">
        <div className="mb-8 border-b border-gray-300 pb-4">
          <h2 className="text-3xl font-bold text-gray-900">Latest Updates</h2>
          <p className="text-gray-600 mt-2">Quick glance at what&apos;s happening around the world</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {[
            { name: 'Malaysia', slug: 'malaysia', posts: data.malaysiaPosts },
            { name: 'World', slug: 'world', posts: data.worldPosts },
            { name: 'Business', slug: 'business', posts: data.businessPosts },
          ].map((section) => (
            <div key={section.slug} className="space-y-6">
              <div className="pb-2 border-b-2 border-gray-800">
                <Link href={`/category/${section.slug}`}><h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">{section.name}</h3></Link>
              </div>
              <div className="space-y-6">
                {(section.posts || []).slice(0, 4).map((post) => (
                  <Link key={post.id} href={getPostUrl(post)} className="block group">
                    <article>
                      <div className="w-full h-40 relative bg-gray-100 rounded-lg overflow-hidden mb-3">
                        {post.featured_media_url && <img src={post.featured_media_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />}
                      </div>
                      <h4 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                      <p className="text-xs text-gray-500 mt-1">{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </article>
                  </Link>
                ))}
              </div>
              <div className="pt-4">
                <Link href={`/category/${section.slug}`} className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                  More {section.name} stories<svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-300 my-12" />
      </div>
    </div>
  );
}

function LatestNewsSidebar({ posts, categories }: { posts: WPPost[]; categories: WPCategory[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Latest</h2>
        </div>
        <Link href="/latest-news" className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-all duration-200">
          View all<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </Link>
      </div>
      <div className="space-y-4">
        {(posts || []).slice(0, 8).map((post, index) => {
          const catId = typeof post.categories?.[0] === 'number' ? post.categories[0] : (post.categories?.[0] as any)?.id;
          const catName = catId ? categories.find(c => c.id === catId)?.name || '' : '';
          return (
            <Link key={post.id} href={getPostUrl(post)} className="block group">
              <article className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
                <span className="text-2xl font-bold text-gray-300 leading-none shrink-0 w-8">{String(index + 1).padStart(2, '0')}</span>
                <div className="flex-1 min-w-0">
                  {catName && <span className="text-[10px] font-semibold text-red-600 uppercase tracking-wider">{catName}</span>}
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug mt-0.5" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                  <p className="text-xs text-gray-400 mt-1">{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
