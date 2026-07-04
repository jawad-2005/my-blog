import { useCallback, useEffect, useState } from "react";
import {
  Check,
  X,
  FileText,
  Trash2,
  LayoutDashboard,
  Users,
  UserCheck,
  ExternalLink,
  ChevronsUpDown,
  Globe,
  PanelLeft,
  TrendingUp,
  Eye,
  Book,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "@/store/uiSlice";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE from "@/lib/apiBase";

const AdminDashboard = () => {
  const dispatch = useDispatch();

  const handleToast = useCallback(
    (severity, summary, detail) => {
      dispatch(showToast({ severity, summary, detail }));
    },
    [dispatch],
  );

  const { userInfo } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("requests");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Live pending author requests
  const [requests, setRequests] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [siteStats, setSiteStats] = useState(null);

  useEffect(() => {
    if (userInfo?.role !== "admin") {
      navigate("/", { replace: true });
      return;
    }

    axios.defaults.withCredentials = true;

    const fetchDashboardData = async () => {
      try {
        const [requestsRes, authorsRes, usersRes, statsRes] = await Promise.all(
          [
            axios.get(`${API_BASE}/admin/author-requests`),
            axios.get(`${API_BASE}/admin/authors`),
            axios.get(`${API_BASE}/admin/users`),
            axios.get(`${API_BASE}/admin/site-stats`),
          ],
        );

        if (requestsRes.data.success) {
          setRequests(requestsRes.data.requests);
        }

        if (authorsRes.data.success) {
          setAuthors(authorsRes.data.authors);
        }

        if (usersRes.data.success) {
          setAllUsers(usersRes.data.users);
        }

        if (statsRes.data.success) {
          setSiteStats(statsRes.data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch admin dashboard data:", error);
        handleToast("error", "Error", "Could not load dashboard data.");
      }
    };

    fetchDashboardData();
  }, [handleToast, userInfo, navigate]);

  const handleApprove = async (id) => {
    try {
      await axios.put(`${API_BASE}/admin/author-requests/${id}`, {
        status: "approved",
      });
      setRequests((prev) => prev.filter((req) => req._id !== id));
      handleToast(
        "success",
        "Approved",
        "User has been approved as an author.",
      );
    } catch (error) {
      handleToast(
        "error",
        "Error",
        error.response?.data?.message || "Failed to approve request",
      );
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`${API_BASE}/admin/author-requests/${id}`, {
        status: "rejected",
      });
      setRequests((prev) => prev.filter((req) => req._id !== id));
      handleToast("error", "Rejected", "User request rejected.");
    } catch (error) {
      handleToast(
        "error",
        "Error",
        error.response?.data?.message || "Failed to reject request",
      );
    }
  };

  const handleDeletePost = async (authorId, postId) => {
    try {
      const { data } = await axios.delete(`${API_BASE}/admin/posts/${postId}`, {
        withCredentials: true,
      });

      if (data.success) {
        setAuthors((prevAuthors) =>
          prevAuthors.map((author) => {
            if (author._id === authorId) {
              return {
                ...author,
                posts: author.posts.filter((post) => post._id !== postId),
              };
            }
            return author;
          }),
        );
        handleToast("success", "Deleted", "Post deleted successfully.");
      }
    } catch (error) {
      handleToast(
        "error",
        "Error",
        error.response?.data?.message || "Failed to delete post",
      );
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const { data } = await axios.delete(`${API_BASE}/admin/users/${userId}`, {
        withCredentials: true,
      });

      if (data.success) {
        setAllUsers((prevUsers) =>
          prevUsers.filter((user) => user._id !== userId),
        );
        handleToast("success", "Deleted", "User account deleted successfully.");
      }
    } catch (error) {
      handleToast(
        "error",
        "Error",
        error.response?.data?.message || "Failed to delete user",
      );
    }
  };

  const menuItems = [
    {
      id: "analytics",
      label: "Site Analytics",
      icon: TrendingUp,
      badge: 0,
    },
    {
      id: "requests",
      label: "Author Requests",
      icon: UserCheck,
      badge: requests.length,
    },
    { id: "authors", label: "Manage Authors", icon: FileText },
    { id: "users", label: "All Users", icon: Users },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "analytics":
        return (
          <div className='space-y-6'>
            {/* Header */}
            <div>
              <h2 className='text-3xl font-bold tracking-tight'>
                Site Analytics
              </h2>
              <p className='text-muted-foreground mt-2'>
                View overall site statistics and top-performing articles
              </p>
            </div>

            {/* Stats Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              {/* Total Views */}
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Views
                  </CardTitle>
                  <Eye className='h-4 w-4 text-blue-600' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {siteStats?.totalViews || 0}
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>
                    All-time site views
                  </p>
                </CardContent>
              </Card>

              {/* Total Posts */}
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Articles
                  </CardTitle>
                  <FileText className='h-4 w-4 text-green-600' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {siteStats?.totalPosts || 0}
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Published articles
                  </p>
                </CardContent>
              </Card>

              {/* Total Authors */}
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Authors
                  </CardTitle>
                  <Book className='h-4 w-4 text-purple-600' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {siteStats?.totalAuthors || 0}
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Active writers
                  </p>
                </CardContent>
              </Card>

              {/* Total Users */}
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Users
                  </CardTitle>
                  <Users className='h-4 w-4 text-orange-600' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {siteStats?.totalUsers || 0}
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Registered members
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Top Articles Section */}
            <Card>
              <CardHeader>
                <CardTitle>Top Articles by Views</CardTitle>
                <CardDescription>
                  The 5 most viewed articles on your site
                </CardDescription>
              </CardHeader>
              <CardContent>
                {siteStats?.topArticles?.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-10 text-center'>
                    <FileText className='h-10 w-10 text-muted-foreground mb-4 opacity-50' />
                    <p className='text-muted-foreground'>
                      No articles published yet.
                    </p>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {siteStats?.topArticles?.map((article, index) => (
                      <div
                        key={article._id}
                        className='flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 last:border-0 last:pb-0 gap-3'
                      >
                        <div className='flex items-start gap-4 flex-1 min-w-0'>
                          {/* Rank Badge */}
                          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm flex-shrink-0 mt-0.5'>
                            #{index + 1}
                          </div>

                          {/* Content */}
                          <div className='min-w-0 flex-1'>
                            <h3 className='font-semibold text-foreground truncate'>
                              {article.title}
                            </h3>
                            <div className='flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap'>
                              <span className='flex items-center gap-1'>
                                <Avatar className='h-5 w-5'>
                                  <AvatarImage src={article.author?.avatar} />
                                  <AvatarFallback className='text-[10px]'>
                                    {article.author?.name?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                {article.author?.name}
                              </span>
                              <span>
                                {new Date(
                                  article.createdAt,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Views Count */}
                        <div className='flex items-center gap-2 sm:flex-col sm:items-end flex-shrink-0'>
                          <div className='flex items-center gap-1'>
                            <Eye className='h-4 w-4 text-blue-500' />
                            <span className='font-bold text-lg'>
                              {article.views || 0}
                            </span>
                          </div>
                          <span className='text-xs text-muted-foreground'>
                            views
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case "requests":
        return (
          <Card className='border-0 shadow-none sm:border sm:shadow-sm'>
            <CardHeader>
              <CardTitle>Author Requests</CardTitle>
              <CardDescription>
                Review users who want to become writers. Approve to change their
                role to "author".
              </CardDescription>
            </CardHeader>
            <CardContent className='grid gap-6'>
              {requests.length === 0 && (
                <div className='flex flex-col items-center justify-center py-10 text-center'>
                  <Check className='h-10 w-10 text-muted-foreground mb-4 opacity-50' />
                  <p className='text-muted-foreground'>
                    No pending requests right now.
                  </p>
                </div>
              )}

              {requests.map((req) => (
                <div
                  key={req._id}
                  className='flex flex-col md:flex-row items-start justify-between border p-5 rounded-lg bg-card shadow-sm gap-4'
                >
                  <div className='flex gap-4'>
                    <Avatar className='h-12 w-12'>
                      <AvatarImage src={req.avatar} />
                      <AvatarFallback>{req.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className='space-y-1'>
                      <h4 className='font-semibold text-lg flex items-center gap-2'>
                        {req.name}
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        {req.email}
                      </p>

                      <div className='bg-muted/50 p-4 rounded-md mt-3 space-y-2 text-sm max-w-2xl'>
                        <p>
                          <strong>Reason:</strong> "
                          {req.authorApplication.reason}"
                        </p>
                        <p>
                          <strong>Sample Title:</strong>{" "}
                          {req.authorApplication.sampleTitle}
                        </p>
                        {req.authorApplication.portfolio && (
                          <p>
                            <strong>Portfolio:</strong>{" "}
                            <a
                              href={req.authorApplication.portfolio}
                              target='_blank'
                              rel='noreferrer'
                              className='text-blue-500 hover:underline'
                            >
                              {req.authorApplication.portfolio}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className='flex gap-3 md:flex-col w-full md:w-auto mt-4 md:mt-0'>
                    <Button
                      className='flex-1 md:w-32 bg-green-600 hover:bg-green-700 text-white'
                      onClick={() => handleApprove(req._id)}
                    >
                      <Check className='h-4 w-4 mr-2' /> Approve
                    </Button>
                    <Button
                      variant='outline'
                      className='flex-1 md:w-32 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200'
                      onClick={() => handleReject(req._id)}
                    >
                      <X className='h-4 w-4 mr-2' /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );

      case "authors":
        return (
          <Card className='border-0 shadow-none sm:border sm:shadow-sm'>
            <CardHeader>
              <CardTitle>Authors & Published Articles</CardTitle>
              <CardDescription>
                View all authors on the site and manage their specific published
                articles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {authors.length === 0 && (
                <p className='text-muted-foreground'>No authors found.</p>
              )}

              <Accordion type='single' collapsible className='w-full'>
                {authors.map((author) => (
                  <AccordionItem key={author._id} value={author._id}>
                    <AccordionTrigger className='hover:no-underline hover:bg-muted/50 px-4 rounded-lg'>
                      <div className='flex items-center gap-4'>
                        <Avatar>
                          <AvatarImage src={author.avatar} />
                          <AvatarFallback>
                            {author.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className='text-left'>
                          <p className='font-semibold'>{author.name}</p>
                          <p className='text-xs text-muted-foreground font-normal'>
                            {author.email}
                          </p>
                        </div>
                        <Badge
                          variant='secondary'
                          className='ml-4 hidden sm:flex'
                        >
                          {author.posts.length} Articles
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className='pt-4 px-4'>
                      {author.posts.length === 0 ? (
                        <p className='text-sm text-muted-foreground py-2'>
                          This author hasn't published any articles yet.
                        </p>
                      ) : (
                        <div className='space-y-3'>
                          {author.posts.map((post) => (
                            <div
                              key={post._id}
                              className='flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 last:border-0 last:pb-0 gap-3'
                            >
                              <div className='flex items-center gap-3'>
                                <FileText className='h-4 w-4 text-muted-foreground' />
                                <div>
                                  <span className='font-medium'>
                                    {post.title}
                                  </span>
                                  <p className='text-xs text-muted-foreground'>
                                    {new Date(
                                      post.createdAt,
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                                <Badge
                                  variant={
                                    post.status === "published"
                                      ? "default"
                                      : "outline"
                                  }
                                  className='text-[10px] h-5'
                                >
                                  {post.status}
                                </Badge>
                              </div>
                              <div className='flex gap-2'>
                                <Button variant='ghost' size='sm' asChild>
                                  <Link
                                    to={`/blog/${post._id}`}
                                    target='_blank'
                                    rel='noreferrer'
                                  >
                                    <ExternalLink className='h-4 w-4 mr-2' />
                                    View
                                  </Link>
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='text-red-500 hover:text-red-700 hover:bg-red-50 w-fit'
                                  onClick={() =>
                                    handleDeletePost(author._id, post._id)
                                  }
                                >
                                  <Trash2 className='h-4 w-4 mr-2' />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        );

      case "users":
        return (
          <Card className='border-0 shadow-none sm:border sm:shadow-sm'>
            <CardHeader>
              <CardTitle>Registered Users</CardTitle>
              <CardDescription>
                View and manage all users who have signed up and logged into
                your site.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='rounded-md border'>
                <div className='grid grid-cols-12 gap-4 p-4 font-semibold border-b bg-muted/50 text-sm md:text-base'>
                  <div className='col-span-6 md:col-span-4'>User</div>
                  <div className='col-span-3 hidden md:block'>Email</div>
                  <div className='col-span-3'>Role</div>
                  <div className='col-span-3 md:col-span-2 text-right'>
                    Actions
                  </div>
                </div>
                <div className='divide-y'>
                  {allUsers.map((user) => (
                    <div
                      key={user._id}
                      className='grid grid-cols-12 gap-4 p-4 items-center text-sm'
                    >
                      <div className='col-span-6 md:col-span-4 flex items-center gap-3'>
                        <Avatar className='h-8 w-8'>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className='font-medium truncate'>
                          {user.name}
                        </span>
                      </div>
                      <div className='col-span-3 hidden md:block text-muted-foreground truncate'>
                        {user.email}
                      </div>
                      <div className='col-span-3'>
                        <Badge
                          variant={
                            user.role === "admin"
                              ? "destructive"
                              : user.role === "author"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {user.role}
                        </Badge>
                      </div>
                      <div className='col-span-3 md:col-span-2 text-right'>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='text-red-500 hover:text-red-700 hover:bg-red-50'
                          onClick={() => handleDeleteUser(user._id)}
                          disabled={user.role === "admin"}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className='flex h-[85vh] w-full overflow-hidden bg-background rounded-xl border shadow-lg relative'>
      {/* SIDEBAR (Dark Theme match requested by user) */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-0 opacity-0 hidden"} 
        transition-all duration-300 ease-in-out flex flex-col bg-[#09090b] text-zinc-400 border-r border-zinc-800 z-20 shrink-0`}
      >
        {/* Top Header */}
        <div className='flex items-center gap-3 p-4 hover:bg-zinc-900 cursor-pointer transition-colors mt-2 mx-2 rounded-lg'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shrink-0'>
            <LayoutDashboard className='h-5 w-5' />
          </div>
          <div className='flex flex-col text-left text-sm leading-tight overflow-hidden'>
            <span className='font-semibold text-zinc-50 truncate'>My Blog</span>
            <span className='text-xs text-zinc-400 truncate'>Enterprise</span>
          </div>
          <ChevronsUpDown className='ml-auto h-4 w-4 shrink-0' />
        </div>

        {/* Menu Sections */}
        <div className='flex-1 overflow-y-auto py-4 scrollbar-hide'>
          <div className='px-6 py-2 text-xs font-semibold text-zinc-500'>
            Platform
          </div>
          <nav className='grid gap-1 px-3'>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  activeTab === item.id
                    ? "bg-zinc-800 text-zinc-50 font-medium"
                    : "hover:bg-zinc-900 hover:text-zinc-50"
                }`}
              >
                <item.icon className='h-4 w-4 shrink-0' />
                <span className='truncate'>{item.label}</span>
                {item.badge > 0 && (
                  <span className='ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white'>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className='mt-6 px-6 py-2 text-xs font-semibold text-zinc-500'>
            Site
          </div>
          <nav className='grid gap-1 px-3'>
            <Link
              to='/'
              target='_blank'
              className='flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-zinc-900 hover:text-zinc-50'
            >
              <Globe className='h-4 w-4 shrink-0' />
              <span className='truncate'>View Live Site</span>
              <ExternalLink className='ml-auto h-3 w-3 opacity-50 shrink-0' />
            </Link>
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className='flex flex-1 flex-col overflow-hidden w-full relative bg-muted/10'>
        {/* Top Header inside Main Content */}
        <header className='flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6 shrink-0'>
          <Button
            variant='ghost'
            size='icon'
            className='text-muted-foreground h-8 w-8'
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <PanelLeft className='h-5 w-5' />
          </Button>
          <div className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
            Platform
            <span className='text-foreground'>
              / {menuItems.find((i) => i.id === activeTab)?.label}
            </span>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className='flex-1 overflow-y-auto p-4 md:p-6 lg:p-8'>
          <div className='mx-auto max-w-5xl'>{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
