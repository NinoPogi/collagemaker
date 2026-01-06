
const Features = () => {
  return (
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
  )
}

export default Features