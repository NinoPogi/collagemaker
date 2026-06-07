import { Skeleton } from "@/components/ui/skeleton";
import { SignedIn, UserButton, useUser } from "@clerk/nextjs";
import { ChevronLeft, Save, Download, LoaderCircle, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRef, useEffect } from "react";

interface EditorHeaderProps {
  title: string;
  setTitle: (title: string) => void;
  handleSave: () => void;
  handleUpdateName: () => Promise<void>;
  handleDownload: () => void;
  isSaving: boolean;
}

export default function EditorHeader({
  title,
  setTitle,
  handleSave,
  handleUpdateName,
  handleDownload,
  isSaving,
}: EditorHeaderProps) {
  const { isLoaded } = useUser();
  const isInitialRender = useRef(true);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
  
  const timer = setTimeout(() => {
    handleUpdateName();
  }, 800);

  return () => clearTimeout(timer);
  },[title, handleUpdateName]); 

  return (
    <div className="grid grid-cols-2 items-center py-2 px-1 ">
      {/* Left side */}
      <div className="flex items-center gap-2 min-w-0">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link href="/">
            <ChevronLeft />
          </Link>
        </Button>
        <Input
          variant="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Right side */}
      <div className="flex justify-end items-center gap-2 md:gap-4">
        <Button variant="ghost" size="icon" className="size-5" disabled>
          <Undo2 />
        </Button>
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white border-none"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <LoaderCircle className="animate-spin size-4 lg:mr-2" />
          ) : (
            <Save className="size-4 lg:mr-2" />
          )}
          <span className="hidden lg:inline">
            {isSaving ? "Saving..." : "Save"}
          </span>
        </Button>

        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white border-none"
          onClick={handleDownload}
        >
          <Download className="size-4 lg:mr-2" />
          <span className="hidden lg:inline">Export</span>
        </Button>

        <div className="flex items-center justify-center">
          {!isLoaded ? (
            <Skeleton className="h-8 w-8 rounded-full bg-slate-200" />
          ) : (
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-8 w-8",
                  },
                }}
              />
            </SignedIn>
          )}
        </div>
      </div>
    </div>
  );
}
