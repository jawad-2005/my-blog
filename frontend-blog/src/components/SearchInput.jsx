import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, X, SearchX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import API_BASE from "@/lib/apiBase";

const SearchInput = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Search from server
  useEffect(() => {
    const searchPosts = async () => {
      if (query.trim().length > 0) {
        setLoading(true);
        setError("");
        try {
          const response = await axios.get(`${API_BASE}/posts/search`, {
            params: { q: query.trim() },
          });

          setResults(response.data.posts || []);
          setIsOpen(true);
        } catch (err) {
          console.error("Search failed", err);
          setError("Search server unavailable. Please check your backend.");
          setResults([]);
          setIsOpen(true);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setError("");
        setIsOpen(false);
      }
    };

    const debounce = setTimeout(() => {
      searchPosts();
    }, 500);

    return () => clearTimeout(debounce);
  }, [query]);

  const handleLinkClick = () => {
    setIsOpen(false);
    setQuery("");
    setDialogOpen(false);
  };

  const handleDialogOpenChange = (open) => {
    setDialogOpen(open);
    if (!open) {
      setQuery("");
      setResults([]);
      setIsOpen(false);
    }
  };

  const inputContent = (
    <div className='relative'>
      <Input
        type='text'
        placeholder='Search posts...'
        className='pl-4 pr-10 rounded-full bg-muted/50 border-none focus-visible:ring-1'
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className='absolute right-2 top-1/2 -translate-y-1/2'>
        {query.length > 0 ? (
          <Button
            variant='ghost'
            size='icon'
            className='h-6 w-6 rounded-full hover:bg-transparent'
            onClick={() => setQuery("")}
          >
            <X className='h-4 w-4 text-muted-foreground' />
          </Button>
        ) : (
          <Search className='h-4 w-4 text-muted-foreground' />
        )}
      </div>
    </div>
  );

  const resultsContent = (
    <div className='py-2'>
      {loading ? (
        <div className='p-6 text-center text-muted-foreground text-sm'>
          Searching...
        </div>
      ) : query.length === 0 ? (
        <div className='p-6 text-center text-muted-foreground text-sm'>
          Type to search posts.
        </div>
      ) : results.length > 0 ? (
        <>
          <p className='px-4 py-2 text-xs font-semibold text-muted-foreground uppercase'>
            Found {results.length} results
          </p>

          <div className='flex flex-col max-h-96 overflow-y-auto'>
            {results.map((post) => (
              <Link
                key={post._id || post.id}
                to={`/blog/${post._id || post.id}`}
                onClick={handleLinkClick}
                className='flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b last:border-0'
              >
                <div className='h-10 w-10 rounded-md overflow-hidden flex-shrink-0'>
                  <img
                    src={post.cover || post.image}
                    alt={post.title}
                    className='h-full w-full object-cover'
                  />
                </div>

                <div className='flex flex-col overflow-hidden'>
                  <span className='text-sm font-medium truncate text-foreground'>
                    {post.title}
                  </span>
                  <span className='text-xs text-muted-foreground'>
                    in {post.category}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : error ? (
        <div className='p-6 text-center'>
          <SearchX className='h-12 w-12 text-destructive mx-auto mb-3' />
          <p className='text-destructive text-sm font-medium mb-1'>
            Search error
          </p>
          <p className='text-muted-foreground text-xs'>{error}</p>
        </div>
      ) : (
        <div className='p-6 text-center'>
          <SearchX className='h-12 w-12 text-muted-foreground mx-auto mb-3' />
          <p className='text-muted-foreground text-sm font-medium mb-1'>
            No posts found
          </p>
          <p className='text-muted-foreground text-xs'>
            Try searching with different keywords
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className='relative flex items-center gap-2'>
    

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            className='h-10 w-10 rounded-full'
            type='button'
          >
            <Search className='h-5 w-5 text-foreground' />
            <span className='sr-only'>Open search</span>
          </Button>
        </DialogTrigger>
        <DialogContent className='sm:max-w-md max-w-full'>
          <DialogHeader>
            <DialogTitle>Search posts</DialogTitle>
          </DialogHeader>
          <div className='mt-4'>{inputContent}</div>
          <div className='mt-4'>{resultsContent}</div>
        </DialogContent>
      </Dialog>

      {isOpen && !dialogOpen && (
        <div className='absolute top-full mt-2 left-0 w-full bg-background border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200'>
          {resultsContent}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
