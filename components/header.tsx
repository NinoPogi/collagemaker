import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"

const Header = () => {

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Collage Maker</h1>

          <SignedOut>
              <SignInButton />
              <SignUpButton>
                <button           className="px-6 py-2 bg-orange-500 text-white rounded-full">
                  Sign Up
                </button>
              </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>

      </div>
    </header>
  )
}

export default Header
