// GraphQL Types untuk WordPress (WPGraphQL)

export interface GraphQLAuthor {
  node: {
    name: string;
    description?: string;
    avatar?: {
      url: string;
    };
  };
}

export interface GraphQLCategory {
  node: {
    id: string;
    name: string;
    slug: string;
    count?: number;
    parent?: {
      node: {
        id: string;
      };
    };
  };
}

export interface GraphQLTag {
  node: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface GraphQLMedia {
  node: {
    sourceUrl: string;
    altText: string;
    mediaDetails?: {
      width: number;
      height: number;
    };
  };
}

export interface GraphQLPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  modified: string;
  featuredImage?: GraphQLMedia;
  categories?: {
    nodes: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
  };
  tags?: {
    nodes: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
  };
  author?: GraphQLAuthor;
}

export interface GraphQLPostsResponse {
  posts: {
    nodes: GraphQLPost[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
  };
}

export interface GraphQLPostResponse {
  post: GraphQLPost;
}

export interface GraphQLCategoriesResponse {
  categories: {
    nodes: Array<{
      id: string;
      name: string;
      slug: string;
      count: number;
      parent?: {
        node: {
          id: string;
        };
      };
    }>;
  };
}

export interface GraphQLTagsResponse {
  tags: {
    nodes: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
  };
}