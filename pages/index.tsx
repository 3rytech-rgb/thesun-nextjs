import { GetStaticProps } from 'next';
import { getPosts, getCategories, getPostsByCategoryWithChildren } from '../lib/wordpress';
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
  spotlightPosts: WPPost[]; // Added this
}

export default function Home({ 
  posts, 
  categories, 
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
  spotlightPosts // Added this
}: HomeProps) {
  const featuredPost = posts[0];
  const latestPosts = posts.slice(1, 5);
  const topStories = posts.slice(5, 15);

  // Special Sections dengan custom design
  const specialSections = [
    {
      name: 'PRN',
      slug: 'prn',
      tagline: 'Latest updates on State Elections',
      backgroundColor: '#1e3a8a', // Blue
      accentColor: '#1e3a8a',
      textColor: '#ffffff',
      backgroundImage: '/images/thesun.png' // Optional: Add background image
    },
    {
      name: 'Palestine',
      slug: 'palestine',
      tagline: 'Standing in solidarity with Palestine',
      backgroundColor: '#14532d', // Green
      accentColor: '#22c55e',
      textColor: '#ffffff',
      // backgroundImage: '/images/palestine-bg.jpg'
    },
    {
      name: 'China',
      slug: 'china',
      tagline: 'China-Malaysia relations and updates',
      backgroundColor: '#7f1d1d', // Red
      accentColor: '#ef4444',
      textColor: '#ffffff',
      // backgroundImage: '/images/china-bg.jpg'
    }
  ];

  const specialSectionPosts = {
    prn: prnPosts,
    palestine: palestinePosts,
    china: chinaPosts
  };

  return (
    <Layout categories={categories}>
      <div className="container mx-auto px-4 py-8">
        {/* Main News Grid */}
        <div className="grid grid-cols-4 gap-8 mb-12">
          <div className="col-span-2">
            <FeaturedStory post={featuredPost} categories={categories} />
          </div>
          <div className="col-span-1">
            <LatestNews posts={latestPosts} categories={categories} />
          </div>
          <div className="col-span-1">
            <TopStories posts={topStories} categories={categories} />
          </div>
        </div>

        {/* LINE BREAK SEBELUM CATEGORY SECTIONS */}
        <div className="border-t border-gray-300 my-16"></div>

        <GoingViralSection 
          posts={goingViralPosts} 
          categories={categories} 
        />
        
        {/* Combined Section (Malaysia, World, Asia) */}
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
        <div className="border-t-2 border-dashed border-gray-400 my-20"></div>

        {/* SPECIAL SECTIONS HEADER */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Special Coverage
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            In-depth analysis and comprehensive coverage on important topics
          </p>
          <div className="w-48 h-1 bg-gradient-to-r from-red-600 via-blue-600 to-green-600 mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Special Sections */}
        {specialSections.map((section) => {
          const posts = specialSectionPosts[section.slug as keyof typeof specialSectionPosts];
          if (posts.length === 0) return null;

          return (
            <SpecialSection
              key={section.slug}
              section={section}
              posts={posts.slice(1)} // All except featured
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
    const [posts, categories] = await Promise.all([
      getPosts(),
      getCategories()
    ]);

    // Helper function untuk cari category ID dari name
    const getCategoryIdByName = (categoryName: string): number => {
      const category = categories.find(cat => 
        cat.name.toLowerCase().includes(categoryName.toLowerCase()) && cat.parent === 0
      );
      return category?.id || 0;
    };

    // Helper function untuk cari category ID dari slug atau tag
    const getCategoryIdBySlugOrTag = (searchTerm: string): number => {
      // Cari dalam categories
      const category = categories.find(cat => 
        cat.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return category?.id || 0;
    };

    // Dapatkan category IDs untuk semua sections
    const categoryIds = {
      news: getCategoryIdByName('news'),
      berita: getCategoryIdByName('berita'),
      lifestyle: getCategoryIdByName('lifestyle'),
      goingViral: getCategoryIdByName('going viral'),
      sports: getCategoryIdByName('sports'),
      // Malaysia, World, Asia sections
      malaysia: getCategoryIdBySlugOrTag('malaysia'),
      world: getCategoryIdBySlugOrTag('world'),
      asia: getCategoryIdBySlugOrTag('asia'),
      // Special sections - cari berdasarkan slug atau tag
      prn: getCategoryIdBySlugOrTag('prn') || getCategoryIdBySlugOrTag('pilihan raya'),
      palestine: getCategoryIdBySlugOrTag('palestine') || getCategoryIdBySlugOrTag('gaza'),
      china: getCategoryIdBySlugOrTag('china') || getCategoryIdBySlugOrTag('beijing'),
      // Spotlight section
      spotlight: getCategoryIdByName('spotlight') || getCategoryIdBySlugOrTag('spotlight')
    };

    // Fetch posts untuk semua sections
    const allPosts = await Promise.all([
      // Regular categories (Index 0-4)
      categoryIds.news ? getPostsByCategoryWithChildren(categoryIds.news) : Promise.resolve([]),
      categoryIds.berita ? getPostsByCategoryWithChildren(categoryIds.berita) : Promise.resolve([]),
      categoryIds.lifestyle ? getPostsByCategoryWithChildren(categoryIds.lifestyle) : Promise.resolve([]),
      categoryIds.goingViral ? getPostsByCategoryWithChildren(categoryIds.goingViral) : Promise.resolve([]),
      categoryIds.sports ? getPostsByCategoryWithChildren(categoryIds.sports) : Promise.resolve([]),
      
      // Malaysia, World, Asia sections (Index 5-7)
      categoryIds.malaysia ? getPostsByCategoryWithChildren(categoryIds.malaysia) : Promise.resolve([]),
      categoryIds.world ? getPostsByCategoryWithChildren(categoryIds.world) : Promise.resolve([]),
      categoryIds.asia ? getPostsByCategoryWithChildren(categoryIds.asia) : Promise.resolve([]),
      
      // Special sections (Index 8-10)
      categoryIds.prn ? getPostsByCategoryWithChildren(categoryIds.prn) : Promise.resolve([]),
      categoryIds.palestine ? getPostsByCategoryWithChildren(categoryIds.palestine) : Promise.resolve([]),
      categoryIds.china ? getPostsByCategoryWithChildren(categoryIds.china) : Promise.resolve([]),
      
      // Spotlight section (Index 11)
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
        spotlightPosts: allPosts[11] || [] // Added this
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: { 
        posts: [],
        categories: [],
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
        spotlightPosts: [] // Added this
      },
      revalidate: 60,
    };
  }
};