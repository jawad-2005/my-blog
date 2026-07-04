import { Link } from "react-router-dom";
import {
  Mountain,
  Twitter,
  Github,
  Linkedin,
  Instagram,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className='border-t bg-muted/20 text-foreground'>
      <div className='container px-4 py-12 mx-auto md:px-6 lg:px-8'>
        <div className='grid gap-8 lg:grid-cols-4'>
          {/* --- Column 1: Brand & Socials --- */}
          <div className='space-y-4'>
            <Link to='/' className='flex items-center gap-2'>
              <Mountain className='h-6 w-6' />
              <span className='text-xl font-bold'>MyBlog</span>
            </Link>
            <p className='text-sm text-muted-foreground max-w-xs'>
              Explaining code, lifestyle, and tech in the simplest way possible.
              Join our community of curious minds.
            </p>
            <div className='flex gap-4'>
              <Link
                to='#'
                className='text-muted-foreground hover:text-primary transition-colors'
              >
                <Twitter className='h-5 w-5' />
                <span className='sr-only'>Twitter</span>
              </Link>
              <Link
                to='#'
                className='text-muted-foreground hover:text-primary transition-colors'
              >
                <Github className='h-5 w-5' />
                <span className='sr-only'>GitHub</span>
              </Link>
              <Link
                to='#'
                className='text-muted-foreground hover:text-primary transition-colors'
              >
                <Linkedin className='h-5 w-5' />
                <span className='sr-only'>LinkedIn</span>
              </Link>
              <Link
                to='#'
                className='text-muted-foreground hover:text-primary transition-colors'
              >
                <Instagram className='h-5 w-5' />
                <span className='sr-only'>Instagram</span>
              </Link>
            </div>
          </div>

          {/* --- Column 2: Quick Links --- */}
          <div className='space-y-4'>
            <h3 className='font-semibold text-lg'>Quick Links</h3>
            <ul className='space-y-2 text-sm'>
              <li>
                <Link
                  to='/'
                  className='text-muted-foreground hover:text-foreground transition-colors'
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to='/about'
                  className='text-muted-foreground hover:text-foreground transition-colors'
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to='/contact'
                  className='text-muted-foreground hover:text-foreground transition-colors'
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to='/become-author'
                  className='text-muted-foreground hover:text-foreground'
                >
                  Become an Author
                </Link>
              </li>
            </ul>
          </div>

          {/* --- Column 3: Categories --- */}
          <div className='space-y-4'>
            <h3 className='font-semibold text-lg'>Categories</h3>
            <ul className='space-y-2 text-sm'>
              <li>
                <Link
                  to='/category/tech'
                  className='text-muted-foreground hover:text-foreground transition-colors'
                >
                  Technology
                </Link>
              </li>
              <li>
                <Link
                  to='/category/lifestyle'
                  className='text-muted-foreground hover:text-foreground transition-colors'
                >
                  Lifestyle
                </Link>
              </li>
              <li>
                <Link
                  to='/category/coding'
                  className='text-muted-foreground hover:text-foreground transition-colors'
                >
                  Coding Tutorials
                </Link>
              </li>
              <li>
                <Link
                  to='/category/gadgets'
                  className='text-muted-foreground hover:text-foreground transition-colors'
                >
                  Gadgets
                </Link>
              </li>
            </ul>
          </div>

          {/* --- Column 4: Newsletter --- */}
          <div className='space-y-4'>
            <h3 className='font-semibold text-lg'>Subscribe</h3>
            <p className='text-sm text-muted-foreground'>
              Get the latest posts delivered right to your inbox. No spam.
            </p>
            <div className='flex flex-col gap-2'>
              <div className='flex gap-2'>
                <Input
                  type='email'
                  placeholder='Enter your email'
                  className='bg-background'
                />
                <Button size='icon'>
                  <Send className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* --- Bottom Section: Copyright --- */}
        <div className='border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground'>
          <p>© {new Date().getFullYear()} MyBlog. All rights reserved.</p>
          <div className='flex gap-6'>
            <Link
              to='/privacy'
              className='hover:text-foreground transition-colors'
            >
              Privacy Policy
            </Link>
            <Link
              to='/terms'
              className='hover:text-foreground transition-colors'
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
