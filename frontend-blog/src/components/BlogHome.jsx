import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { Inbox } from "lucide-react";
import axios from "axios";
import API_BASE from "@/lib/apiBase";

const popularTags = [
  "technology",
  "react 19",
  "javascript",
  "chat gpt",
  "smartphone",
  "education",
  "AI",
];

function BlogCard({ post, large = false }) {
  const postId = post._id || post.id;

  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <Link
      to={`/blog/${postId}`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl bg-[#1a1a1a]
        transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl
        ${large ? "h-64 md:h-80" : "h-56"}`}
    >
      <img
        src={post.cover || post.image}
        alt={post.title}
        className='absolute inset-0 h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300'
      />
      <div className='absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent' />

      <div className='relative z-10 p-4'>
        <div className='flex items-center justify-between gap-2'>
          <Badge className='bg-white/90 text-black text-xs font-semibold hover:bg-white'>
            {post.category}
          </Badge>
          {formattedDate && (
            <span className='text-xs text-zinc-300'>{formattedDate}</span>
          )}
        </div>
      </div>

      <div className='relative z-10 mt-auto p-4 space-y-2'>
        <h3
          className={`font-bold text-white leading-snug ${large ? "text-xl" : "text-base"}`}
        >
          {post.title}
        </h3>

        {post.excerpt && (
          <p className='text-xs text-zinc-300 line-clamp-2'>{post.excerpt}</p>
        )}

        <div className='flex items-center gap-2 pt-1'>
          <Avatar className='h-7 w-7 ring-2 ring-white/30'>
            <AvatarImage
              src={typeof post.author === "object" ? post.author.avatar : ""}
              alt={
                typeof post.author === "object" ? post.author.name : post.author
              }
            />
            <AvatarFallback className='bg-zinc-700 text-white text-xs'>
              {typeof post.author === "object"
                ? post.author.name[0]
                : post.author?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <span className='text-sm text-zinc-300'>
            {typeof post.author === "object" ? post.author.name : post.author}
          </span>
        </div>
      </div>
    </Link>
  );
}

function SectionHeader({ title, category, onViewAll }) {
  return (
    <div className='flex items-center justify-between mb-4'>
      <h2 className='text-base font-semibold text-zinc-900 dark:text-white'>
        {title}
      </h2>
      {category && (
        <button
          onClick={onViewAll}
          className='text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors'
        >
          view all →
        </button>
      )}
    </div>
  );
}

function EmptySection({ category }) {
  return (
    <div className='flex flex-col items-center justify-center py-12 bg-muted/30 rounded-lg border border-dashed'>
      <Inbox className='h-12 w-12 text-muted-foreground mb-3' />
      <p className='text-sm text-muted-foreground'>
        No {category} blogs written yet
      </p>
    </div>
  );
}

export default function BlogHome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [aiPosts, setAiPosts] = useState([]);
  const [technologyPosts, setTechnologyPosts] = useState([]);
  const [programmingPosts, setProgrammingPosts] = useState([]);
  const [educationPosts, setEducationPosts] = useState([]);
  const [morePosts, setMorePosts] = useState([]);
  // const [allAuthors, setAllAuthors] = useState([]);
  const [prolificAuthors, setProlificAuthors] = useState([]);
  const [topArticles, setTopArticles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Use allSettled so one failure doesn't stop the whole page
        const results = await Promise.allSettled([
          axios.get(`${API_BASE}/posts/featured`), // [0]
          axios.get(`${API_BASE}/posts/category/AI?limit=3`), // [1]
          axios.get(`${API_BASE}/posts/category/Technology?limit=3`), // [2]
          axios.get(`${API_BASE}/posts/category/Programming?limit=3`), // [3]
          axios.get(`${API_BASE}/posts/category/Education?limit=3`), // [4]
          axios.get(`${API_BASE}/posts?limit=3&random=true`), // [5]
          axios.get(`${API_BASE}/authors`), // [6]
          axios.get(`${API_BASE}/authors/top/prolific`), // [7]
          axios.get(`${API_BASE}/posts/top/viewed`), // [8]
        ]);

        // Map the results back to your state safely
        if (results[0].status === "fulfilled")
          setFeaturedPost(
            results[0].value.data.data || results[0].value.data.post || null,
          );

        if (results[1].status === "fulfilled")
          setAiPosts(results[1].value.data.posts || []);

        if (results[2].status === "fulfilled")
          setTechnologyPosts(results[2].value.data.posts || []);

        if (results[3].status === "fulfilled")
          setProgrammingPosts(results[3].value.data.posts || []);

        if (results[4].status === "fulfilled")
          setEducationPosts(results[4].value.data.posts || []);

        if (results[5].status === "fulfilled")
          setMorePosts(results[5].value.data.posts || []);

        /*          if (results[6].status === "fulfilled")
           setAllAuthors(
             results[6].value.data.data || results[6].value.data || [],
           ); */

        if (results[7].status === "fulfilled")
          setProlificAuthors(results[7].value.data.data || []);

        if (results[8].status === "fulfilled")
          setTopArticles(results[8].value.data.data || []);
      } catch (error) {
        console.error("Critical fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center dark:bg-zinc-950'>
        <div className='text-muted-foreground'>Loading...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen dark:bg-zinc-950 text-zinc-900 dark:text-white'>
      {/* Featured Post Section */}
      <section className='w-full  px-4 p-8 mx-auto'>
        {featuredPost ? (
          <Link
            to={`/blog/${featuredPost._id || featuredPost.id}`}
            className='group relative w-full overflow-hidden rounded-3xl block'
            style={{ minHeight: 280 }}
          >
            <img
              src={featuredPost.cover || featuredPost.image}
              alt={featuredPost.title}
              className='absolute inset-0 w-full h-full object-cover brightness-75 group-hover:brightness-90 transition-all duration-500 rounded-2xl '
            />
            <div className='absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent' />
            <div
              className='relative z-10 flex flex-col justify-end h-full p-8 md:p-10'
              style={{ minHeight: 280 }}
            >
              <Badge className='w-fit mb-3 bg-white/90 text-black text-xs font-semibold'>
                {featuredPost.category}
              </Badge>
              <h1 className='text-2xl md:text-4xl font-extrabold text-white max-w-2xl leading-tight mb-3'>
                {featuredPost.title}
              </h1>
              <p className='text-zinc-300 text-sm md:text-base max-w-xl mb-4'>
                {featuredPost.excerpt}
              </p>
              <div className='flex items-center gap-2'>
                <Avatar className='h-8 w-8 ring-2 ring-white/40'>
                  <AvatarImage
                    src={
                      typeof featuredPost.author === "object"
                        ? featuredPost.author.avatar
                        : ""
                    }
                  />
                  <AvatarFallback className='bg-zinc-600 text-white text-xs'>
                    {typeof featuredPost.author === "object"
                      ? featuredPost.author.name[0]
                      : "U"}
                  </AvatarFallback>
                </Avatar>
                <span className='text-zinc-300 text-sm'>
                  {typeof featuredPost.author === "object"
                    ? featuredPost.author.name
                    : featuredPost.author}
                </span>
              </div>
            </div>
          </Link>
        ) : (
          <div className='flex flex-col items-center justify-center h-full bg-muted/30 rounded-3xl border border-dashed'>
            <Inbox className='h-16 w-16 text-muted-foreground mb-4' />
            <h2 className='text-xl font-semibold mb-2'>No featured post yet</h2>
            <p className='text-muted-foreground'>
              Check back soon for our featured content!
            </p>
          </div>
        )}
      </section>

      {/* Main content + Sidebar */}
      <div className='mx-auto px-4 pb-16 flex flex-col lg:flex-row gap-8'>
        <main className='flex-1 min-w-0 space-y-10'>
          {/* AI Section */}
          <section>
            <SectionHeader
              title='Latest blogs · AI'
              category='AI'
              onViewAll={() => navigate("/category/AI")}
            />
            {aiPosts.length > 0 ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
                {aiPosts.map((post) => (
                  <BlogCard key={post._id || post.id} post={post} />
                ))}
              </div>
            ) : (
              <EmptySection category='AI' />
            )}
          </section>

          {/* Technology Section */}
          <section>
            <SectionHeader
              title='Latest blogs · Technology'
              category='Technology'
              onViewAll={() => navigate("/category/Technology")}
            />
            {technologyPosts.length > 0 ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
                {technologyPosts.map((post) => (
                  <BlogCard key={post._id || post.id} post={post} />
                ))}
              </div>
            ) : (
              <EmptySection category='Technology' />
            )}
          </section>

          {/* Education Section */}
          <section>
            <SectionHeader
              title='Latest blogs · Education'
              category='Education'
              onViewAll={() => navigate("/category/Education")}
            />
            {educationPosts.length > 0 ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
                {educationPosts.map((post) => (
                  <BlogCard key={post._id || post.id} post={post} />
                ))}
              </div>
            ) : (
              <EmptySection category='Education' />
            )}
          </section>

          {/* Programming Section */}
          <section>
            <SectionHeader
              title='Latest blogs · Programming'
              category='Programming'
              onViewAll={() => navigate("/category/Programming")}
            />
            {programmingPosts.length > 0 ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
                {programmingPosts.map((post) => (
                  <BlogCard key={post._id || post.id} post={post} />
                ))}
              </div>
            ) : (
              <EmptySection category='Programming' />
            )}
          </section>

          {/* More Section */}
          <section>
            <SectionHeader
              title='More articles'
              onViewAll={() => navigate("/all-blogs")}
            />
            {morePosts.length > 0 ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
                {morePosts.map((post) => (
                  <BlogCard key={post._id || post.id} post={post} />
                ))}
              </div>
            ) : (
              <EmptySection category='blog' />
            )}
          </section>
        </main>

        {/* Sidebar -------------------------------------------------------------------*/}

        <aside className='w-full lg:w-64 shrink-0 space-y-8 bg-zinc-50 p-5 rounded-lg dark:bg-zinc-800 lg:sticky lg:top-20 lg:self-start h-fit'>
          {/* Popular Tags */}
          <div>
            <h3 className='text-sm font-semibold text-zinc-900 dark:text-white mb-3 border-b border-zinc-200 dark:border-zinc-800 pb-2'>
              Popular Tags
            </h3>
            <div className='flex flex-wrap gap-2'>
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => navigate(`/category/${tag.toLowerCase()}`)}
                  className='text-xs px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700
                    text-zinc-600 dark:text-zinc-400 hover:bg-zinc-900 hover:text-white
                    dark:hover:bg-white dark:hover:text-zinc-900 transition-colors'
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Famous Authors Section */}
          <div>
            <h3 className='text-sm font-semibold text-zinc-900 dark:text-white mb-3 border-b border-zinc-200 dark:border-zinc-800 pb-2'>
              🌟 Famous Authors
            </h3>
            {prolificAuthors.length > 0 ? (
              <ul className='space-y-3'>
                {prolificAuthors.map((author, index) => (
                  <li key={author._id}>
                    <Link
                      to={`/author/${author._id}`}
                      className='flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 p-2 rounded-lg transition-colors group'
                    >
                      <span className='text-xs font-bold text-blue-600 dark:text-blue-400 w-5'>
                        #{index + 1}
                      </span>
                      <Avatar className='h-7 w-7'>
                        <AvatarImage src={author.avatar} alt={author.name} />
                        <AvatarFallback className='bg-linear-to-br from-blue-400 to-blue-600 text-white text-xs'>
                          {author.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className='min-w-0 flex-1'>
                        <p className='text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate group-hover:text-zinc-900 dark:group-hover:text-white'>
                          {author.name}
                        </p>
                        <p className='text-xs text-zinc-500 dark:text-zinc-400'>
                          {author.postCount}{" "}
                          {author.postCount === 1 ? "article" : "articles"}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className='text-xs text-muted-foreground'>
                No famous authors yet
              </p>
            )}
          </div>

          {/* Famous Articles Section */}
          <div>
            <h3 className='text-sm font-semibold text-zinc-900 dark:text-white mb-3 border-b border-zinc-200 dark:border-zinc-800 pb-2'>
              🔥 Famous Articles
            </h3>
            {topArticles.length > 0 ? (
              <ul className='space-y-3'>
                {topArticles.map((article, index) => (
                  <li key={article._id}>
                    <Link to={`/blog/${article._id}`} className='block group'>
                      <div className='flex items-start gap-2 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors'>
                        <span className='text-xs font-bold text-orange-600 dark:text-orange-400 mt-0.5 w-5'>
                          #{index + 1}
                        </span>
                        <div className='min-w-0 flex-1'>
                          <p className='text-xs font-medium text-zinc-700 dark:text-zinc-300 line-clamp-2 group-hover:text-zinc-900 dark:group-hover:text-white'>
                            {article.title}
                          </p>
                          <div className='flex items-center gap-1 mt-1'>
                            <span className='inline-flex items-center gap-0.5 text-xs text-zinc-500 dark:text-zinc-400'>
                              👁️ {article.views || 0} views
                            </span>
                          </div>
                          {article.author && (
                            <p className='text-xs text-zinc-500 dark:text-zinc-400 mt-1'>
                              By{" "}
                              <span className='font-medium'>
                                {article.author.name}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className='text-xs text-muted-foreground'>
                No articles with views yet
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
