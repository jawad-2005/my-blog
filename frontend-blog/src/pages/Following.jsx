import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import API_BASE from "@/lib/apiBase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { showToast } from "@/store/uiSlice";
import { addFollowing, removeFollowing } from "@/store/userSlice";

const Following = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((s) => s.user);

  const [authors, setAuthors] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [followLoading, setFollowLoading] = useState({});

  const fetchAuthors = async (pageNum = 1) => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${API_BASE}/users/following?page=${pageNum}&limit=${limit}`,
        { withCredentials: true },
      );
      if (data.success) {
        setAuthors((prev) =>
          pageNum === 1 ? data.data : [...prev, ...data.data],
        );
        setHasMore(pageNum < (data.meta?.totalPages || 1));
      }
    } catch (error) {
      dispatch(
        showToast({
          severity: "error",
          summary: "Error",
          detail: "Could not load followed authors",
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors(1);
  }, []);

  const loadMore = () => {
    if (!hasMore) return;
    const next = page + 1;
    setPage(next);
    fetchAuthors(next);
  };

  const handleToggleFollow = async (authorId, idx) => {
    if (!userInfo) {
      dispatch(
        showToast({
          severity: "warn",
          summary: "Login Required",
          detail: "Please login to follow",
        }),
      );
      navigate("/login");
      return;
    }

    setFollowLoading((p) => ({ ...p, [authorId]: true }));
    try {
      const { data } = await axios.put(
        `${API_BASE}/authors/follow/${authorId}`,
        {},
        { withCredentials: true },
      );
      if (data.success) {
        // update local authors list followersCount
        setAuthors((prev) =>
          prev.map((a) =>
            String(a.id) === String(authorId)
              ? { ...a, followersCount: data.followersCount }
              : a,
          ),
        );

        if (data.isFollowing) dispatch(addFollowing(authorId));
        else dispatch(removeFollowing(authorId));

        dispatch(
          showToast({
            severity: "success",
            summary: data.isFollowing ? "Following" : "Unfollowed",
            detail: data.message,
          }),
        );
      }
    } catch (error) {
      dispatch(
        showToast({
          severity: "error",
          summary: "Error",
          detail: "Could not update follow",
        }),
      );
    } finally {
      setFollowLoading((p) => ({ ...p, [authorId]: false }));
    }
  };

  return (
    <div className='max-w-4xl mx-auto px-4 py-10'>
      <h1 className='text-2xl font-bold mb-4'>Authors You Follow</h1>
      <p className='text-sm text-muted-foreground mb-6'>
        Click an author to view their profile.
      </p>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        {authors.map((author) => (
          <div
            key={author.id}
            className='flex items-center justify-between gap-4 p-4 border rounded-lg hover:shadow-md'
          >
            <div
              className='flex items-center gap-4 cursor-pointer'
              onClick={() => navigate(`/author/${author.id}`)}
            >
              <Avatar className='h-12 w-12'>
                <AvatarImage src={author.avatar} />
                <AvatarFallback>{(author.name || "?")[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className='font-medium'>{author.name}</div>
                <div className='text-xs text-muted-foreground'>
                  {(author.followersCount || 0).toLocaleString()} followers
                </div>
              </div>
            </div>
            <div>
              <Button
                size='sm'
                onClick={() => handleToggleFollow(author.id)}
                disabled={!!followLoading[author.id]}
              >
                {followLoading[author.id] ? "..." : "Unfollow"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className='mt-6 text-center'>
        {hasMore ? (
          <Button onClick={loadMore} variant='outline' disabled={loading}>
            {loading ? "Loading..." : "Load more"}
          </Button>
        ) : (
          <div className='text-sm text-muted-foreground'>No more authors</div>
        )}
      </div>
    </div>
  );
};

export default Following;
