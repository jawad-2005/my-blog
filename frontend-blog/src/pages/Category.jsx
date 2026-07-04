import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import PostCard from "@/components/PostCard";
import { ArrowLeft, Tag, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import API_BASE from "@/lib/apiBase";
import {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const Category = () => {
  const { name } = useParams();
  const [categoryPosts, setCategoryPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchCategoryPosts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE}/posts/category/${name}?page=${page}&limit=9`,
        );
        setCategoryPosts(response.data.posts || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        console.error("Failed to fetch category posts", error);
        setCategoryPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryPosts();
  }, [name, page]);

  if (loading) {
    return (
      <div className='container max-w-6xl py-12 md:py-20 mx-auto'>
        <div className='text-center py-20'>
          <div className='text-muted-foreground'>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className='container max-w-6xl py-12 md:py-20 mx-auto'>
      <div className='mb-12 text-center space-y-4'>
        <div className='flex justify-center mb-4'>
          <div className='p-3 bg-primary/10 rounded-full text-primary'>
            <Tag className='h-8 w-8' />
          </div>
        </div>
        <h1 className='text-4xl font-extrabold capitalize'>{name} Articles</h1>
        <p className='text-muted-foreground text-lg'>
          Browse all our thoughts and tutorials about {name}.
        </p>
      </div>

      {categoryPosts.length > 0 ? (
        <>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {categoryPosts.map((post) => (
              <PostCard key={post._id || post.id} post={post} />
            ))}
          </div>

          <div className='mt-8'>
            <Pagination>
              <PaginationContent>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                />

                {totalPages <= 7 ? (
                  Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationLink
                      key={i + 1}
                      isActive={page === i + 1}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  ))
                ) : (
                  <>
                    <PaginationLink
                      isActive={page === 1}
                      onClick={() => setPage(1)}
                    >
                      1
                    </PaginationLink>
                    {page > 3 && <PaginationEllipsis />}
                    {page > 2 && (
                      <PaginationLink onClick={() => setPage(page - 1)}>
                        {page - 1}
                      </PaginationLink>
                    )}
                    <PaginationLink isActive>{page}</PaginationLink>
                    {page < totalPages - 1 && (
                      <PaginationLink onClick={() => setPage(page + 1)}>
                        {page + 1}
                      </PaginationLink>
                    )}
                    {page < totalPages - 2 && <PaginationEllipsis />}
                    <PaginationLink onClick={() => setPage(totalPages)}>
                      {totalPages}
                    </PaginationLink>
                  </>
                )}

                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                />
              </PaginationContent>
            </Pagination>
          </div>
        </>
      ) : (
        <div className='text-center py-20 bg-muted/30 rounded-lg border border-dashed'>
          <Inbox className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
          <h2 className='text-xl font-semibold mb-2'>
            No posts in this category yet
          </h2>
          <p className='text-muted-foreground mb-6'>
            We haven't written about "{name}" yet. Check back soon!
          </p>
          <Button asChild>
            <Link to='/'>
              <ArrowLeft className='mr-2 h-4 w-4' /> Back to Home
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Category;
