import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import "reactjs-tiptap-editor/style.css";

import {
  addBookmark,
  removeBookmark,
  addLikedPost,
  removeLikedPost,
} from "@/store/userSlice";
import { showToast } from "@/store/uiSlice";
import axios from "axios";
import API_BASE from "@/lib/apiBase";
import {
  Clock,
  Calendar,
  MessageCircle,
  Heart,
  Share2,
  Bookmark,
  ArrowLeft,
  Check,
  Send,
} from "lucide-react";

// Shadcn Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import PostCard from "@/components/PostCard";

// for sanitizing HTML content if needed
import DOMPurify from "dompurify";
import { normalizePostContent, purifyConfig } from "@/DOMPurifyConfig";



const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.user);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [comments, setComments] = useState([]);
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(5);
  const [replyBoxes, setReplyBoxes] = useState({}); // { commentId: boolean }
  const [replyTexts, setReplyTexts] = useState({}); // { commentId: text }
  const [replyLoading, setReplyLoading] = useState({});
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [similarPosts, setSimilarPosts] = useState([]);

  // **READING TIME CALCULATION FUNCTION**
  const calculateReadingTime = (html) => {
    if (!html) return "1 min read";

    const plainText = html.replace(/<[^>]*>/g, " ");
    const wordsPerMinute = 200;
    const wordCount = plainText.trim().split(/\s+/).length;
    const readingTimeMinutes = Math.ceil(wordCount / wordsPerMinute);

    return readingTimeMinutes <= 1
      ? "1 min read"
      : `${readingTimeMinutes} min read`;
  };

  // **FETCH POST DATA FROM SERVER**
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/posts/${id}`);
       

        if (data.success && data.data) {
          setPost(data.data);
          setLikeCount(data.data.likes || 0);
          setComments(
            (data.data.comments || []).map((c) => ({
              ...c,
              replies: c.replies || [],
            })),
          );

          // Check if user has liked/saved
          checkUserInteractions(data.data._id);
        } else {
          setPost(null);
        }
      } catch (err) {
        console.error("Failed to fetch post:", err);
        setPost(null);

        dispatch(
          showToast({
            severity: "error",
            summary: "Error",
            detail: "Failed to load post",
          }),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, dispatch]);

  // get similar posts based on category
  useEffect(() => {
    const fetchSimilarPosts = async () => {
      if (!post?.category) return;

      try {
        const { data } = await axios.get(
          `${API_BASE}/posts?category=${encodeURIComponent(post.category)}&limit=3`,
        );

        if (data.success && Array.isArray(data.posts)) {
          setSimilarPosts(
            data.posts.filter(
              (item) => (item._id || item.id) !== (post._id || post.id),
            ),
          );
        }
      } catch (error) {
        console.error("Failed to fetch similar posts:", error);
      }
    };

    fetchSimilarPosts();
  }, [post]);

  // **CHECK IF USER HAS LIKED/SAVED THIS POST**
  const checkUserInteractions = async (postId) => {
    try {
      const { data } = await axios.get(`${API_BASE}/users/me`);
      if (data.user) {
        setIsLiked(data.user.likedPosts?.includes(postId) || false);
        setIsSaved(data.user.bookmarks?.includes(postId) || false);
      }
    } catch (error) {
      console.log("User not authenticated");
    }
  };

  // **HANDLE LIKE/UNLIKE**
  const handleLike = async () => {
    if (!userInfo) {
      dispatch(
        showToast({
          severity: "warn",
          summary: "Register Required",
          detail: "Please register to like this article on the site.",
        }),
      );
      return;
    }

    try {
      const { data } = await axios.post(`${API_BASE}/posts/${id}/like`);

      if (data.success) {
        setIsLiked(data.liked);
        setLikeCount(data.likes);

        if (data.liked) {
          dispatch(addLikedPost(id));
        } else {
          dispatch(removeLikedPost(id));
        }

        dispatch(
          showToast({
            severity: data.liked ? "success" : "info",
            summary: data.liked ? "Post Liked!" : "Like Removed",
            detail: data.liked
              ? "Added to your liked posts"
              : "Removed from liked posts",
          }),
        );
      }
    } catch (error) {
      dispatch(
        showToast({
          severity: "error",
          summary: "Error",
          detail: "Failed to like post",
        }),
      );
    }
  };

  // **HANDLE BOOKMARK/SAVE**
  const handleSave = async () => {
    if (!userInfo) {
      dispatch(
        showToast({
          severity: "warn",
          summary: "Register Required",
          detail: "Please register to save this article on the site.",
        }),
      );
      return;
    }

    try {
      const { data } = await axios.post(`${API_BASE}/posts/${id}/bookmark`);

      if (data.success) {
        setIsSaved(data.bookmarked);

        if (data.bookmarked) {
          dispatch(addBookmark(id));
        } else {
          dispatch(removeBookmark(id));
        }

        dispatch(
          showToast({
            severity: data.bookmarked ? "success" : "info",
            summary: data.bookmarked ? "Post Saved!" : "Bookmark Removed",
            detail: data.bookmarked
              ? "Added to your bookmarks"
              : "Removed from bookmarks",
          }),
        );
      }
    } catch (error) {
      dispatch(
        showToast({
          severity: "error",
          summary: "Error",
          detail: "Failed to bookmark post",
        }),
      );
    }
  };

  // **HANDLE SHARE**
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: `Check out this amazing article: ${post.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);

      dispatch(
        showToast({
          severity: "success",
          summary: "Link Copied!",
          detail: "Post link copied to clipboard",
        }),
      );

      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // **HANDLE POST COMMENT**
  const handlePostComment = async () => {
    if (!userInfo) {
      dispatch(
        showToast({
          severity: "warn",
          summary: "Login Required",
          detail: "Please login to add a comment",
        }),
      );
      navigate("/login");
      return;
    }

    if (!newComment.trim()) {
      dispatch(
        showToast({
          severity: "warn",
          summary: "Empty Comment",
          detail: "Please write something before posting",
        }),
      );
      return;
    }

    setCommentLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/posts/${id}/comments`, {
        text: newComment,
      });

      if (data.success) {
        setComments([{ ...data.comment, replies: [] }, ...comments]);
        setNewComment("");

        dispatch(
          showToast({
            severity: "success",
            summary: "Comment Posted!",
            detail: "Your comment has been added successfully",
          }),
        );
      }
    } catch (error) {
      if (error.response?.status === 401) {
        dispatch(
          showToast({
            severity: "warn",
            summary: "Authentication Required",
            detail: "Please login to comment",
          }),
        );
        navigate("/login");
      } else {
        dispatch(
          showToast({
            severity: "error",
            summary: "Failed to Post Comment",
            detail: "Something went wrong, please try again",
          }),
        );
      }
    } finally {
      setCommentLoading(false);
    }
  };

  // Load more comments (incremental)
  const handleLoadMoreComments = () => {
    setVisibleCommentsCount((v) => v + 5);
  };

  // Toggle reply box for a specific comment
  const toggleReplyBox = (commentId) => {
    setReplyBoxes((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const handleReplyChange = (commentId, value) => {
    setReplyTexts((prev) => ({ ...prev, [commentId]: value }));
  };

  const handleSubmitReply = async (commentId) => {
    if (!userInfo) {
      dispatch(
        showToast({
          severity: "warn",
          summary: "Login Required",
          detail: "Please login to reply",
        }),
      );
      navigate("/login");
      return;
    }

    const text = (replyTexts[commentId] || "").trim();
    if (!text) return;

    setReplyLoading((p) => ({ ...p, [commentId]: true }));
    try {
      const { data } = await axios.post(`${API_BASE}/posts/${id}/comments`, {
        text,
        parentId: commentId,
      });

      if (data.success && data.reply) {
        setComments((prev) =>
          prev.map((c) => {
            if ((c._id || c.id) === commentId) {
              const replies = c.replies
                ? [data.reply, ...c.replies]
                : [data.reply];
              return { ...c, replies };
            }
            return c;
          }),
        );

        setReplyTexts((p) => ({ ...p, [commentId]: "" }));
        setReplyBoxes((p) => ({ ...p, [commentId]: false }));

        dispatch(
          showToast({
            severity: "success",
            summary: "Replied",
            detail: "Your reply has been posted",
          }),
        );
      }
    } catch (error) {
      dispatch(
        showToast({
          severity: "error",
          summary: "Reply failed",
          detail: "Could not post reply",
        }),
      );
    } finally {
      setReplyLoading((p) => ({ ...p, [commentId]: false }));
    }
  };

  if (loading) {
    return (
      <div className='text-center py-20'>
        <div className='text-muted-foreground'>Loading...</div>
      </div>
    );
  }

  // If post not found
  if (!post) {
    return (
      <div className='text-center py-20'>
        <h2 className='text-2xl font-bold mb-4'>Post not found!</h2>
        <p className='text-muted-foreground mb-6'>
          The post you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate("/")}>
          <ArrowLeft className='mr-2 h-4 w-4' /> Back to Home
        </Button>
      </div>
    );
  }

  const author =
    typeof post.author === "object"
      ? post.author
      : { name: post.author || "Unknown Author", avatar: post.authorImage };

  const featuredImage = post.cover || post.image;
  const postContent = post.content || post.excerpt || "No content available.";

  const dateValue = post.createdAt || post.publishedAt || post.date;
  const formattedDate = dateValue
    ? new Date(dateValue).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Unknown date";

  const readTime = calculateReadingTime(postContent);

  return (
    <div className='max-w-5xl mx-auto px-4 py-10 md:py-16'>
      {/* Back Button */}
      <Link
        to='/'
        className='inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8'
      >
        <ArrowLeft className='mr-2 h-4 w-4' /> Back to Home
      </Link>

      {/* Header Section */}
      <div className='space-y-4 mb-8'>
        <div className='flex items-center gap-2 mb-4'>
          <Badge variant='secondary'>{post.category}</Badge>
          <span className='text-sm text-muted-foreground flex items-center gap-2'>
            <Calendar className='h-3 w-3' />
            {formattedDate}
            <span className='inline-flex items-center gap-1 text-muted-foreground'>
              •
              <Clock className='h-3 w-3' />
              {readTime}
            </span>
          </span>
        </div>

        <h1 className='text-4xl md:text-5xl font-extrabold tracking-tight text-foreground'>
          {post.title}
        </h1>

        {post.excerpt && (
          <p className='text-lg text-muted-foreground leading-relaxed pt-4'>
            {post.excerpt}
          </p>
        )}

        <div className='flex items-center gap-3 pt-4'>
          <Avatar className='h-10 w-10'>
            <AvatarImage src={author.avatar} />
            <AvatarFallback>
              {author.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className='text-sm font-medium leading-none'>{author.name}</p>
            <p className='text-xs text-muted-foreground'>Author</p>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {featuredImage && (
        <div className='rounded-xl overflow-hidden border bg-muted mb-10 shadow-sm'>
          <img
            src={featuredImage}
            alt={post.title}
            className='w-full h-auto object-cover max-h-125'
          />
        </div>
      )}

      <article
        className='article-content prose prose-lg dark:prose-invert max-w-none mb-8'
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(
            normalizePostContent(postContent),
            purifyConfig,
          ),
        }}
      />

      {post.hashtags?.length > 0 && (
        <div className='flex flex-wrap gap-2 mb-10'>
          {post.hashtags.map((tag) => (
            <Badge
              key={`bottom-${tag}`}
              variant='secondary'
              className='uppercase'
            >
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      <Separator className='my-8' />

      {/* Interaction Buttons */}
      <div className='flex justify-between items-center mb-10'>
        <div className='flex gap-4'>
          <Button variant='ghost' size='sm' className='gap-2'>
            <MessageCircle className='h-5 w-5' />
            {comments.length}
          </Button>

          <Button
            variant='ghost'
            size='sm'
            onClick={handleLike}
            className={`gap-2 transition-colors ${
              isLiked ? "text-red-500 hover:text-red-600" : ""
            }`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
            {likeCount}
          </Button>
        </div>

        <div className='flex gap-2'>
          <Button
            variant='ghost'
            size='icon'
            onClick={handleSave}
            className={`transition-colors ${
              isSaved ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            <Bookmark
              className={`h-5 w-5 ${isSaved ? "fill-foreground" : ""}`}
            />
          </Button>

          <Button
            variant='ghost'
            size='icon'
            onClick={handleShare}
            className='relative'
          >
            {isCopied ? (
              <Check className='h-5 w-5 text-green-500' />
            ) : (
              <Share2 className='h-5 w-5' />
            )}
          </Button>
        </div>
      </div>

      {/* Comments Section */}
      <div className='bg-muted/30 p-6 rounded-lg border  max-h-[600px] overflow-auto'>
        <h3 className='font-bold text-xl mb-6'>Comments ({comments.length})</h3>

        {/* Add Comment Form */}
        {userInfo ? (
          <div className='flex gap-4 mb-8'>
            <Avatar className='h-10 w-10'>
              {userInfo.avatar ? (
                <AvatarImage src={userInfo.avatar} />
              ) : (
                <AvatarFallback>
                  {userInfo.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              )}
            </Avatar>
            <div className='flex-1 space-y-2'>
              <Textarea
                placeholder='Add a comment...'
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={commentLoading}
              />
              <Button
                size='sm'
                onClick={handlePostComment}
                disabled={commentLoading || !newComment.trim()}
              >
                {commentLoading ? (
                  "Posting..."
                ) : (
                  <>
                    <Send className='h-4 w-4 mr-2' />
                    Post Comment
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className='rounded-lg border border-border bg-background p-4 mb-8 text-sm text-muted-foreground'>
            Please{" "}
            <Link to='/login' className='text-primary underline'>
              login
            </Link>{" "}
            to add a comment.
          </div>
        )}

        {/* Comments List */}
        <div className='space-y-6 '>
          {comments.length > 0 ? (
            // show only a subset and allow loading more
            comments.slice(0, visibleCommentsCount).map((comment, i) => {
              const userFromComment =
                typeof comment.user === "object" ? comment.user : null;

              const commentUserId =
                userFromComment?._id || userFromComment?.id || comment.user;

              const isCurrentUserComment =
                userInfo?.id && commentUserId
                  ? commentUserId.toString() === userInfo.id.toString()
                  : false;

              const commentUserName =
                isCurrentUserComment && userInfo?.name
                  ? userInfo.name
                  : comment.name || userFromComment?.name || "Anonymous";

              const commentAvatar =
                isCurrentUserComment && userInfo?.avatar
                  ? userInfo.avatar
                  : comment.avatar || userFromComment?.avatar;

              const commentDate = comment.createdAt || comment.date;
              const formattedCommentDate = commentDate
                ? new Date(commentDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Recent";

              const commentId = comment._id || comment.id || i;

              return (
                <div key={commentId} className=''>
                  <div className='flex gap-4'>
                    <Avatar className='h-8 w-8'>
                      <AvatarImage src={commentAvatar} />
                      <AvatarFallback>
                        {commentUserName?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1'>
                      <div className='flex items-center justify-between'>
                        <h4 className='font-semibold text-sm'>
                          {commentUserName}
                        </h4>
                        <span className='text-xs text-muted-foreground'>
                          {formattedCommentDate}
                        </span>
                      </div>
                      <p className='text-sm text-foreground/80 mt-1'>
                        {comment.comment || comment.text || comment.content}
                      </p>

                      <div className='flex items-center gap-3 mt-3'>
                        <button
                          className='text-sm text-muted-foreground hover:text-primary'
                          onClick={() => toggleReplyBox(commentId)}
                        >
                          Reply
                        </button>
                      </div>

                      {/* Reply box -----------------------------------------*/}
                      {replyBoxes[commentId] && (
                        <div className='mt-3 flex gap-3'>
                          <Textarea
                            value={replyTexts[commentId] || ""}
                            onChange={(e) =>
                              handleReplyChange(commentId, e.target.value)
                            }
                            placeholder='Write a reply...'
                          />
                          <div className='flex flex-col gap-2'>
                            <Button
                              size='sm'
                              onClick={() => handleSubmitReply(commentId)}
                              disabled={replyLoading[commentId]}
                            >
                              {replyLoading[commentId]
                                ? "Replying..."
                                : "Reply"}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Replies -----------------------------------------*/}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className='mt-4 ml-12 space-y-4'>
                          {comment.replies.map((rep, ri) => (
                            <div key={rep._id || ri} className='flex gap-3'>
                              <Avatar className='h-6 w-6'>
                                <AvatarImage src={rep.avatar} />
                                <AvatarFallback>
                                  {rep.name?.[0]?.toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className='flex items-center gap-2'>
                                  <span className='font-medium text-sm'>
                                    {rep.name || "Anonymous"}
                                  </span>
                                  <span className='text-xs text-muted-foreground'>
                                    {rep.createdAt
                                      ? new Date(
                                          rep.createdAt,
                                        ).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        })
                                      : "Recent"}
                                  </span>
                                </div>
                                <p className='text-sm text-foreground/80 mt-1'>
                                  {rep.comment || rep.text}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className='text-sm text-muted-foreground italic text-center py-8'>
              No comments yet. Be the first to comment!
            </p>
          )}

          {/* Load more button */}
          {comments.length > visibleCommentsCount && (
            <div className='text-center'>
              <Button variant='outline' onClick={handleLoadMoreComments}>
                Load more comments
              </Button>
            </div>
          )}
        </div>
      </div>

      {similarPosts.length > 0 && (
        <div className='mt-12'>
          <div className='mb-6'>
            <h2 className='text-2xl font-bold'>Similar articles</h2>
            <p className='text-muted-foreground'>
              You may also like these posts from the same category.
            </p>
          </div>

          <div className='grid gap-6 md:grid-cols-3'>
            {similarPosts.map((similar) => (
              <PostCard key={similar._id || similar.id} post={similar} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogDetail;
