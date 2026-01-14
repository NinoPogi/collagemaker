import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import Link from "next/link"

const Header = () => {

  return (
    // <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b z-50">
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-3xl md:text-4xl font-black bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 bg-clip-text text-transparent">Collage Maker</Link>
        

          <section className="flex items-center gap-4">
            <SignedOut>
                <SignInButton>
                  <button           className="px-6 py-2 bg-orange-500 text-white rounded-full">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button           className="px-6 py-2 bg-orange-500 text-white rounded-full">
                    Sign Up
                  </button>
                </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </section>

      </div>
    </header>
  )
}

export default Header
