import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Loader, PenTool } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

import API_BASE from "@/lib/apiBase";

const PAGE_SIZE = 9;

const Authors = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE}/authors?page=${page}&limit=${PAGE_SIZE}`,
        );

        if (response.data.success) {
          setAuthors(response.data.data);
          setTotalPages(response.data.meta?.totalPages || 1);
        } else {
          throw new Error(response.data.message || "Failed to fetch authors");
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load authors",
        );
        console.error("Error fetching authors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthors();
  }, [page]);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='flex flex-col items-center gap-3'>
          <Loader className='h-8 w-8 animate-spin text-primary' />
          <p className='text-muted-foreground'>Loading authors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center space-y-3'>
          <h2 className='text-2xl font-bold text-foreground'>Error</h2>
          <p className='text-muted-foreground'>{error}</p>
        </div>
      </div>
    );
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className='py-12 md:py-20'>
      {/* Header */}
      <div className='mb-12 text-center'>
        <h1 className='text-4xl font-bold text-foreground mb-4'>
          Meet Our Authors
        </h1>
        <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
          Discover talented writers and creators sharing their insights,
          stories, and expertise with our community.
        </p>
      </div>

      {authors.length === 0 ? (
        <div className='text-center py-12'>
          <PenTool className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
          <p className='text-lg text-muted-foreground'>No authors found yet.</p>
        </div>
      ) : (
        <>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {authors.map((author) => (
              <div
                key={author._id}
                className='p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow'
              >
                {/* Author Avatar */}
                <div className='flex justify-center mb-4'>
                  <Avatar className='h-24 w-24 border-4 border-background'>
                    <AvatarImage
                      src={
                        author.avatar?.startsWith("http")
                          ? author.avatar
                          : author.avatar
                            ? `${API_BASE.replace("/api", "")}/${author.avatar}`
                            : undefined
                      }
                      alt={author.name}
                    />
                    <AvatarFallback>{getInitials(author.name)}</AvatarFallback>
                  </Avatar>
                </div>

                {/* Author Info */}
                <div className='text-center mb-4 space-y-2'>
                  <h3 className='text-xl font-bold text-foreground'>
                    {author.name}
                  </h3>
                  <p className='text-sm text-muted-foreground line-clamp-2'>
                    {author.bio || "Passionate writer and creator"}
                  </p>

                  {/* Stats */}
                  <div className='flex justify-center items-center gap-4 text-sm pt-2'>
                    <div className='text-center'>
                      <p className='font-bold text-foreground'>
                        {author.postCount || 0}
                      </p>
                      <p className='text-xs text-muted-foreground'>Articles</p>
                    </div>
                    <div className='border-l border-border' />
                    <div className='text-center'>
                      <p className='font-bold text-foreground'>
                        {author.followersCount || 0}
                      </p>
                      <p className='text-xs text-muted-foreground'>Followers</p>
                    </div>
                  </div>
                </div>

                {/* View Profile Button */}
                <Link to={`/author/${author._id}`} className='w-full'>
                  <Button className='w-full'>View Profile</Button>
                </Link>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className='mt-10'>
              <Pagination>
                <PaginationContent>
                  <PaginationPrevious
                    onClick={() => handlePageChange(page - 1)}
                    className='mr-2 hover:cursor-pointer'
                  />

                  {totalPages <= 7 ? (
                    Array.from({ length: totalPages }).map((_, index) => (
                      <PaginationLink
                        key={index + 1}
                        isActive={page === index + 1}
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </PaginationLink>
                    ))
                  ) : (
                    <>
                      <PaginationLink
                        isActive={page === 1}
                        onClick={() => handlePageChange(1)}
                      >
                        1
                      </PaginationLink>

                      {page > 3 && <PaginationEllipsis />}

                      {page > 2 && (
                        <PaginationLink
                          onClick={() => handlePageChange(page - 1)}
                        >
                          {page - 1}
                        </PaginationLink>
                      )}

                      <PaginationLink isActive>{page}</PaginationLink>

                      {page < totalPages - 1 && (
                        <PaginationLink
                          onClick={() => handlePageChange(page + 1)}
                        >
                          {page + 1}
                        </PaginationLink>
                      )}

                      {page < totalPages - 2 && <PaginationEllipsis />}

                      <PaginationLink
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </PaginationLink>
                    </>
                  )}

                  <PaginationNext
                    onClick={() => handlePageChange(page + 1)}
                    className='ml-2 hover:cursor-pointer'
                  />
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Authors;
