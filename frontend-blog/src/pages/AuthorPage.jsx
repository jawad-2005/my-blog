import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
import {
  Heart,
  Bookmark,
  ThumbsUp,
  Users,
  Calendar,
  FileText,
  UserCheck,
  UserPlus,
  Loader2,
} from "lucide-react";
import { addFollowing, removeFollowing } from "@/store/userSlice";
import { showToast } from "@/store/uiSlice";

const AuthorPage = () => {
  const { authorId } = useParams();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.user);

  // ── Store the FULL api response data here ────────────────────────────────
  const [pageData, setPageData] = useState(null);
  const [authorLoading, setAuthorLoading] = useState(true);
  const [authorError, setAuthorError] = useState(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [articles, setArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  // ── Fetch Author Profile ─────────────────────────────────────────────────
  const fetchAuthorProfile = useCallback(async () => {
    if (!authorId) return;
    setAuthorLoading(true);
    setAuthorError(null);

    try {
      const res = await fetch(`/api/authors/${authorId}`, {
        credentials: "include",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || `HTTP ${res.status}`);
      }

      if (!json.success || !json.data) {
        throw new Error("Unexpected response shape: " + JSON.stringify(json));
      }

      // ── Store everything from data directly ──
      setPageData(json.data);
    } catch (error) {
      setAuthorError(error.message);
      dispatch(
        showToast({
          severity: "error",
          summary: "Profile error",
          detail: error.message || "Could not load author profile.",
        }),
      );
    } finally {
      setAuthorLoading(false);
    }
  }, [authorId]);

  // ── Fetch Articles ───────────────────────────────────────────────────────
  const fetchArticles = useCallback(
    async (pageNum) => {
      if (!authorId) return;
      setArticlesLoading(true);
      try {
        const res = await fetch(
          `/api/posts?author=${authorId}&page=${pageNum}&limit=9`,
          { credentials: "include" },
        );
        const data = await res.json();
        if (data.success) {
          setArticles(data.posts || []);
          setTotalPages(data.totalPages || 1);
        }
      } catch (error) {
        dispatch(
          showToast({
            severity: "error",
            summary: "Articles error",
            detail: "Could not load articles for this author.",
          }),
        );
      } finally {
        setArticlesLoading(false);
      }
    },
    [authorId],
  );

  useEffect(() => {
    fetchAuthorProfile();
    fetchArticles(1);
  }, [fetchAuthorProfile, fetchArticles]);

  // ── Derive values directly from pageData ─────────────────────────────────
  const author = pageData?.author ?? null;
  const stats = pageData?.stats ?? null;

  // ✅ isOwnProfile comes directly from server - no local state needed
  const isOwnProfile = pageData?.isOwnProfile ?? false;

  // ✅ isFollowing: server value OR check Redux (whichever is fresher)
  const serverIsFollowing = pageData?.isFollowing ?? false;
  const reduxIsFollowing = userInfo?.following?.includes(authorId) ?? false;
  // After a follow action, Redux will be updated - use it as source of truth
  const isFollowing = userInfo ? reduxIsFollowing : serverIsFollowing;

  // ── Follow / Unfollow ────────────────────────────────────────────────────
  const handleToggleFollow = async () => {
    if (!userInfo) {
      dispatch(
        showToast({
          severity: "warning",
          summary: "Follow failed",
          detail: "Please log in to follow this author.",
        }),
      );

      return;
    }

    setFollowLoading(true);
    try {
      const res = await fetch(`/api/authors/follow/${authorId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (data.success) {
        // Update Redux
        if (data.isFollowing) {
          dispatch(addFollowing(authorId));
        } else {
          dispatch(removeFollowing(authorId));
        }

        // Update the stats follower count inside pageData
        setPageData((prev) =>
          prev
            ? {
                ...prev,
                isFollowing: data.isFollowing,
                stats: {
                  ...prev.stats,
                  followersCount: data.followersCount,
                },
              }
            : prev,
        );

        dispatch(
          showToast({
            severity: "success",
            summary: data.isFollowing ? "Following" : "Unfollowed",
            detail: data.isFollowing
              ? "You are now following this author."
              : "You unfollowed this author.",
          }),
        );
      } else {
        dispatch(
          showToast({
            severity: "error",
            summary: "Follow failed",
            detail: data.message || "Something went wrong.",
          }),
        );
      }
    } catch (error) {
      dispatch(
        showToast({
          severity: "error",
          summary: "Follow failed",
          detail: "Network error. Please try again.",
        }),
      );
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePageChange = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    setPage(pageNum);
    fetchArticles(pageNum);
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (authorLoading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <Loader2 className='w-10 h-10 animate-spin text-muted-foreground' />
          <p className='text-muted-foreground text-sm'>Loading author...</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (authorError || !author) {
    return (
      <div className='min-h-screen bg-background flex flex-col items-center justify-center gap-3 px-4'>
        <p className='text-muted-foreground text-lg'>
          {authorError || "Author not found."}
        </p>
        {/* DEV: show raw error */}
        <pre className='text-xs text-red-400 bg-muted p-4 rounded-lg max-w-lg overflow-auto'>
          {authorError}
        </pre>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background text-foreground pb-20'>
      {/* ── 1. Cover ── */}
      <div className='relative h-64 w-full px-4 md:px-8 pt-4'>
        <img
          src={
            author.coverPhoto ||
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=2000"
          }
          alt='Cover'
          className='h-full w-full object-cover rounded-3xl border shadow-sm'
        />
        <div className='absolute -bottom-16 left-1/2 -translate-x-1/2'>
          <Avatar className='h-32 w-32 border-4 border-background shadow-md'>
            <AvatarImage src={author.avatar} />
            <AvatarFallback className='text-3xl bg-muted text-muted-foreground'>
              {author.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* ── 2. Author Info ── */}
      <div className='mt-20 text-center px-4 max-w-2xl mx-auto'>
        <h1 className='text-3xl font-bold tracking-tight'>{author.name}</h1>
        <p className='text-muted-foreground mt-1'>{author.email}</p>
        {author.bio && (
          <p className='mt-4 text-muted-foreground leading-relaxed'>
            {author.bio}
          </p>
        )}


        {!isOwnProfile && (
          <div className='mt-6 flex justify-center'>
            <FollowButton
              isFollowing={isFollowing}
              loading={followLoading}
              onClick={handleToggleFollow}
            />
          </div>
        )}

        {/* Temporary DEV indicator - remove in production */}
        <div className='mt-2 text-[10px] text-muted-foreground font-mono'>
          isOwnProfile: {String(isOwnProfile)} | isFollowing:{" "}
          {String(isFollowing)} | buttonShows: {String(!isOwnProfile)}
        </div>
      </div>

      {/* ── 3. Stats ── */}
      <div className='max-w-5xl mx-auto mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 px-4 border-y py-8 border-border'>
        <StatItem
          icon={<ThumbsUp className='w-5 h-5' />}
          value={(stats?.totalLikes ?? 0).toLocaleString()}
          label='Likes'
        />
        <StatItem
          icon={<Users className='w-5 h-5' />}
          value={(stats?.followersCount ?? 0).toLocaleString()}
          label='Followers'
        />
        <StatItem
          icon={<Calendar className='w-5 h-5' />}
          value={
            author.joinDate
              ? new Date(author.joinDate).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })
              : "N/A"
          }
          label='Joined'
        />
        <StatItem
          icon={<FileText className='w-5 h-5' />}
          value={stats?.articlesCount ?? 0}
          label='Articles'
        />
      </div>

      {/* ── 4. Articles ── */}
      <div className='max-w-7xl mx-auto mt-16 px-4'>
        <h2 className='text-xl font-semibold mb-8 opacity-80 uppercase tracking-widest'>
          Latest Articles
        </h2>

        {articles.length === 0 && !articlesLoading ? (
          <div className='text-center py-20 text-muted-foreground'>
            <FileText className='w-12 h-12 mx-auto mb-4 opacity-30' />
            <p>No articles published yet.</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {articles.map((article) => (
              <ArticleCard key={article._id || article.id} article={article} />
            ))}
          </div>
        )}
        <div className='mt-12'>
          <Pagination>
            <PaginationContent>
              <PaginationPrevious
                onClick={() => handlePageChange(page - 1)}
                className='mr-2 hover:cursor-pointer '
              />

              {totalPages <= 7 ? (
                Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationLink
                    key={i + 1}
                    isActive={page === i + 1}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </PaginationLink>
                ))
              ) : (
                <>
                  <PaginationLink
                    isActive={page === 1}
                    onClick={() => handlePageChange(1)}
                    className='bg-pink-400'
                  >
                    1
                  </PaginationLink>
                  {page > 3 && <PaginationEllipsis />}
                  {page > 2 && (
                    <PaginationLink onClick={() => handlePageChange(page - 1)}>
                      {page - 1}
                    </PaginationLink>
                  )}
                  <PaginationLink isActive>{page}</PaginationLink>
                  {page < totalPages - 1 && (
                    <PaginationLink onClick={() => handlePageChange(page + 1)}>
                      {page + 1}
                    </PaginationLink>
                  )}
                  {page < totalPages - 2 && <PaginationEllipsis />}
                  <PaginationLink onClick={() => handlePageChange(totalPages)}>
                    {totalPages}
                  </PaginationLink>
                </>
              )}

              <PaginationNext onClick={() => handlePageChange(page + 1)} />
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
};

// ─── Follow Button ────────────────────────────────────────────────────────────
const FollowButton = ({ isFollowing, loading, onClick }) => (
  <Button
    onClick={onClick}
    disabled={loading}
    variant={isFollowing ? "outline" : "default"}
    className={`
      flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold
      transition-all duration-300
      ${
        isFollowing
          ? "border-2 hover:border-destructive hover:text-destructive hover:bg-destructive/10"
          : "shadow-md hover:shadow-lg"
      }
    `}
  >
    {loading ? (
      <>
        <Loader2 className='w-4 h-4 animate-spin' />
        <span>{isFollowing ? "Unfollowing..." : "Following..."}</span>
      </>
    ) : isFollowing ? (
      <>
        <UserCheck className='w-4 h-4' />
        <span>Following</span>
      </>
    ) : (
      <>
        <UserPlus className='w-4 h-4' />
        <span>Follow</span>
      </>
    )}
  </Button>
);

// ─── Stat Item ────────────────────────────────────────────────────────────────
const StatItem = ({ icon, value, label }) => (
  <div className='flex flex-col items-center text-center'>
    <div className='text-muted-foreground mb-2'>{icon}</div>
    <span className='text-lg font-bold'>{value}</span>
    <span className='text-xs text-muted-foreground mt-1 uppercase tracking-tighter'>
      {label}
    </span>
  </div>
);

// ─── Article Card ─────────────────────────────────────────────────────────────
const ArticleCard = ({ article }) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className='relative group h-[420px] w-full overflow-hidden rounded-[2rem] shadow-lg transition-all duration-300 hover:scale-[1.02]'>
      <img
        src={article.image}
        alt={article.title}
        className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
      />
      <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent' />

      <div className='absolute top-4 left-4 right-4 flex justify-between items-start'>
        <span className='bg-white text-black px-4 py-1 rounded-full text-xs font-bold'>
          {article.category}
        </span>
        <div className='flex flex-col gap-2'>
          <button
            onClick={() => setLiked(!liked)}
            className={`p-2 rounded-full backdrop-blur-md transition-all ${
              liked
                ? "bg-red-500 text-white"
                : "bg-white/20 text-white hover:bg-white/40"
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
          </button>
          <button
            onClick={() => setSaved(!saved)}
            className={`p-2 rounded-full backdrop-blur-md transition-all ${
              saved
                ? "bg-primary text-primary-foreground"
                : "bg-white/20 text-white hover:bg-white/40"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>

      <div className='absolute bottom-6 left-6 right-6 text-white'>
        <div className='flex items-center gap-2 text-[10px] font-medium opacity-70 uppercase tracking-widest mb-2'>
          <Calendar className='w-3 h-3' />
          {article.date ||
            new Date(article.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
        </div>
        <h3 className='text-2xl font-bold leading-tight mb-4 line-clamp-2'>
          {article.title}
        </h3>
        <div className='flex items-center gap-3'>
          <Avatar className='h-8 w-8 border border-white/30'>
            <AvatarImage src={article.author?.avatar || article.authorImg} />
            <AvatarFallback className='text-[10px] bg-white/20'>
              {(article.author?.name || article.authorName)?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className='text-sm font-medium opacity-90'>
            {article.author?.name || article.authorName}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthorPage;
