import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bell, X } from "lucide-react";
import { setNotifications, clearUnreadCount } from "@/store/userSlice";
import { showToast } from "@/store/uiSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import API_BASE from "@/lib/apiBase";

const NotificationBell = () => {
  const dispatch = useDispatch();

  const { userInfo, notifications, unreadCount } = useSelector(
    (state) => state.user,
  );
  const [open, setOpen] = useState(false);

  // Fetch notifications on mount
  useEffect(() => {
    if (!userInfo) return;
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_BASE}/users/notifications`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          dispatch(
            setNotifications({
              notifications: data.notifications,
              unreadCount: data.unreadCount,
            }),
          );
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };
    fetchNotifications();
  }, [userInfo, dispatch]);

  // Mark as read when opening the panel
  const handleOpenPanel = async () => {
    setOpen(!open);
    if (!open && unreadCount > 0) {
      try {
        await fetch(`${API_BASE}/users/notifications/read`, {
          method: "PUT",
          credentials: "include",
        });
        dispatch(clearUnreadCount());
      } catch (error) {
        console.error("Failed to mark notifications as read:", error);
      }
    }
  };

  if (!userInfo) return null;

  return (
    <div className='relative'>
      {/* Bell Icon Button */}
      <button
        onClick={handleOpenPanel}
        className='relative p-2 rounded-full hover:bg-muted transition-colors'
        aria-label='Notifications'
      >
        <Bell className='w-5 h-5' />
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className='absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full'>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className='absolute -right-28 md:right-0  mt-2 w-[92vw] sm:w-96 bg-background border border-border rounded-2xl shadow-xl z-50 overflow-hidden'>
          <div className='px-4 py-3 border-b border-border flex items-center justify-between'>
            <h3 className='font-semibold text-sm'>Notifications</h3>
            <span className='text-xs text-muted-foreground'>
              {notifications.length} total
            </span>
          </div>

          <div className='max-h-[60vh] sm:max-h-96 overflow-y-auto divide-y divide-border'>
            {notifications.length === 0 ? (
              <div className='py-10 text-center text-muted-foreground text-sm'>
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onNavigate={() => setOpen(false)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const NotificationItem = ({ notification, onNavigate }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      const res = await fetch(
        `${API_BASE}/users/notifications/${notification._id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (data.success) {
        dispatch(
          showToast({
            severity: "success",
            summary: "Deleted",
            detail: "Notification removed",
          }),
        );
        // Refresh notifications
        const notificationsRes = await fetch(
          `${API_BASE}/users/notifications`,
          {
            credentials: "include",
          },
        );
        const notificationsData = await notificationsRes.json();
        if (notificationsData.success) {
          dispatch(
            setNotifications({
              notifications: notificationsData.notifications,
              unreadCount: notificationsData.unreadCount,
            }),
          );
        }
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
      dispatch(
        showToast({
          severity: "error",
          summary: "Error",
          detail: "Failed to delete notification",
        }),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNotificationClick = () => {
    if (notification.type === "new_post" && notification.post?._id) {
      navigate(`/blog/${notification.post._id}`);
      onNavigate();
    } else if (notification.type === "follow" && notification.author?._id) {
      navigate(`/author/${notification.author._id}`);
      onNavigate();
    }
  };

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 transition-colors   hover:bg-muted/50 cursor-pointer group ${
        !notification.read ? "bg-primary/5" : ""
      }`}
      onClick={handleNotificationClick}
    >
      <Avatar className='h-8 w-8 mt-0.5'>
        <AvatarImage src={notification.author?.avatar} />
        <AvatarFallback className='text-xs bg-muted'>
          {notification.author?.name?.charAt(0) || "?"}
        </AvatarFallback>
      </Avatar>
      <div className='flex-1 min-w-0'>
        <p className='text-sm text-foreground leading-snug'>
          {notification.message}
        </p>
        <p className='text-[10px] text-muted-foreground mt-1'>
          {new Date(notification.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      <div className='flex items-center gap-2 flex-shrink-0'>
        {/* Unread dot */}
        {!notification.read && (
          <div className='w-2 h-2 rounded-full bg-primary flex-shrink-0' />
        )}
        {/* Delete button */}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className='opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded-md'
          aria-label='Delete notification'
        >
          <X className='w-4 h-4 text-muted-foreground hover:text-destructive' />
        </button>
      </div>
    </div>
  );
};

export default NotificationBell;
