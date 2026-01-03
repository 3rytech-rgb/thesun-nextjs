import Link from 'next/link';
import { CategoryItem } from './types';

interface DesktopNavProps {
  mainNavItems: CategoryItem[];
  activeDropdown: number | null;
  toggleDropdown: (id: number) => void;
  setActiveDropdown: (id: number | null) => void;
  dropdownContainerRef: React.RefObject<HTMLDivElement>;
}

export default function DesktopNav({
  mainNavItems,
  activeDropdown,
  toggleDropdown,
  setActiveDropdown,
  dropdownContainerRef
}: DesktopNavProps) {
  const NavItemWithDropdown = ({ item }: { item: CategoryItem }) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;

    if (hasSubItems) {
      return (
        <div className="relative z-50" key={item.id}>
          <button
            onClick={() => toggleDropdown(item.id)}
            className="flex items-center text-white hover:text-blue-300 font-semibold transition-all duration-200 py-2 px-3 lg:px-4 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-600 text-sm lg:text-base relative z-10"
          >
            {item.name}
            {item.hot && (
              <span className="ml-1 lg:ml-2 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full animate-pulse">
                HOT
              </span>
            )}
            <svg 
              className={`ml-1 w-4 h-4 transition-transform duration-200 ${
                activeDropdown === item.id ? 'rotate-180' : ''
              }`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {activeDropdown === item.id && item.subItems && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl z-[9999] overflow-visible animate-fadeIn">
              <div className="p-3 max-h-96 overflow-y-auto">
                <Link
                  href={`/category/${item.slug}`}
                  className="block px-4 py-3 text-white hover:bg-slate-700 transition-colors duration-200 rounded-lg mb-2 border-b border-slate-600 bg-gradient-to-r from-slate-700 to-slate-800"
                  onClick={() => setActiveDropdown(null)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">All {item.name}</span>
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
                
                <div className="space-y-1">
                  {item.subItems.map((subItem: any) => (
                    <Link
                      key={subItem.id}
                      href={`/category/${subItem.slug}`}
                      className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700 transition-all duration-200 rounded-lg hover:pl-5 hover:shadow-md"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 opacity-70"></div>
                          <span className="text-sm">{subItem.name}</span>
                        </div>
                        <svg className="w-3 h-3 text-slate-500 group-hover:text-green-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        href={item.name === 'Home' ? '/' : `/category/${item.slug}`}
        className="flex items-center text-white hover:text-blue-300 font-semibold transition-all duration-200 py-2 px-3 lg:px-4 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-600 text-sm lg:text-base"
        key={item.id}
      >
        {item.name}
        {item.hot && (
          <span className="ml-1 lg:ml-2 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full animate-pulse">
            HOT
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="mt-4 hidden lg:block overflow-visible relative" ref={dropdownContainerRef}>
      <nav className="flex flex-wrap justify-center gap-2 lg:gap-3 items-center relative z-40">
        {mainNavItems.map((item) => {
          if (item.external) {
            return (
              <a
                key={item.id}
                href={item.slug}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block transition-all duration-200 hover:opacity-80 hover:scale-105 relative z-30"
              >
                <img 
                  src="/images/ipaper.png"
                  alt="iPaper"
                  className="h-8 w-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'bg-yellow-500 text-gray-900 font-bold px-4 py-2 rounded-lg';
                    fallback.textContent = 'iPAPER';
                    e.currentTarget.parentNode?.appendChild(fallback);
                  }}
                />
              </a>
            );
          } else if (item.name === 'More') {
            return (
              <div key={item.id} className="relative z-50">
                <button
                  onClick={() => toggleDropdown(item.id)}
                  className="flex items-center text-white hover:text-blue-300 font-semibold transition-all duration-200 py-2 px-3 lg:px-4 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-600 text-sm lg:text-base relative z-10"
                >
                  {item.name}
                  <svg 
                    className={`ml-1 w-4 h-4 transition-transform duration-200 ${
                      activeDropdown === item.id ? 'rotate-180' : ''
                    }`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {activeDropdown === item.id && item.subItems && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl z-[9999] overflow-visible animate-fadeIn">
                    <div className="p-3 max-h-96 overflow-y-auto">
                      {item.subItems.map((subItem: any) => (
                        <Link
                          key={subItem.id}
                          href={`/category/${subItem.slug}`}
                          className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700 transition-all duration-200 rounded-lg hover:pl-5"
                          onClick={() => setActiveDropdown(null)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-3 opacity-70"></div>
                              <span className="text-sm">{subItem.name}</span>
                            </div>
                            <svg className="w-3 h-3 text-slate-500 group-hover:text-green-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          } else {
            return (
              <NavItemWithDropdown 
                key={item.id}
                item={item}
              />
            );
          }
        })}
      </nav>
    </div>
  );
}