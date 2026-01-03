import { useState, useEffect, useRef } from 'react';
import { PDFData } from '@/types/ipaper';
import styles from '@/styles/IPaper.module.css';

interface FlipbookProps {
  pdf: PDFData | null;
  onPageChange?: (page: number) => void;
}

export default function Flipbook({ pdf, onPageChange }: FlipbookProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const totalPages = pdf?.pages || 12;

  // Handle page navigation
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      if (onPageChange) onPageChange(page);
    }
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextPage();
      if (e.key === 'ArrowLeft') prevPage();
      if (e.key === 'Home') goToPage(1);
      if (e.key === 'End') goToPage(totalPages);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages]);

  // Create realistic newspaper page
  const createPageContent = (pageNum: number) => {
    const headlines = [
      "Anti-Bullying Bill Hailed as Landmark Legislation",
      "Former PM's Secretary Charged in Corruption Case",
      "Digital Registration System for Pets Mooted",
      "Cabinet Ministers Sworn in for Second Term",
      "Malaysian Economy Shows Strong Q4 Growth",
      "New Climate Change Policy Announced",
      "Healthcare Reforms to Benefit Millions",
      "Tech Giant Announces Major Investment"
    ];
    
    const categories = ["Politics", "Business", "Sports", "Technology", "Health", "Education"];
    const authors = ["John Doe", "Jane Smith", "Alex Johnson", "Sarah Lee"];
    
    const headline = headlines[Math.floor(Math.random() * headlines.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const author = authors[Math.floor(Math.random() * authors.length)];

    return (
      <div className={styles.pageContent}>
        {/* Newspaper Header */}
        <div className={styles.pageHeader}>
          <div>
            <div className={styles.newspaperLogo}>theSun</div>
            <div className={styles.newspaperSub}>Malaysia's Independent Voice</div>
          </div>
          <div className={styles.pageNumber}>
            <div>Page {pageNum}</div>
            <div>{pdf?.date ? new Date(pdf.date).toLocaleDateString('en-MY') : 'December 4, 2025'}</div>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.pageMain}>
          <div className={styles.leftColumn}>
            <div className={styles.categoryTag}>{category}</div>
            <h1 className={styles.headline}>{headline}</h1>
            
            <div className={styles.authorInfo}>
              <span>By {author}</span>
              <span className={styles.separator}>|</span>
              <span>5 min read</span>
            </div>
            
            <div className={styles.articleContent}>
              <p>
                In a landmark decision that has been hailed by activists nationwide, Parliament 
                yesterday passed groundbreaking legislation with an overwhelming majority. 
                The new law, which has been in development for over two years, aims to address 
                long-standing issues and provide comprehensive solutions.
              </p>
              <p>
                Minister Datuk Dr. Radzi Jidin described the bill as "a crucial step toward 
                creating a more equitable society for all Malaysians." The legislation establishes 
                clear frameworks and sets out stringent measures for implementation.
              </p>
              <p>
                "This represents a significant shift in policy direction," said political analyst 
                Dr. Aishah Hassan. "It demonstrates the government's commitment to progressive 
                reforms and sustainable development."
              </p>
            </div>
          </div>

          <div className={styles.rightColumn}>
            <h3 className={styles.sidebarTitle}>In Today's Issue</h3>
            
            <div className={styles.sidebarItem}>
              <div className={styles.sidebarCategory}>Business</div>
              <div className={styles.sidebarText}>Economy grows 5.2% in Q4, exceeding expectations.</div>
            </div>
            
            <div className={styles.sidebarItem}>
              <div className={styles.sidebarCategory}>Sports</div>
              <div className={styles.sidebarText}>National team qualifies for Asian Cup finals.</div>
            </div>
            
            <div className={styles.sidebarItem}>
              <div className={styles.sidebarCategory}>Technology</div>
              <div className={styles.sidebarText}>Local startup raises $50M for AI platform.</div>
            </div>
            
            <div className={styles.factBox}>
              <div className={styles.factTitle}>DID YOU KNOW?</div>
              <div className={styles.factText}>
                TheSun reaches over 2 million readers daily, making it one of Malaysia's 
                most widely read English-language newspapers.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.flipbookContainer} ref={containerRef}>
      <div className={styles.flipbook}>
        <div className={styles.pageWrapper}>
          {createPageContent(currentPage)}
        </div>
      </div>
      
      <button 
        className={styles.navArrowPrev}
        onClick={prevPage}
        disabled={currentPage <= 1}
      >
        <i className="fas fa-chevron-left"></i>
      </button>
      
      <button 
        className={styles.navArrowNext}
        onClick={nextPage}
        disabled={currentPage >= totalPages}
      >
        <i className="fas fa-chevron-right"></i>
      </button>
      
      <div className={styles.pageCounter}>
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
}