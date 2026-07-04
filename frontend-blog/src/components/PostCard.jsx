import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const PostCard = ({ post }) => {
  const postId = post.id || post._id;

  // Format the release date if available (looks for common date fields)
  const dateStr = post.date || post.createdAt || post.publishedAt;
  const formattedDate = dateStr
    ? new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  return (
    <Card className='relative h-[350px] w-full overflow-hidden group rounded-xl border-0 shadow-md'>
      {/* 1. Main Background Image */}
      <img
        src={post.image}
        alt={post.title}
        className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
      />

      {/* 2. Dark Gradient Overlay for text readability */}
      <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none' />

      {/* 3. Content Wrapper */}
      <div className='relative h-full w-full p-5 flex flex-col justify-between z-10'>
        {/* Top Section: Category Badge */}
        <div>
          <Badge className='bg-white text-black hover:bg-gray-100 hover:text-black rounded-full px-4 py-1 text-xs font-semibold shadow-sm'>
            {post.category}
          </Badge>
        </div>

        {/* Bottom Section: Title, Author & Date */}
        <div className='mt-auto flex flex-col gap-3'>
          {/* Main Link for the Card */}
          <Link to={`/blog/${postId}`} className='focus:outline-none'>
            {/* The ::before pseudo-element stretches over the parent (Card), making it completely clickable without nested <a> tags */}
            <span className='absolute inset-0' aria-hidden='true'></span>
            <h2 className='text-2xl font-bold leading-snug text-white line-clamp-2 drop-shadow-md'>
              {post.title}
            </h2>
          </Link>

          {/* Author and Date row */}
          <div className='flex items-center justify-between mt-1'>
            {/* Author Info */}
            <div className='flex items-center gap-2 relative z-20'>
              <Avatar className='h-8 w-8 border-2 border-white/20 shadow-sm'>
                <AvatarImage
                  src={
                    typeof post.author === "object"
                      ? post.author?.avatar
                      : post.authorImage
                  }
                />
                <AvatarFallback className='text-gray-900 bg-white'>
                  {typeof post.author === "object"
                    ? post.author?.name?.[0]
                    : post.author?.[0] || "U"}
                </AvatarFallback>
              </Avatar>

              <Link
                to={`/author/${
                  typeof post.author === "object"
                    ? post.author?._id
                    : post.author
                }`}
                className='hover:underline text-sm font-medium text-white/90 drop-shadow-sm'
              >
                {typeof post.author === "object"
                  ? post.author?.name
                  : post.author}
              </Link>
            </div>

            {/* Release Date */}
            <span className='text-sm text-white/70 font-medium relative z-20'>
              {formattedDate}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PostCard;
