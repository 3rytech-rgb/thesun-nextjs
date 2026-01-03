export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white border-t border-slate-700">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo Section */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-lg inline-block mb-4">
              THE SUN
            </h2>
            <p className="text-blue-200 mb-4">
              Leading news source in Malaysia bringing you the latest updates in news, sports, entertainment and more.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {['Home', 'News', 'Sports', 'Opinion', 'Contact'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-blue-200 hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              {['Politics', 'Sports', 'Entertainment', 'Technology', 'Business'].map((category) => (
                <li key={category}>
                  <a href="#" className="text-blue-200 hover:text-white transition-colors">
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-slate-700 mt-8 pt-6 text-center text-blue-200">
          <p>&copy; 2025 The Sun Malaysia. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}