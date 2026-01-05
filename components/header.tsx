import React from 'react'

const Header = () => {
  return (
      <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-orange-200 dark:border-slate-700 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent" style={{ fontFamily: "'Righteous', cursive" }}>
            Collage Maker
          </h1>
          <button className="px-6 py-2.5 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 hover:from-orange-500 hover:to-orange-600">
            Login with Google
          </button>
        </div>
      </header>
  )
}

export default Header