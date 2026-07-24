import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Users,
  BookOpen,
  Settings,
  Plus,
  BookmarkX,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import API_BASE from "@/lib/apiBase";
import PostCard from "@/components/PostCard";


const pageSize = 9;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [savedArticles, setSavedArticles] = useState([]);
  const [savedLoading, setSavedLoading] = useState(true);
  const navigate = useNavigate();

  // Dialog & form state for "setting account"
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    avatar: "",
    avatarFile: null,
    avatarPreview: "",
    coverPhoto: "",
    coverPhotoFile: null,
    coverPhotoPreview: "",
    currentPassword: "",
    newPassword: "",
  });

  // Get user data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE}/users/me`);
        setUser(response.data.user);
      } catch (error) {
        if (error.response?.status === 401) {
          navigate("/login");
          return;
        }
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // Fetch bookmarked/saved articles from server
  useEffect(() => {
    const fetchSavedArticles = async () => {
      try {
        const response = await axios.get(`${API_BASE}/users/bookmarks`);
        setSavedArticles(response.data.bookmarks || []);
      } catch (error) {
        console.error("Failed to load bookmarked articles", error);
        setSavedArticles([]);
      } finally {
        setSavedLoading(false);
      }
    };

    if (user) {
      fetchSavedArticles();
    }
  }, [user]);

  // Sync user data to form when dialog opens / cleans up previews when closed
  const handleOpenChange = (newOpen) => {
    if (newOpen && user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
        avatarFile: null,
        avatarPreview: "",
        coverPhoto: user.coverPhoto || "",
        coverPhotoFile: null,
        coverPhotoPreview: "",
        currentPassword: "",
        newPassword: "",
      });
    } else if (!newOpen) {
      if (formData.avatarPreview) URL.revokeObjectURL(formData.avatarPreview);
      if (formData.coverPhotoPreview)
        URL.revokeObjectURL(formData.coverPhotoPreview);
    }
    setOpen(newOpen);
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        avatarFile: file,
        avatarPreview: previewUrl,
      }));
    }
  };

  const handleCoverPhotoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        coverPhotoFile: file,
        coverPhotoPreview: previewUrl,
      }));
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = new FormData();
      if (formData.name) payload.append("name", formData.name);
      if (formData.email) payload.append("email", formData.email);
      if (typeof formData.bio !== "undefined")
        payload.append("bio", formData.bio);

      if (formData.newPassword) {
        payload.append("newPassword", formData.newPassword);
        if (formData.currentPassword) {
          payload.append("currentPassword", formData.currentPassword);
        }
      }

      if (formData.avatarFile) {
        payload.append("avatar", formData.avatarFile);
      }
      if (formData.coverPhotoFile) {
        payload.append("coverPhoto", formData.coverPhotoFile);
      }

      const response = await axios.put(`${API_BASE}/users/profile`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data && response.data.user) {
        setUser(response.data.user);
      }
      setOpen(false);
    } catch (error) {
      console.error("Failed to update profile settings", error);
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const totalReadingMinutes = savedArticles.reduce((total, article) => {
    const minutesMatch = String(article.readTime || "").match(/(\d+)/);
    return total + (minutesMatch ? Number(minutesMatch[1]) : 0);
  }, 0);

  const profileMenu = [
    {
      label: "Time Read",
      value: `${totalReadingMinutes} minutes`,
      subLabel: "Total reading time",
      icon: <BookOpen className='h-6 w-6' />,
      action: () => setPage(1),
    },
    {
      label: "Likes",
      value: `${user?.likedPosts?.length ?? 0}`,
      subLabel: "Liked articles",
      icon: <Heart className='h-6 w-6' />,
      action: () => console.log("Go to likes"),
    },
    {
      label: "Following",
      value: `${user?.following?.length ?? 0}`,
      subLabel: "Authors you follow",
      icon: <Users className='h-6 w-6' />,
      action: () => navigate("/following"),
    },
    ...(user?.role === "author"
      ? [
          {
            label: "Write Article",
            subLabel: "Publish a new post",
            icon: <Plus className='h-6 w-6' />,
            action: () => navigate("/create-post"),
          },
        ]
      : []),
  ];

  const pageCount = Math.ceil(savedArticles.length / pageSize);
  const displayedArticles = savedArticles.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  if (loading) {
    return (
      <div className='min-h-[60vh] flex items-center justify-center'>
        <div className='text-muted-foreground'>Loading profile...</div>
      </div>
    );
  }

  return (
    <div className='py-5'>
      <div className='mb-12 flex flex-col items-center text-center'>
        <div className='w-full h-48 md:h-64 rounded-xl overflow-hidden bg-muted border border-border relative'>
          {user?.coverPhoto ? (
            <img
              src={user.coverPhoto}
              alt='Profile Cover'
              className='w-full h-full object-cover'
            />
          ) : (
            <div className='w-full h-full bg-linear-to-r from-muted to-muted-foreground/20' />
          )}
        </div>

        <div className='-mt-13.5 md:-mt-17.5 z-10 bg-background p-1.5 rounded-full border border-background shadow-sm'>
          <Avatar className='h-24 w-24 md:h-32 md:w-32 border-2 border-border'>
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </div>

        <div className='mt-4 space-y-2 z-10 max-w-lg'>
          <h1 className='text-2xl md:text-3xl font-bold text-foreground'>
            {user?.name || "User Profile"}
          </h1>
          <p className='text-sm font-medium text-muted-foreground'>
            {user?.email}
          </p>
          <p className='text-muted-foreground text-sm md:text-base'>
            {user?.bio || "No bio provided"}
          </p>

          {/* button setting user */}
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button variant='outline' size='sm' className='mx-auto mt-2'>
                <Settings className='mr-2 h-4 w-4' />
                setting account
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-106.25 max-h-[90vh] overflow-y-auto'>
              <DialogHeader>
                <DialogTitle>Edit Profile Settings</DialogTitle>
                <DialogDescription>
                  Upload a new avatar or background cover from your system, and
                  edit your profile details. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSaveSettings} className='space-y-4 py-2'>
                <div className='space-y-2 text-left'>
                  <Label htmlFor='avatar'>Avatar Image</Label>
                  <div className='flex items-center gap-4'>
                    <Avatar className='h-12 w-12 border border-border'>
                      <AvatarImage
                        src={formData.avatarPreview || formData.avatar}
                        alt='Avatar preview'
                      />
                      <AvatarFallback>IMG</AvatarFallback>
                    </Avatar>
                    <Input
                      id='avatar'
                      type='file'
                      accept='image/*'
                      onChange={handleAvatarFileChange}
                      className='cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20'
                    />
                  </div>
                </div>

                <div className='space-y-2 text-left'>
                  <Label htmlFor='coverPhoto'>Background Banner Image</Label>
                  {(formData.coverPhotoPreview || formData.coverPhoto) && (
                    <div className='h-24 w-full rounded-lg overflow-hidden border border-border relative'>
                      <img
                        src={formData.coverPhotoPreview || formData.coverPhoto}
                        alt='Cover preview'
                        className='h-full w-full object-cover'
                      />
                    </div>
                  )}
                  <Input
                    id='coverPhoto'
                    type='file'
                    accept='image/*'
                    onChange={handleCoverPhotoFileChange}
                    className='cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20'
                  />
                </div>

                <div className='space-y-2 text-left'>
                  <Label htmlFor='name'>Name</Label>
                  <Input
                    id='name'
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder='Your name'
                  />
                </div>

                <div className='space-y-2 text-left'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    type='email'
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder='your.email@example.com'
                  />
                </div>

                <div className='space-y-2 text-left'>
                  <Label htmlFor='bio'>Bio</Label>
                  <Textarea
                    id='bio'
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    placeholder='Tell us a little bit about yourself'
                    rows={3}
                  />
                </div>

                <div className='space-y-2 text-left'>
                  <Label htmlFor='currentPassword'>Current Password</Label>
                  <Input
                    id='currentPassword'
                    type='password'
                    value={formData.currentPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder='Required if setting a new password'
                  />
                </div>

                <div className='space-y-2 text-left'>
                  <Label htmlFor='newPassword'>New Password</Label>
                  <Input
                    id='newPassword'
                    type='password'
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                    placeholder='Leave blank to keep current password'
                  />
                </div>

                <DialogFooter>
                  <Button type='submit' disabled={saving}>
                    {saving ? "Saving..." : "Save changes"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className='mx-auto flex items-center justify-center gap-8 flex-wrap'>
        {profileMenu.map((item, index) => (
          <Button
            key={index}
            variant='ghost'
            className='flex flex-col items-center h-auto py-6 px-10 hover:bg-muted/50 transition-all group'
            onClick={item.action}
          >
            <div className='mb-4 p-3 rounded-full bg-muted group-hover:bg-background group-hover:shadow-md transition-all text-primary'>
              {item.icon}
            </div>
            <div className='text-center space-y-1'>
              <span className='font-semibold block text-sm'>{item.label}</span>
              {item.value && (
                <span className='text-base font-bold text-foreground block'>
                  {item.value}
                </span>
              )}
              <span className='text-xs text-muted-foreground block font-normal leading-snug px-2'>
                {item.subLabel}
              </span>
            </div>
          </Button>
        ))}
      </div>

      <section className='mt-16'>
        <div className='flex flex-col gap-4 items-center md:items-start md:flex-row md:justify-between'>
          <div>
            <h2 className='text-2xl font-bold text-foreground'>
              Bookmarked articles
            </h2>
            <p className='text-sm text-muted-foreground mt-1'>
              {savedArticles.length > 0
                ? `Showing ${displayedArticles.length} of ${savedArticles.length} saved articles.`
                : "No bookmarked articles yet."}
            </p>
          </div>
          {pageCount > 1 && (
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              {Array.from({ length: pageCount }).map((_, index) => {
                const pageIndex = index + 1;
                return (
                  <button
                    key={pageIndex}
                    type='button'
                    onClick={() => setPage(pageIndex)}
                    className={`h-10 w-10 rounded-full border transition-colors ${
                      page === pageIndex
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-background text-foreground hover:bg-muted"
                    }`}
                  >
                    {pageIndex}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {savedLoading ? (
          <div className='text-center py-20'>
            <div className='text-muted-foreground'>Loading bookmarks...</div>
          </div>
        ) : savedArticles.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6'>
            {displayedArticles.map((post, idx) => (
              <PostCard
                key={post._id || post.id || `bookmark-${idx}`}
                post={post}
              />
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center py-20 bg-muted/30 rounded-lg border border-dashed mt-6'>
            <BookmarkX className='h-16 w-16 text-muted-foreground mb-4' />
            <h3 className='text-xl font-semibold mb-2'>No bookmarks yet</h3>
            <p className='text-muted-foreground text-center max-w-md'>
              You haven't bookmarked any articles yet. Start exploring and save
              your favorite posts!
            </p>
            <Button
              onClick={() => navigate("/")}
              className='mt-6'
              variant='outline'
            >
              Explore Articles
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;
