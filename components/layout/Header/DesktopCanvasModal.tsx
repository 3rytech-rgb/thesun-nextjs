import Link from 'next/link';
import { CategoryItem } from './types';
import { cleanHtmlContent } from '../../home/utils/contentCleaner';

interface DesktopCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasCategories: {
    row1: CategoryItem[];
    row2: CategoryItem[];
  };
}

export default function DesktopCanvasModal({ 
  isOpen, 
  onClose, 
  canvasCategories 
}: DesktopCanvasModalProps) {
  const CategoryColumn = ({ 
    category,
    animationDelay = 0
  }: { 
    category: CategoryItem;
    animationDelay?: number;
  }) => {
    return (
      <div 
        className="animate-fadeInUp group/column"
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        <Link
          href={category.name === 'Home' ? '/' : `/category/${category.slug}`}
          className="group block p-5 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 hover:from-red-600 hover:to-red-700 transition-all duration-500 transform hover:scale-105 border-2 border-slate-600 hover:border-red-400 hover:shadow-2xl hover:shadow-red-500/30 mb-4 relative overflow-hidden"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/10 group-hover:to-red-500/5 transition-all duration-500 rounded-2xl"></div>
          
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-white text-xl group-hover:text-white transition-colors duration-300 drop-shadow-lg">
                 {cleanHtmlContent(category.name)}
              </h3>
              {category.hot && (
                <span className="text-xs bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full animate-pulse shadow-lg border border-red-400">
                  HOT
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-slate-400 group-hover:text-red-200 text-sm transition-colors duration-300">
                {category.subItems && category.subItems.length > 0 
                  ? `${category.subItems.length} subcategories` 
                  : 'Explore more'
                }
              </div>
              <div className="opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300">
                <svg className="w-5 h-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
        
        {category.subItems && category.subItems.length > 0 && (
          <div className="space-y-2 ml-1">
            {category.subItems.map((subItem: any, index: number) => (
              <Link
                key={subItem.id}
                href={`/category/${subItem.slug}`}
                className="group/sub block p-4 rounded-xl bg-slate-800/80 hover:bg-gradient-to-r hover:from-red-500/20 hover:to-red-600/10 transition-all duration-400 transform hover:scale-102 border border-slate-600/50 hover:border-red-400/50 hover:shadow-lg hover:shadow-red-400/20 animate-fadeInUp backdrop-blur-sm"
                style={{ animationDelay: `${animationDelay + (index * 80)}ms` }}
                onClick={onClose}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-slate-400 rounded-full group-hover/sub:bg-red-400 group-hover/sub:animate-pulse transition-all duration-300"></div>
                    <span className="text-slate-300 group-hover/sub:text-white transition-colors duration-300 text-sm font-medium">
                      {subItem.name}
                    </span>
                  </div>
                  <div className="opacity-0 group-hover/sub:opacity-100 transform translate-x-0 group-hover/sub:translate-x-1 transition-all duration-300">
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`
      fixed inset-0 z-50
      transition-all duration-500 ease-out
      hidden lg:flex items-center justify-center
      ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      bg-black/50 backdrop-blur-sm
    `}>
      {/* Canvas Modal Container */}
      <div className={`
        w-[96vw] max-w-7xl h-[88vh] max-h-[800px]
        bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl
        transform transition-all duration-500
        ${isOpen ? 'scale-100' : 'scale-95'}
        border border-slate-600/50 backdrop-blur-lg
        overflow-hidden
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-slate-600/50 bg-gradient-to-r from-slate-800 to-slate-900 rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Browse Categories</h2>
            <p className="text-slate-400 text-sm">Explore all content categories</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-full hover:bg-slate-700/50 transition-all duration-300 hover:scale-110 hover:shadow-lg"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-8 h-[calc(100%-96px)] overflow-y-auto">
          {/* Popular Categories Section */}
          <div className="mb-10">
            <h3 className="text-lg font-semibold text-slate-300 mb-6 pb-2 border-b border-slate-600/30">Popular Categories</h3>
            <div className="grid grid-cols-5 gap-6">
              {canvasCategories.row1.map((item, index) => (
                <CategoryColumn 
                  key={item.id}
                  category={item}
                  animationDelay={index * 100}
                />
              ))}
            </div>
          </div>

          {/* More Categories Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-300 mb-6 pb-2 border-b border-slate-600/30">More Categories</h3>
            <div className="grid grid-cols-5 gap-6">
              {canvasCategories.row2.map((item, index) => (
                <CategoryColumn 
                  key={item.id}
                  category={item}
                  animationDelay={(canvasCategories.row1.length * 100) + (index * 100)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}