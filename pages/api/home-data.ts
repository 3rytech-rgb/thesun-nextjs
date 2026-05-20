import type { NextApiRequest, NextApiResponse } from 'next';
import { getPosts, getCategories, getPostsByTagSlug, getTopStories, getPostsByCategoryWithChildren } from '../../lib/wordpress';

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const [posts, categories, tags, pinnedPosts, topStoriesPosts] = await Promise.all([
      getPosts(30),
      getCategories(),
      (await import('../../lib/wordpress')).getTags(),
      getPostsByTagSlug('pin', 5),
      getTopStories(),
    ]);

    const getCatId = (name: string) => categories.find(c => c.name.toLowerCase().includes(name.toLowerCase()) && c.parent === 0)?.id || 0;
    const getSlugId = (s: string) => categories.find(c => c.slug.includes(s) || c.name.toLowerCase().includes(s))?.id || 0;

    const ids = {
      news: getCatId('news'),
      berita: getCatId('berita'),
      lifestyle: getCatId('lifestyle'),
      goingViral: getCatId('going viral'),
      sports: getCatId('sports'),
      malaysia: getSlugId('malaysia'),
      world: getSlugId('world'),
      asia: getSlugId('asia'),
      business: getCatId('business'),
      prn: getSlugId('prn') || getSlugId('pilihan raya'),
      palestine: getSlugId('palestine') || getSlugId('gaza'),
      china: getSlugId('china') || getSlugId('beijing'),
      spotlight: getSlugId('spotlight'),
      video: getSlugId('video'),
      opinion: getSlugId('opinion'),
    };

    const all = await Promise.all([
      ids.news ? getPostsByCategoryWithChildren(ids.news) : Promise.resolve([]),
      ids.berita ? getPostsByCategoryWithChildren(ids.berita) : Promise.resolve([]),
      ids.lifestyle ? getPostsByCategoryWithChildren(ids.lifestyle) : Promise.resolve([]),
      ids.goingViral ? getPostsByCategoryWithChildren(ids.goingViral) : Promise.resolve([]),
      ids.sports ? getPostsByCategoryWithChildren(ids.sports) : Promise.resolve([]),
      ids.malaysia ? getPostsByCategoryWithChildren(ids.malaysia) : Promise.resolve([]),
      ids.world ? getPostsByCategoryWithChildren(ids.world) : Promise.resolve([]),
      ids.asia ? getPostsByCategoryWithChildren(ids.asia) : Promise.resolve([]),
      ids.business ? getPostsByCategoryWithChildren(ids.business) : Promise.resolve([]),
      ids.prn ? getPostsByCategoryWithChildren(ids.prn) : Promise.resolve([]),
      ids.palestine ? getPostsByCategoryWithChildren(ids.palestine) : Promise.resolve([]),
      ids.china ? getPostsByCategoryWithChildren(ids.china) : Promise.resolve([]),
      ids.spotlight ? getPostsByCategoryWithChildren(ids.spotlight) : Promise.resolve([]),
      ids.video ? getPostsByCategoryWithChildren(ids.video) : Promise.resolve([]),
      ids.opinion ? getPostsByCategoryWithChildren(ids.opinion) : Promise.resolve([]),
    ]);

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    res.status(200).json({
      posts: posts || [],
      categories: categories || [],
      pinnedPosts: pinnedPosts || [],
      topStoriesPosts: topStoriesPosts || [],
      newsPosts: all[0] || [],
      beritaPosts: all[1] || [],
      lifestylePosts: all[2] || [],
      goingViralPosts: all[3] || [],
      sportsPosts: all[4] || [],
      malaysiaPosts: all[5] || [],
      worldPosts: all[6] || [],
      asiaPosts: all[7] || [],
      businessPosts: all[8] || [],
      prnPosts: all[9] || [],
      palestinePosts: all[10] || [],
      chinaPosts: all[11] || [],
      spotlightPosts: all[12] || [],
      videoPosts: all[13] || [],
      opinionPosts: all[14] || [],
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch' });
  }
}
