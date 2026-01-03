import { GetStaticProps } from 'next';
import { 
  getPosts, 
  getCategories, 
  getPostsByCategoryWithChildren,
  getLatestExclusivePost,
  getTags,
  getTopStories
} from '../lib/wordpress';
import { WPPost } from '../types/wordpress';
import { WPCategory } from '../types/wordpress';
import Layout from '../components/layout/Layout';
import FeaturedStory from '../components/home/FeaturedStory';
import LatestNews from '../components/home/LatestNews';
import TopStories from '../components/home/TopStories';
import SpecialSection from '../components/home/SpecialSection';
import BeritaSection from '../components/home/categories/BeritaSection';
import SportsSection from '../components/home/categories/SportsSection';
import LifestyleSection from '../components/home/categories/LifestyleSection';
import GoingViralSection from '../components/home/categories/GoingViralSection';
import SpotlightSection from '../components/home/categories/SpotlightSection';
import CombinedSection from '../components/home/categories/CombinedSection';

interface HomeProps {
  posts: WPPost[];
  categories: WPCategory[];
  exclusivePost: WPPost | null;
  topStoriesPosts: WPPost[];
  newsPosts: WPPost[];
  beritaPosts: WPPost[];
  lifestylePosts: WPPost[];
  goingViralPosts: WPPost[];
  sportsPosts: WPPost[];
  malaysiaPosts: WPPost[];
  worldPosts: WPPost[];
  asiaPosts: WPPost[];
  prnPosts: WPPost[];
  palestinePosts: WPPost[];
  chinaPosts: WPPost[];
  spotlightPosts: WPPost[];
}

export default function Home({ 
  posts, 
  categories, 
  exclusivePost, 
  topStoriesPosts,
  newsPosts, 
  beritaPosts, 
  lifestylePosts, 
  goingViralPosts, 
  sportsPosts,
  malaysiaPosts,
  worldPosts,
  asiaPosts,
  prnPosts,
  palestinePosts,
  chinaPosts,
  spotlightPosts
}: HomeProps) {
  const featuredPost = exclusivePost || posts[0];
  const isExclusive = !!exclusivePost;

  let latestPosts = [];
  if (isExclusive) {
    latestPosts = posts.slice(0, 5);
  } else {
    latestPosts = posts.slice(1, 6);
  }

  const topStories = topStoriesPosts.slice(0, 10);

  const specialSections = [
    {
      name: 'PRN',
      slug: 'prn',
      tagline: 'Latest updates on State Elections',
      backgroundColor: '#1e3a8a',
      accentColor: '#1e3a8a',
      textColor: '#ffffff',
      backgroundImage: '/images/thesun.png'
    },
    {
      name: 'Palestine',
      slug: 'palestine',
      tagline: 'Standing in solidarity with Palestine',
      backgroundColor: '#14532d',
      accentColor: '#22c55e',
      textColor: '#ffffff',
    },
    {
      name: 'China',
      slug: 'china',
      tagline: 'China-Malaysia relations and updates',
      backgroundColor: '#7f1d1d',
      accentColor: '#ef4444',
      textColor: '#ffffff',
    }
  ];

  const specialSectionPosts = {
    prn: prnPosts,
    palestine: palestinePosts,
    china: chinaPosts
  };

  return (
    <Layout categories={categories}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Main News Grid - Responsive untuk semua device */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 lg:mb-12">
          {/* Mobile (<640px): 1 kolum, Tablet (640px-1023px): 2 kolum, Desktop (≥1024px): 2 kolum */}
          <div className="sm:col-span-2">
            {featuredPost ? (
              <FeaturedStory 
                exclusivePost={featuredPost} 
                categories={categories} 
                isNewExclusive={isExclusive}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 text-center">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-700 mb-2 sm:mb-3 lg:mb-4">
                  No featured story available
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm lg:text-base">
                  Check back later for the latest news
                </p>
              </div>
            )}
          </div>
          
          {/* Mobile: di bawah Featured Story, Tablet: kolum kedua, Desktop: kolum ketiga */}
          <div className="sm:col-span-1 mt-4 sm:mt-0">
            <LatestNews posts={latestPosts} categories={categories} />
          </div>
          
          {/* Mobile: di bawah Latest News, Tablet: baris kedua kolum pertama, Desktop: kolum keempat */}
          <div className="sm:col-span-1 sm:col-start-1 lg:col-start-auto mt-4 sm:mt-6 lg:mt-0">
            <TopStories posts={topStories} categories={categories} />
          </div>
        </div>

        {/* LINE BREAK SEBELUM CATEGORY SECTIONS */}
        <div className="border-t border-gray-300 my-6 sm:my-10 lg:my-16"></div>

        <GoingViralSection 
          posts={goingViralPosts} 
          categories={categories} 
        />
        
        {/* Combined Section */}
        <CombinedSection 
          malaysiaPosts={malaysiaPosts}
          worldPosts={worldPosts}
          asiaPosts={asiaPosts}
          categories={categories}
        />

        <BeritaSection 
          posts={beritaPosts} 
          categories={categories} 
        />
        
        <LifestyleSection 
          posts={lifestylePosts} 
          categories={categories} 
        />
        
        <SportsSection 
          posts={sportsPosts} 
          categories={categories} 
          isLast={true} 
        />
        
        <SpotlightSection
          posts={spotlightPosts} 
          categories={categories} 
        />

        {/* LINE BREAK SEBELUM SPECIAL SECTIONS */}
        <div className="border-t-2 border-dashed border-gray-400 my-8 sm:my-12 lg:my-20"></div>

        {/* SPECIAL SECTIONS HEADER */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4">
            Special Coverage
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm lg:text-lg max-w-2xl mx-auto px-2 sm:px-0">
            In-depth analysis and comprehensive coverage on important topics
          </p>
          <div className="w-24 sm:w-32 lg:w-48 h-1 bg-gradient-to-r from-red-600 via-blue-600 to-green-600 mx-auto mt-3 sm:mt-4 lg:mt-6 rounded-full"></div>
        </div>

        {/* Special Sections */}
        {specialSections.map((section) => {
          const posts = specialSectionPosts[section.slug as keyof typeof specialSectionPosts];
          if (posts.length === 0) return null;

          return (
            <SpecialSection
              key={section.slug}
              section={section}
              posts={posts.slice(1)}
              categories={categories}
              featuredPost={posts[0]}
            />
          );
        })}
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const [
      posts, 
      categories, 
      exclusivePost,
      topStoriesPosts,
      tags
    ] = await Promise.all([
      getPosts(30),
      getCategories(),
      getLatestExclusivePost(),
      getTopStories(),
      getTags()
    ]);

    // Debug log untuk top stories
    console.log('Top stories fetched:', {
      count: topStoriesPosts.length,
      posts: topStoriesPosts.slice(0, 3).map(p => ({
        id: p.id,
        title: p.title.rendered,
        date: p.date
      }))
    });

    // Debug log untuk tags
    console.log('Tags available:', tags.map(tag => ({ 
      name: tag.name, 
      slug: tag.slug, 
      id: tag.id 
    })).slice(0, 10));

    // Debug log untuk exclusive post
    console.log('Exclusive post fetched:', exclusivePost ? {
      id: exclusivePost.id,
      title: exclusivePost.title.rendered,
      tags: exclusivePost.tags,
      date: exclusivePost.date
    } : 'No exclusive post found');

    // Debug log untuk regular posts
    console.log('Regular posts fetched:', posts.length);
    if (posts.length > 0) {
      console.log('First regular post:', {
        id: posts[0].id,
        title: posts[0].title.rendered,
        date: posts[0].date
      });
    }

    // Helper function untuk cari category ID dari name
    const getCategoryIdByName = (categoryName: string): number => {
      const category = categories.find(cat => 
        cat.name.toLowerCase().includes(categoryName.toLowerCase()) && cat.parent === 0
      );
      return category?.id || 0;
    };

    // Helper function untuk cari category ID dari slug atau tag
    const getCategoryIdBySlugOrTag = (searchTerm: string): number => {
      const category = categories.find(cat => 
        cat.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return category?.id || 0;
    };

    // Dapatkan category IDs
    const categoryIds = {
      news: getCategoryIdByName('news'),
      berita: getCategoryIdByName('berita'),
      lifestyle: getCategoryIdByName('lifestyle'),
      goingViral: getCategoryIdByName('going viral'),
      sports: getCategoryIdByName('sports'),
      malaysia: getCategoryIdBySlugOrTag('malaysia'),
      world: getCategoryIdBySlugOrTag('world'),
      asia: getCategoryIdBySlugOrTag('asia'),
      prn: getCategoryIdBySlugOrTag('prn') || getCategoryIdBySlugOrTag('pilihan raya'),
      palestine: getCategoryIdBySlugOrTag('palestine') || getCategoryIdBySlugOrTag('gaza'),
      china: getCategoryIdBySlugOrTag('china') || getCategoryIdBySlugOrTag('beijing'),
      spotlight: getCategoryIdByName('spotlight') || getCategoryIdBySlugOrTag('spotlight')
    };

    // Fetch posts untuk semua sections
    const allPosts = await Promise.all([
      categoryIds.news ? getPostsByCategoryWithChildren(categoryIds.news) : Promise.resolve([]),
      categoryIds.berita ? getPostsByCategoryWithChildren(categoryIds.berita) : Promise.resolve([]),
      categoryIds.lifestyle ? getPostsByCategoryWithChildren(categoryIds.lifestyle) : Promise.resolve([]),
      categoryIds.goingViral ? getPostsByCategoryWithChildren(categoryIds.goingViral) : Promise.resolve([]),
      categoryIds.sports ? getPostsByCategoryWithChildren(categoryIds.sports) : Promise.resolve([]),
      categoryIds.malaysia ? getPostsByCategoryWithChildren(categoryIds.malaysia) : Promise.resolve([]),
      categoryIds.world ? getPostsByCategoryWithChildren(categoryIds.world) : Promise.resolve([]),
      categoryIds.asia ? getPostsByCategoryWithChildren(categoryIds.asia) : Promise.resolve([]),
      categoryIds.prn ? getPostsByCategoryWithChildren(categoryIds.prn) : Promise.resolve([]),
      categoryIds.palestine ? getPostsByCategoryWithChildren(categoryIds.palestine) : Promise.resolve([]),
      categoryIds.china ? getPostsByCategoryWithChildren(categoryIds.china) : Promise.resolve([]),
      categoryIds.spotlight ? getPostsByCategoryWithChildren(categoryIds.spotlight) : Promise.resolve([])
    ]);

    console.log('Posts loaded for all sections:', {
      news: allPosts[0].length,
      berita: allPosts[1].length,
      lifestyle: allPosts[2].length,
      goingViral: allPosts[3].length,
      sports: allPosts[4].length,
      malaysia: allPosts[5].length,
      world: allPosts[6].length,
      asia: allPosts[7].length,
      prn: allPosts[8].length,
      palestine: allPosts[9].length,
      china: allPosts[10].length,
      spotlight: allPosts[11].length
    });
    
    return {
      props: { 
        posts: posts || [],
        categories: categories || [],
        exclusivePost: exclusivePost || null,
        topStoriesPosts: topStoriesPosts || [],
        newsPosts: allPosts[0] || [],
        beritaPosts: allPosts[1] || [],
        lifestylePosts: allPosts[2] || [],
        goingViralPosts: allPosts[3] || [],
        sportsPosts: allPosts[4] || [],
        malaysiaPosts: allPosts[5] || [],
        worldPosts: allPosts[6] || [],
        asiaPosts: allPosts[7] || [],
        prnPosts: allPosts[8] || [],
        palestinePosts: allPosts[9] || [],
        chinaPosts: allPosts[10] || [],
        spotlightPosts: allPosts[11] || []
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: { 
        posts: [],
        categories: [],
        exclusivePost: null,
        topStoriesPosts: [],
        newsPosts: [],
        beritaPosts: [],
        lifestylePosts: [],
        goingViralPosts: [],
        sportsPosts: [],
        malaysiaPosts: [],
        worldPosts: [],
        asiaPosts: [],
        prnPosts: [],
        palestinePosts: [],
        chinaPosts: [],
        spotlightPosts: []
      },
      revalidate: 60,
    };
  }
};