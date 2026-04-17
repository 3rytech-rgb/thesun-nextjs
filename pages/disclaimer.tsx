import Layout from '../components/layout/Layout';

export default function Disclaimer() {
  return (
    <Layout 
      title="Disclaimer | The Sun Malaysia"
      description="Disclaimer for The Sun Malaysia website"
    >
      <main className="bg-gray-50 min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Disclaimer</h1>
            
            <div className="prose prose-lg max-w-none mb-12">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-6 mb-10 rounded-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Important Notice</h2>
                <p className="text-gray-700 leading-relaxed">
                  The information contained in this website is for general information purposes only.
                  The information is provided by The Sun Malaysia and while we endeavour to keep the
                  information up to date and correct, we make no representations or warranties of any
                  kind, express or implied, about the completeness, accuracy, reliability, suitability
                  or availability with respect to the website or the information, products, services,
                  or related graphics contained on the website for any purpose.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">User Responsibility</h3>
                  </div>
                  <p className="text-gray-700">
                    Any reliance you place on such information is therefore strictly at your own risk.
                    In no event will we be liable for any loss or damage including without limitation,
                    indirect or consequential loss or damage, or any loss or damage whatsoever arising
                    from loss of data or profits arising out of, or in connection with, the use of this website.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">External Links</h3>
                  </div>
                  <p className="text-gray-700">
                    Through this website you are able to link to other websites which are not under the control of The Sun Malaysia.
                    We have no control over the nature, content and availability of those sites. The inclusion of any links does not
                    necessarily imply a recommendation or endorse the views expressed within them.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-slate-50 to-gray-100 border border-gray-200 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Disclaimers</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Accuracy of Information</h3>
                      <p className="text-gray-700">
                        Every effort is made to keep the website up and running smoothly. However, The Sun Malaysia takes no responsibility for,
                        and will not be liable for, the website being temporarily unavailable due to technical issues beyond our control.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Copyright Notice</h3>
                      <p className="text-gray-700">
                        This website and its content is copyright of The Sun Malaysia. Any redistribution or reproduction of part or all of the contents
                        in any form is prohibited other than for personal, non-commercial use.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Privacy & Data Protection</h3>
                      <p className="text-gray-700">
                        Your use of this website is subject to our Privacy Policy. We are committed to protecting your privacy and personal data
                        in accordance with applicable data protection laws.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 p-6 bg-gradient-to-r from-gray-900 to-black text-white rounded-xl">
                <div className="flex items-center mb-4">
                  <svg className="w-6 h-6 text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <h3 className="text-lg font-bold">Important Reminder</h3>
                </div>
                <p className="text-gray-200">
                  This disclaimer is subject to change without notice and was last updated on April 17, 2025.
                  If you have any questions about this disclaimer, please contact us through our contact page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
