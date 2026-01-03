// types/wordpress.tsx - PERBAIKI EXPORT
export interface WPAuthor {
  term_id: number;
  user_id: number;
  is_guest: number;
  slug: string;
  job_title: string;
  display_name: string;
  avatar_url: {
    url: string;
    url2x: string;
  };
  author_category: string;
  first_name: string;
  last_name: string;
}

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  link?: string;
  count?: number;
  parent?: number;
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

// types/wordpress.tsx - UPDATE INI
export interface WPPost {
  id: number;
  slug: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  date: string;
  date_gmt: string;
  modified: string;
  modified_gmt: string;
  status: string;
  type: string;
  link: string;
  author: number;
  featured_media: number; // ✅ Ini adalah ID (number)
  featured_media_url?: string; // ✅ Tambahkan ini untuk URL
  featured_media_alt?: string; // ✅ Tambahkan ini untuk alt text
  featured_media_width?: number; // ✅ Tambahkan ini untuk width
  featured_media_height?: number; // ✅ Tambahkan ini untuk height
  comment_status: string;
  ping_status: string;
  sticky: boolean;
  template: string;
  format: string;
  meta: {
    footnotes: string;
  };
  categories: number[];
  tags: number[];
  authors?: WPAuthor[];
  class_list?: {
    [key: string]: string;
  };
  post_views_count?: number;
  ppma_author?: number[];
  _embedded?: {
    'wp:featuredmedia'?: WPMedia[];
    author?: any[];
    'wp:term'?: [WPCategory[], WPTag[]];
  };
}

// ✅ PASTIKAN WPPostWithMedia DEEXPORT
export interface WPPostWithMedia extends WPPost {
  featured_media_url?: string;
  featured_media_alt?: string;
  featured_media_width?: number;
  featured_media_height?: number;
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

// Header Types
export interface BreakingNews {
  id: number;
  title: string;
  link: string;
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