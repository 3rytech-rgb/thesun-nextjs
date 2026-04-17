import Layout from '../components/layout/Layout';

export default function AboutUs() {
  return (
    <Layout 
      title="About Us | The Sun Malaysia"
      description="Learn more about The Sun Malaysia, our mission, and our team"
    >
      <main className="bg-gray-50 min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">About Us</h1>
            
            <div className="prose prose-lg max-w-none mb-12">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-6 mb-10 rounded-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Since our launch in 1993, we have been a cornerstone of Malaysian journalism, providing millions of readers with reliable, balanced, and concise news. On April 8, 2002, we solidified our place as Malaysia's first national free daily, making quality journalism accessible to everyone.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  The Sun Malaysia is published by Sun Media Corporation Sdn Bhd (221220-K). With our headquarters in Petaling Jaya, Selangor, we are committed to contributing to Malaysia's dynamic media landscape.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Our Mission</h3>
                  </div>
                  <p className="text-gray-700">
                    To empower our readers with accurate and timely information. Our editorial approach is driven by a deep commitment to integrity, authority, and impartiality.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Our Vision</h3>
                  </div>
                  <p className="text-gray-700">
                    To be Malaysia's most trusted and accessible news source, delivering quality journalism that informs, educates, and engages readers across all platforms.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-6 mb-10 rounded-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Integrity</h3>
                    <p className="text-gray-700 text-sm">We adhere to the highest standards of journalism, striving for accuracy and transparency in all our reporting.</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Authority</h3>
                    <p className="text-gray-700 text-sm">Our experienced editorial team ensures in-depth and authoritative coverage across all topics.</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Accessibility</h3>
                    <p className="text-gray-700 text-sm">By providing our content for free, we ensure quality news is accessible to all Malaysians.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-slate-50 to-gray-100 border border-gray-200 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">A Legacy of Excellence</h2>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    The Sun's journey is one of continuous growth and adaptation. Starting as a paid newspaper, we re-emerged in 2002 with a groundbreaking free distribution model, which transformed the local media landscape.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Over the years, our dedication to public service journalism and insightful opinion writing has been recognized with multiple awards from the Society of Publishers in Asia (SOPA).
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Today, thesun.my continues this legacy, using digital platforms to deliver breaking news and thought-provoking stories instantly. Our online presence, powered by our trusted reputation, makes us a go-to source for anyone seeking reliable Malaysian news.
                  </p>
                </div>
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                    <div className="text-3xl font-bold text-red-600 mb-2">1993</div>
                    <h3 className="font-bold text-gray-900 mb-2">Founded</h3>
                    <p className="text-gray-700 text-sm">Started our journey in Malaysian journalism</p>
                  </div>
                  
                  <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                    <div className="text-3xl font-bold text-red-600 mb-2">2002</div>
                    <h3 className="font-bold text-gray-900 mb-2">Transformation</h3>
                    <p className="text-gray-700 text-sm">Became Malaysia's first free national daily</p>
                  </div>
                  
                  <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                    <div className="text-3xl font-bold text-red-600 mb-2">Millions</div>
                    <h3 className="font-bold text-gray-900 mb-2">Readers</h3>
                    <p className="text-gray-700 text-sm">Trusted by readers across Malaysia</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}