import { Link } from "react-router-dom";
import { Menu, Mountain, Search } from "lucide-react";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ModeToggle } from "./mode-toggle";
import SearchInput from "./SearchInput";
import UserMenu from "./UserMenu";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  // Define your navigation links here for easy management
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Authors", path: "/authors" },
    { name: "Technology", path: "/category/technology" },
    { name: "AI", path: "/category/ai" },
    { name: "Education", path: "/category/education" },
    { name: "Programming", path: "/category/programming" },
    { name: "About", path: "/about" },
  ];

  return (
    <header
      className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur 
    px-4  mx-auto md:px-6 lg:px-8'
    >
      <div className=' flex h-16 items-center justify-between'>
        {/* --- LOGO --- */}
        <div className='flex items-center gap-2'>
          <Link to='/' className='flex items-center gap-2'>
            <Mountain className='h-6 w-6' />
            <span className='text-lg font-bold'>MyBlog</span>
          </Link>
        </div>

        {/* --- DESKTOP NAVIGATION (Hidden on mobile) --- */}
        <nav className='hidden md:flex items-center gap-6 text-sm font-medium '>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className='hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-xl'
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* --- ACTION BUTTONS (Search/Login) --- */}

        <SearchInput />

        <div className=' flex items-center gap-4'>
          <ModeToggle />
          <NotificationBell />
          <UserMenu />
        </div>

        {/* --- MOBILE MENU (Visible only on mobile) --- */}
        <div className='md:hidden'>
          <Sheet>
            {/* The Toggle Button (Hamburger) */}
            <SheetTrigger asChild>
              <Button variant='ghost' size='icon'>
                <Menu className='h-6 w-6' />
                <span className='sr-only'>Toggle navigation menu</span>
              </Button>
            </SheetTrigger>

            {/* The Slide-out Menu Content */}
            <SheetContent side='right'>
              <SheetHeader>
                <SheetTitle className='text-left'>Menu</SheetTitle>
              </SheetHeader>

              <div className='grid gap-4 px-4 py-4 '>
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className='text-lg font-medium hover:underline'
                  >
                    {/* Note: In a real app, you usually want to close the Sheet 
                        when a link is clicked. You can do this by controlling 
                        the 'open' state of the Sheet. */}
                    {link.name}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
