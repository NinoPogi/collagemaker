
const Footer = () => {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 py-12 px-6">
        <div className="flex justify-between max-w-6xl mx-auto">
          <div>
            <h4 className="text-2xl font-bold text-orange-400 mb-4" style={{ fontFamily: "'Righteous', cursive" }}>Collage Maker</h4>
            <p className="text-slate-400">Create stunning collages effortlessly.</p>
          </div>
          <div className="pt-8 text-center text-sm text-slate-500">
            <p>&copy; 2026 Collage Maker. All rights reserved.</p>
          </div>
        </div>
      </footer>
  )
}

export default Footer