import { Button } from "@/components/ui/button";


export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      {/* Header */}

      {/* Hero CTA Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 bg-clip-text text-transparent animate-fade-in" style={{ fontFamily: "'Fredoka', sans-serif" }}>
            Create Stunning Collages in Seconds
          </h2>
          <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Transform your memories into beautiful photo collages with our intuitive drag-and-drop interface. No design skills needed – just upload, arrange, and share!
          </p>
          <button className="group px-10 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-lg font-bold rounded-full hover:shadow-2xl hover:scale-110 transition-all duration-300 animate-bounce-subtle" style={{ animationDelay: '0.4s' }}>
            <span className="flex items-center gap-2">
              Start Now
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 px-6 bg-white/50 dark:bg-slate-800/50">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-4xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent" style={{ fontFamily: "'Fredoka', sans-serif" }}>
            See It In Action
          </h3>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-slate-100 to-orange-100 dark:from-slate-700 dark:to-slate-800 rounded-3xl p-12 min-h-[400px] flex items-center justify-center border-2 border-orange-300 dark:border-orange-600 shadow-xl">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center animate-pulse">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-2xl font-semibold text-slate-600 dark:text-slate-300">Interactive Demo Coming Soon</p>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Experience the magic of collage creation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent" style={{ fontFamily: "'Fredoka', sans-serif" }}>
            Why Choose Collage Maker?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "⚡", title: "Lightning Fast", desc: "Create collages in seconds with our optimized interface" },
              { icon: "🎨", title: "Easy to Use", desc: "Drag, drop, and arrange – no design experience needed" },
              { icon: "📱", title: "Works Anywhere", desc: "Access your collages from any device, anytime" },
              { icon: "🎯", title: "Smart Layouts", desc: "AI-powered templates that look professionally designed" },
              { icon: "🔒", title: "Secure & Private", desc: "Your photos are encrypted and never shared" },
              { icon: "✨", title: "Export Quality", desc: "Download in high resolution for printing or sharing" }
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className="group p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-orange-200 dark:border-slate-700"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                <h4 className="text-2xl font-bold mb-3 text-slate-800 dark:text-white">{feature.title}</h4>
                <p className="text-slate-600 dark:text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl md:text-6xl font-black text-white mb-6" style={{ fontFamily: "'Fredoka', sans-serif" }}>
            Ready to Create Something Amazing?
          </h3>
          <p className="text-xl text-orange-100 mb-10 leading-relaxed">
            Join thousands of users who are already creating beautiful collages every day. Start your creative journey now!
          </p>
          <button className="px-12 py-5 bg-white text-orange-600 text-xl font-bold rounded-full hover:shadow-2xl hover:scale-110 transition-all duration-300">
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-2xl font-bold text-orange-400 mb-4" style={{ fontFamily: "'Righteous', cursive" }}>Collage Maker</h4>
              <p className="text-slate-400">Create stunning collages effortlessly.</p>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-3">Product</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-orange-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Templates</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-3">Support</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-orange-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-3">Legal</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            <p>&copy; 2026 Collage Maker. All rights reserved.</p>
          </div>
        </div>
      </footer>
</div>
  );
}
