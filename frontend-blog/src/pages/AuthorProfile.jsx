import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import API_BASE from "@/lib/apiBase";
import {
  Users,
  Heart,
  PenTool,
  CalendarDays,
  Settings,
  Camera,
  Save,
  Image,
  X,
  UserPlus,
  UserCheck,
  Loader2,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PostCard from "@/components/PostCard";
import { addFollowing, removeFollowing } from "@/store/userSlice";
import { showToast } from "@/store/uiSlice";

const AuthorProfile = () => {
  const { authorId } = useParams();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.user);

  const [author, setAuthor] = useState(null);
  const [stats, setStats] = useState(null);
  const [authorPosts, setAuthorPosts] = useState([]);
  const [postsPage, setPostsPage] = useState(1);
  const [postsTotalPages, setPostsTotalPages] = useState(1);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // ── Controlled Dialog state (sync on open / cleanup on close) ──
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editBio, setEditBio] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Photo upload states
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [backgroundPhoto, setBackgroundPhoto] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [backgroundPreview, setBackgroundPreview] = useState("");

  // Refs for hidden file inputs
  const profileInputRef = useRef(null);
  const backgroundInputRef = useRef(null);

  useEffect(() => {
    fetchData();
    fetchPosts(1);
  }, [authorId]);

  const fetchData = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/authors/${authorId}`);
      setEditName(data.data.author.name || "");
      setAuthor(data.data.author);
      setStats(data.data.stats);
      setAuthorPosts(data.data.posts);
      setIsOwnProfile(data.data.isOwnProfile);
      setIsFollowing(data.data.isFollowing || false);
      setEditBio(data.data.author.bio || "");
      setEditEmail(data.data.author.email || "");
      setProfilePreview(data.data.author.avatar || "");
      setBackgroundPreview(data.data.author.coverPhoto || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (pageNum = 1) => {
    try {
      const res = await fetch(
        `${API_BASE}/posts?author=${authorId}&page=${pageNum}&limit=9`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (data.success) {
        setAuthorPosts(data.posts || []);
        setPostsTotalPages(data.totalPages || 1);
        setPostsPage(data.page || pageNum);
      }
    } catch (err) {
      console.error("Failed to fetch author posts:", err);
      setAuthorPosts([]);
    }
  };

  const handleToggleFollow = async () => {
    if (!userInfo) {
      dispatch(
        showToast({
          severity: "warning",
          summary: "Follow",
          detail: "Please log in to follow this author.",
        }),
      );
      return;
    }

    if (isOwnProfile) return;

    setFollowLoading(true);

    try {
      const { data } = await axios.put(
        `${API_BASE}/authors/follow/${authorId}`,
        {},
        { withCredentials: true },
      );

      if (data.success) {
        dispatch(
          data.isFollowing ? addFollowing(authorId) : removeFollowing(authorId),
        );
        setIsFollowing(data.isFollowing);
        setStats((prev) =>
          prev
            ? {
                ...prev,
                followersCount: data.followersCount,
              }
            : prev,
        );
      } else {
        dispatch(
          showToast({
            severity: "error",
            summary: "Follow failed",
            detail: data.message || "Unable to update follow status.",
          }),
        );
      }
    } catch (err) {
      console.error(err);
      dispatch(
        showToast({
          severity: "error",
          summary: "Follow failed",
          detail:
            err.response?.data?.message || "Unable to update follow status.",
        }),
      );
    } finally {
      setFollowLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────────
  // Sync author data into the form when the dialog OPENS
  // and revoke object URLs (free memory) when it CLOSES
  // ──────────────────────────────────────────────────────────────
  const handleOpenChange = (newOpen) => {
    if (newOpen && author) {
      setEditName(author.name || "");
      setEditEmail(author.email || "");
      setEditBio(author.bio || "");
      setProfilePreview(author.avatar || "");
      setBackgroundPreview(author.coverPhoto || "");
      setProfilePhoto(null);
      setBackgroundPhoto(null);
      setCurrentPassword("");
      setNewPassword("");
      if (profileInputRef.current) profileInputRef.current.value = "";
      if (backgroundInputRef.current) backgroundInputRef.current.value = "";
    } else if (!newOpen) {
      // Revoke object URLs to free memory
      if (profilePhoto && profilePreview) URL.revokeObjectURL(profilePreview);
      if (backgroundPhoto && backgroundPreview)
        URL.revokeObjectURL(backgroundPreview);
    }
    setOpen(newOpen);
  };

  // Handle file selection with local preview
  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleBackgroundPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackgroundPhoto(file);
      setBackgroundPreview(URL.createObjectURL(file));
    }
  };

  // Remove selected photo (revert to original)
  const handleRemoveProfilePhoto = () => {
    setProfilePhoto(null);
    setProfilePreview(author?.avatar || "");
    if (profileInputRef.current) profileInputRef.current.value = "";
  };

  const handleRemoveBackgroundPhoto = () => {
    setBackgroundPhoto(null);
    setBackgroundPreview(author?.coverPhoto || "");
    if (backgroundInputRef.current) backgroundInputRef.current.value = "";
  };

  // ──────────────────────────────────────────────────────────────
  // Save changes → uploads images to Cloudinary AND persists
  // the URLs + text fields to the MongoDB database (backend
  // updateProfile controller handles both).
  // ──────────────────────────────────────────────────────────────
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("name", editName);
      formData.append("email", editEmail);
      formData.append("bio", editBio);

      // Match Zod schema field names: currentPassword / newPassword
      if (currentPassword) formData.append("currentPassword", currentPassword);
      if (newPassword) formData.append("newPassword", newPassword);

      // File fields — must match multer field names on the backend
      if (profilePhoto) {
        formData.append("avatar", profilePhoto);
      }
      if (backgroundPhoto) {
        formData.append("coverPhoto", backgroundPhoto);
      }

      const { data } = await axios.put(`${API_BASE}/users/profile`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Update local state immediately so the UI reflects the change
      // (avatar + coverPhoto now come from Cloudinary URLs returned by the backend)
      if (data && data.user) {
        setAuthor((prev) => ({
          ...prev,
          name: data.user.name,
          email: data.user.email,
          bio: data.user.bio,
          avatar: data.user.avatar,
          coverPhoto: data.user.coverPhoto,
        }));
        setProfilePreview(data.user.avatar || "");
        setBackgroundPreview(data.user.coverPhoto || "");
      }

      // Reset transient state
      setProfilePhoto(null);
      setBackgroundPhoto(null);
      setCurrentPassword("");
      setNewPassword("");

      setOpen(false);

      // Refetch to guarantee UI is fully in sync with the database
      fetchData();
    } catch (err) {
      console.error(err);
      dispatch(
        showToast({
          severity: "error",
          summary: "Update failed",
          detail: err.response?.data?.message || "Failed to update",
        }),
      );
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-[60vh] flex items-center justify-center'>
        <div className='text-muted-foreground'>Loading profile...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen pb-20'>
      {/* 1. Header Section with Background Banner (Cover Photo) */}
      <div className='relative h-64 md:h-80 w-full px-4 md:px-8 pt-4'>
        <div className='relative h-full w-full rounded-3xl overflow-hidden border shadow-sm bg-muted'>
          {backgroundPreview ? (
            <img
              src={backgroundPreview}
              alt='Cover'
              className='w-full h-full object-cover'
            />
          ) : (
            <div className='w-full h-full bg-gradient-to-r from-muted to-muted-foreground/20' />
          )}
        </div>

        {/* Avatar Overlay */}
        <div className='absolute -bottom-16 left-1/2 -translate-x-1/2'>
          <Avatar className='h-32 w-32 border-4 border-background shadow-md'>
            <AvatarImage src={profilePreview} />
            <AvatarFallback className='text-2xl'>
              {author?.name?.[0]}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* 2. Info Section */}
      <div className='mt-20 text-center px-4 max-w-2xl mx-auto'>
        <h1 className='text-3xl font-bold'>{author?.name}</h1>
        <p className='text-muted-foreground mt-1'>{author?.email}</p>
        <p className='mt-4 text-muted-foreground leading-relaxed'>
          {author?.bio || "Digital creator & storyteller."}
        </p>

        {!isOwnProfile && (
          <div className='mt-6 flex justify-center'>
            <Button
              variant={isFollowing ? "outline" : "default"}
              className='rounded-full gap-2'
              onClick={handleToggleFollow}
              disabled={followLoading}
            >
              {followLoading ? (
                <>
                  <Loader2 className='w-4 h-4 animate-spin' />
                  {isFollowing ? "Unfollowing..." : "Following..."}
                </>
              ) : isFollowing ? (
                <>
                  <UserCheck className='w-4 h-4' />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className='w-4 h-4' />
                  Follow
                </>
              )}
            </Button>
          </div>
        )}

        {isOwnProfile && (
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button variant='outline' className='mt-6 rounded-full'>
                <Settings className='w-4 h-4 mr-2' /> Settings Account
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[500px] max-h-[90vh] overflow-y-auto'>
              <DialogHeader>
                <DialogTitle>Edit Your Profile</DialogTitle>
                <DialogDescription>
                  Upload a new avatar or background cover from your system, and
                  edit your profile details. Changes are stored in the cloud and
                  database. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateProfile} className='space-y-5 pt-4'>
                {/* ── Profile Photo ── */}
                <div className='space-y-2 text-left'>
                  <Label>Profile Photo</Label>
                  <div className='flex items-center gap-4'>
                    <Avatar className='h-16 w-16 border shadow-sm'>
                      <AvatarImage src={profilePreview} />
                      <AvatarFallback>
                        {editName ? editName[0] : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col gap-2'>
                      <input
                        ref={profileInputRef}
                        type='file'
                        accept='image/*'
                        className='hidden'
                        onChange={handleProfilePhotoChange}
                      />
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        className='gap-2'
                        onClick={() => profileInputRef.current?.click()}
                      >
                        <Camera className='w-4 h-4' /> Choose Photo
                      </Button>
                      {profilePhoto && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='gap-1 text-destructive'
                          onClick={handleRemoveProfilePhoto}
                        >
                          <X className='w-3 h-3' /> Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Cover Photo ── */}
                <div className='space-y-2 text-left'>
                  <Label>Cover Photo</Label>
                  <div className='space-y-2'>
                    <div className='relative h-28  w-full rounded-lg overflow-hidden border bg-muted'>
                      {backgroundPreview ? (
                        <img
                          src={backgroundPreview}
                          alt='Cover preview'
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <div className='flex items-center justify-center h-full text-muted-foreground'>
                          <Image className='w-8 h-8' />
                        </div>
                      )}
                    </div>
                    <input
                      ref={backgroundInputRef}
                      type='file'
                      accept='image/*'
                      className='hidden'
                      onChange={handleBackgroundPhotoChange}
                    />
                    <div className='flex gap-2'>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        className='gap-2'
                        onClick={() => backgroundInputRef.current?.click()}
                      >
                        <Image className='w-4 h-4' /> Choose Cover
                      </Button>
                      {backgroundPhoto && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='gap-1 text-destructive'
                          onClick={handleRemoveBackgroundPhoto}
                        >
                          <X className='w-3 h-3' /> Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Name ── */}
                <div className='space-y-2 text-left'>
                  <Label>Name</Label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>

                {/* ── Email ── */}
                <div className='space-y-2 text-left'>
                  <Label>Email Address</Label>
                  <Input
                    type='email'
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </div>

                {/* ── Bio ── */}
                <div className='space-y-2 text-left'>
                  <Label>Short Bio</Label>
                  <Textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* ── Password ── */}
                <div className='space-y-2 text-left'>
                  <Label>Current Password</Label>
                  <Input
                    type='password'
                    placeholder='current password'
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className='space-y-2 text-left'>
                  <Label>New Password</Label>
                  <Input
                    type='password'
                    placeholder='new password'
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                {/* ── Submit ── */}
                <Button type='submit' className='w-full' disabled={uploading}>
                  <Save className='w-4 h-4 mr-2' />
                  {uploading ? "Uploading..." : "Save Changes"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* 3. Stats Section */}
      <div className='max-w-5xl mx-auto mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 px-4 border-y py-8 border-border'>
        <StatItem
          icon={<Users />}
          value={stats?.followersCount}
          label='Followers'
        />
        <StatItem icon={<Heart />} value={stats?.totalLikes} label='Likes' />
        <StatItem
          icon={<PenTool />}
          value={stats?.articlesCount}
          label='Articles'
        />
        <StatItem
          icon={<CalendarDays />}
          value={new Date(author?.joinDate).getFullYear()}
          label='Joined'
        />
      </div>

      {/* 4. Articles Grid */}
      <div className='max-w-7xl mx-auto mt-16 px-4'>
        <h2 className='text-xl font-bold mb-8 uppercase tracking-widest opacity-60'>
          Latest Articles
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {authorPosts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>

        <div className='mt-8'>
          <Pagination>
            <PaginationContent>
              <PaginationPrevious onClick={() => fetchPosts(postsPage - 1)} />

              {postsTotalPages <= 7 ? (
                Array.from({ length: postsTotalPages }).map((_, i) => (
                  <PaginationLink
                    key={i + 1}
                    isActive={postsPage === i + 1}
                    onClick={() => fetchPosts(i + 1)}
                  >
                    {i + 1}
                  </PaginationLink>
                ))
              ) : (
                <>
                  <PaginationLink
                    isActive={postsPage === 1}
                    onClick={() => fetchPosts(1)}
                  >
                    1
                  </PaginationLink>
                  {postsPage > 3 && <PaginationEllipsis />}
                  {postsPage > 2 && (
                    <PaginationLink onClick={() => fetchPosts(postsPage - 1)}>
                      {postsPage - 1}
                    </PaginationLink>
                  )}
                  <PaginationLink isActive>{postsPage}</PaginationLink>
                  {postsPage < postsTotalPages - 1 && (
                    <PaginationLink onClick={() => fetchPosts(postsPage + 1)}>
                      {postsPage + 1}
                    </PaginationLink>
                  )}
                  {postsPage < postsTotalPages - 2 && <PaginationEllipsis />}
                  <PaginationLink onClick={() => fetchPosts(postsTotalPages)}>
                    {postsTotalPages}
                  </PaginationLink>
                </>
              )}

              <PaginationNext onClick={() => fetchPosts(postsPage + 1)} />
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ icon, value, label }) => (
  <div className='flex flex-col items-center text-center'>
    <div className='text-muted-foreground mb-2 w-5 h-5'>{icon}</div>
    <span className='text-lg font-bold'>{value || 0}</span>
    <span className='text-[10px] text-muted-foreground uppercase mt-1 tracking-widest'>
      {label}
    </span>
  </div>
);

export default AuthorProfile;
