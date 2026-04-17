import { useEffect, useRef } from 'react';
import { PDFData } from '@/types/ipaper';
import styles from '@/styles/IPaper.module.css';

interface FlipbookProps {
  pdf: PDFData | null;
  onPageChange?: (page: number) => void;
}

declare global {
  interface Window {
    $: any;
    jQuery: any;
  }
}

export default function Flipbook({ pdf, onPageChange }: FlipbookProps) {
  const flipbookRef = useRef<HTMLDivElement>(null);
  const turnRef = useRef<any>(null);

  useEffect(() => {
    // Dynamically load turn.js
    const loadTurnJS = async () => {
      if (typeof window !== 'undefined' && flipbookRef.current) {
        try {
          // Load jQuery if not already loaded
          if (!window.jQuery) {
            await new Promise<void>((resolve, reject) => {
              const script = document.createElement('script');
              script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
              script.onload = () => resolve();
              script.onerror = () => reject(new Error('Failed to load jQuery'));
              document.head.appendChild(script);
            });
          }

          // Load turn.js
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/turn.js@4.1.1/turn.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load turn.js'));
            document.head.appendChild(script);
          });

          // Initialize flipbook
          if (window.$ && flipbookRef.current) {
            // Destroy previous instance if exists
            if (turnRef.current) {
              window.$(flipbookRef.current).turn('destroy');
            }

            turnRef.current = window.$(flipbookRef.current).turn({
              width: 1000,
              height: 600,
              autoCenter: true,
              display: 'double',
              acceleration: true,
              when: {
                turning: function(e: any, page: number) {
                  if (onPageChange) {
                    onPageChange(Math.ceil(page / 2));
                  }
                }
              }
            });

            // Add sample pages
            const pageCount = pdf?.pages || 12;
            for (let i = 1; i <= pageCount; i++) {
              window.$(flipbookRef.current).turn('addPage', `
                <div style="width:100%; height:100%; background:white; padding:30px; font-family:'Georgia', serif;">
                  <div style="border-bottom:3px solid #E30016; padding-bottom:10px; margin-bottom:20px;">
                    <div style="font-size:24px; font-weight:bold; color:#E30016;">theSun</div>
                    <div style="font-size:12px; color:#666;">Page ${i} | Digital Edition</div>
                  </div>
                  <h2 style="color:#000; font-size:22px; margin-bottom:15px;">
                    Sample Page ${i}
                  </h2>
                  <p style="font-size:16px; line-height:1.6; color:#333;">
                    This is a sample page of theSun digital newspaper.
                    ${pdf ? `PDF: ${pdf.title}` : ''}
                  </p>
                </div>
              `);
            }
          }
        } catch (error) {
          console.error('Failed to load flipbook:', error);
        }
      }
    };

    loadTurnJS();

    // Cleanup
    return () => {
      if (turnRef.current && window.$ && flipbookRef.current) {
        try {
          window.$(flipbookRef.current).turn('destroy');
        } catch (error) {
          console.error('Error destroying flipbook:', error);
        }
      }
    };
  }, [pdf, onPageChange]);

  return (
    <div className={styles.flipbookContainer}>
      <div ref={flipbookRef} id="flipbook"></div>
      {flipbookRef.current && (
        <>
          <button 
            className={styles.navArrowPrev}
            onClick={() => window.$(flipbookRef.current).turn('previous')}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <button 
            className={styles.navArrowNext}
            onClick={() => window.$(flipbookRef.current).turn('next')}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </>
      )}
    </div>
  );
}