import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/userSlice";
import { showToast } from "@/store/uiSlice";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  User,
  Bookmark,
  LayoutDashboard,
  LogOut,
  Settings,
  PenTool,
} from "lucide-react";
import axios from "axios";
import API_BASE from "@/lib/apiBase";

const UserMenu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.user);

  const isAuthenticated = !!userInfo;
  const role = userInfo?.role;

  const handleLogout = async () => {
    try {
      await axios.get(`${API_BASE}/users/logout`); // Tell backend to clear cookie
      dispatch(logout()); //  Clear Redux and LocalStorage

      dispatch(
        showToast({
          severity: "success",
          summary: "Logged Out",
          detail: "You have been logged out successfully",
        }),
      );
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
      dispatch(
        showToast({
          severity: "error",
          summary: "Logged Out",
          detail: "server error try again",
        }),
      );
    }
  };

  // Determine the profile link based on user role
  const getProfileLink = () => {
    if (role === "admin") return "/admin";
    if (role === "author") return `/author/${userInfo?.id || userInfo?._id}`;
    return "/profile-user"; // normal user
  };

  // 1. If NOT logged in, show Login Button
  if (!isAuthenticated) {
    return (
      <Button asChild variant='default' size='sm'>
        <Link to='/login'>Log In</Link>
      </Button>
    );
  }

  // 2. If logged in, show Avatar with Dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='relative h-10 w-10 rounded-full outline-none'
        >
          <Avatar className='h-10 w-10 border'>
            <AvatarImage src={userInfo?.avatar} alt={userInfo?.name} />
            <AvatarFallback className='bg-primary text-primary-foreground'>
              {userInfo?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className='w-56' align='end' forceMount>
        {/* User Email Label */}
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>{userInfo?.name}</p>
            <p className='text-xs leading-none text-muted-foreground'>
              {userInfo?.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Dynamic Profile Link based on Role */}
        <DropdownMenuItem asChild>
          <Link
            to={getProfileLink()}
            className='cursor-pointer w-full flex items-center'
          >
            {role === "admin" ? (
              <LayoutDashboard className='mr-2 h-4 w-4' />
            ) : (
              <User className='mr-2 h-4 w-4' />
            )}
            <span>{role === "admin" ? "Admin Dashboard" : "Profile"}</span>
          </Link>
        </DropdownMenuItem>

        {/* Bookmark Link */}
        {role === "author" && (
          <DropdownMenuItem asChild>
            <Link
              to='/create-post'
              className='cursor-pointer w-full flex items-center'
            >
              <PenTool className='mr-2 h-4 w-4' />
              <span>Write Article</span>
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Logout Action */}
        <DropdownMenuItem
          onClick={handleLogout}
          className='cursor-pointer text-destructive focus:text-destructive flex items-center'
        >
          <LogOut className='mr-2 h-4 w-4' />
          <span>Logout account</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
