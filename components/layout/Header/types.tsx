// types/wordpress.tsx
export interface WPAuthor {
  id: number;
  name: string;
  slug: string;
}

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
}

export interface WPTag {
  id: number;
  name: string;
  slug: string;
}

export interface WPMedia {
  id: number;
  source_url: string;
  alt_text: string;
  media_details: {
    width: number;
    height: number;
    file: string;
    sizes: {
      [key: string]: {
        source_url: string;
        width: number;
        height: number;
      };
    };
  };
}

export interface WPPost {
  id: number;
  slug: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  date: string;
  modified: string;
  featured_media: number;
  featured_media_url: string | null;
  featured_media_alt: string;
  featured_media_id: number;
  _embedded?: {
    author?: WPAuthor[];
    'wp:featuredmedia'?: WPMedia[];
    'wp:term'?: [WPCategory[], WPTag[]];
  };
  categories: (number | WPCategory)[];
  tags: (number | WPTag)[];
}

export interface WPPage {
  id: number;
  slug: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
}
export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  link: string;
  count: number;
  parent: number;
}

// Export types untuk Header
export interface BreakingNews {
  id: number;
  title: string;
  link: string;
  slug: string; // ✅ Tambahkan ini
  category?: string;
}

export interface CategoryItem {
  name: string;
  slug: string;
  id: number;
  hot: boolean;
  subItems?: any[];
  external?: boolean;
}

export interface HeaderProps {
  categories?: WPCategory[];
}