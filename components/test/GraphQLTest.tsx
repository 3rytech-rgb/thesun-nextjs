'use client';

import { useState, useEffect } from 'react';
import { testGraphQLConnection, getPostsGraphQL, getCategoriesGraphQL } from '../../lib/graphql';

export default function GraphQLTest() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testConnection() {
      try {
        // Test GraphQL connection
        const connectionResult = await testGraphQLConnection();
        setConnectionStatus(connectionResult.message);

        if (connectionResult.success) {
          // Fetch posts
          const postsData = await getPostsGraphQL(5);
          setPosts(postsData);

          // Fetch categories
          const categoriesData = await getCategoriesGraphQL(10);
          setCategories(categoriesData);
        }
      } catch (error) {
        setConnectionStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }

    testConnection();
  }, []);

  if (loading) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <h2 className="text-lg font-bold mb-2">GraphQL Test</h2>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h2 className="text-lg font-bold mb-4">GraphQL Test Results</h2>
      
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Connection Status:</h3>
        <div className={`p-2 rounded ${connectionStatus.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {connectionStatus}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Posts ({posts.length}):</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {posts.map((post) => (
              <div key={post.id} className="p-2 border rounded bg-white">
                <h4 className="font-medium">{post.title.rendered}</h4>
                <p className="text-sm text-gray-600">Slug: {post.slug}</p>
                {post.featured_media_url && (
                  <img 
                    src={post.featured_media_url} 
                    alt={post.featured_media_alt || ''}
                    className="w-full h-32 object-cover mt-2 rounded"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Categories ({categories.length}):</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {categories.map((category) => (
              <div key={category.id} className="p-2 border rounded bg-white">
                <h4 className="font-medium">{category.name}</h4>
                <p className="text-sm text-gray-600">Slug: {category.slug}</p>
                <p className="text-sm text-gray-600">Count: {category.count || 0}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p>GraphQL Endpoint: {process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL || 'Not set'}</p>
        <p>Note: Make sure WPGraphQL plugin is installed on WordPress.</p>
      </div>
    </div>
  );
}