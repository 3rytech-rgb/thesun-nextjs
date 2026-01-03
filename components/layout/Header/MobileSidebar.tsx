import Link from 'next/link';
import { CategoryItem } from './types';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  mainNavItems: CategoryItem[];
}

export default function MobileSidebar({ 
  isOpen, 
  onClose, 
  mainNavItems 
}: MobileSidebarProps) {
  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      <div className={`
        fixed top-0 left-0 h-full w-80 bg-slate-900 z-50 transform transition-transform duration-300 ease-out
        lg:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        border-r border-slate-700
      `}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
          <h2 className="text-lg font-bold text-white">Categories</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-700 transition-colors duration-200"
            aria-label="Close menu"
          >
            <svg 
              className="w-5 h-5 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 h-[calc(100%-65px)] overflow-y-auto">
          <div className="space-y-2">
            {mainNavItems.map((item, index) => (
              <div key={item.id} className="animate-fadeInUp" style={{ animationDelay: `${index * 50}ms` }}>
                {item.external ? (
                  <a
                    href={item.slug}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-300 mb-2"
                  >
                    <div className="flex items-center">
                      <img 
                        src="/images/ipaper.png"
                        alt="iPaper"
                        className="h-5 w-5 mr-2"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <h3 className="font-bold text-white text-lg group-hover:text-yellow-300 transition-colors duration-200">
                        {item.name}
                      </h3>
                    </div>
                  </a>
                ) : (
                  <>
                    <Link
                      href={item.name === 'Home' ? '/' : `/category/${item.slug}`}
                      className="group flex items-center justify-between p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-300 mb-2"
                      onClick={onClose}
                    >
                      <h3 className="font-bold text-white text-lg group-hover:text-blue-300 transition-colors duration-200">
                        {item.name}
                      </h3>
                      {item.hot && (
                        <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full animate-pulse">
                          HOT
                        </span>
                      )}
                    </Link>
                    
                    {item.subItems && item.subItems.length > 0 && (
                      <div className="space-y-1 ml-4">
                        <Link
                          href={`/category/${item.slug}`}
                          className="group/all block p-2 rounded-lg bg-slate-700/40 hover:bg-slate-600/50 transition-all duration-300 animate-fadeInUp"
                          style={{ animationDelay: `${(index * 50)}ms` }}
                          onClick={onClose}
                        >
                          <span className="text-blue-300 group-hover/all:text-white transition-colors duration-200 text-sm font-medium">
                            All {item.name}
                          </span>
                        </Link>
                        {item.subItems.map((subItem: any, subIndex: number) => (
                          <Link
                            key={subItem.id}
                            href={`/category/${subItem.slug}`}
                            className="group/sub block p-3 rounded-lg bg-slate-700/30 hover:bg-slate-600/50 transition-all duration-300 animate-fadeInUp"
                            style={{ animationDelay: `${(index * 50) + (subIndex * 30)}ms` }}
                            onClick={onClose}
                          >
                            <span className="text-slate-300 group-hover/sub:text-white transition-colors duration-200 text-sm">
                              {subItem.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}