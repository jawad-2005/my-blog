import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userInfo: JSON.parse(localStorage.getItem("userInfo")) || null,
    notifications: [],
    unreadCount: 0,
  },

  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem("userInfo", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.userInfo = null;
      state.notifications = [];
      state.unreadCount = 0;
      localStorage.removeItem("userInfo");
    },

    // ─── Bookmarks ───────────────────────────────────────────
    addBookmark: (state, action) => {
      if (!state.userInfo) return;
      const bookmarks = state.userInfo.bookmarks || [];
      if (!bookmarks.includes(action.payload)) {
        state.userInfo.bookmarks = [...bookmarks, action.payload];
        localStorage.setItem("userInfo", JSON.stringify(state.userInfo));
      }
    },
    removeBookmark: (state, action) => {
      if (!state.userInfo) return;
      state.userInfo.bookmarks = (state.userInfo.bookmarks || []).filter(
        (bookmark) => bookmark !== action.payload,
      );
      localStorage.setItem("userInfo", JSON.stringify(state.userInfo));
    },

    // ─── Liked Posts ─────────────────────────────────────────
    addLikedPost: (state, action) => {
      if (!state.userInfo) return;
      const likedPosts = state.userInfo.likedPosts || [];
      if (!likedPosts.includes(action.payload)) {
        state.userInfo.likedPosts = [...likedPosts, action.payload];
        localStorage.setItem("userInfo", JSON.stringify(state.userInfo));
      }
    },
    removeLikedPost: (state, action) => {
      if (!state.userInfo) return;
      state.userInfo.likedPosts = (state.userInfo.likedPosts || []).filter(
        (likedPost) => likedPost !== action.payload,
      );
      localStorage.setItem("userInfo", JSON.stringify(state.userInfo));
    },

    // ─── Following ───────────────────────────────────────────
    addFollowing: (state, action) => {
      // action.payload = authorId (string)
      if (!state.userInfo) return;
      const following = state.userInfo.following || [];
      if (!following.includes(action.payload)) {
        state.userInfo.following = [...following, action.payload];
        localStorage.setItem("userInfo", JSON.stringify(state.userInfo));
      }
    },
    removeFollowing: (state, action) => {
      if (!state.userInfo) return;
      state.userInfo.following = (state.userInfo.following || []).filter(
        (id) => id !== action.payload,
      );
      localStorage.setItem("userInfo", JSON.stringify(state.userInfo));
    },

    // ─── Notifications ───────────────────────────────────────
    setNotifications: (state, action) => {
      state.notifications = action.payload.notifications;
      state.unreadCount = action.payload.unreadCount;
    },
    clearUnreadCount: (state) => {
      state.unreadCount = 0;
      state.notifications = state.notifications.map((n) => ({
        ...n,
        read: true,
      }));
    },
  },
});

export const {
  setCredentials,
  logout,
  addBookmark,
  removeBookmark,
  addLikedPost,
  removeLikedPost,
  addFollowing,
  removeFollowing,
  setNotifications,
  clearUnreadCount,
} = userSlice.actions;
export default userSlice.reducer;
