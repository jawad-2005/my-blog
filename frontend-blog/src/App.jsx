import { useRef, useEffect } from "react";
import { Toast } from "primereact/toast";

import { Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import BlogDetail from "./pages/BlogDetail";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import AuthorProfile from "./pages/AuthorProfile";
import Authors from "./pages/Authors";
import About from "./pages/About";
import Following from "./pages/Following";
import Category from "./pages/Category";
import BecomeAuthor from "./pages/BecomeAuthor";
import CreatePost from "./pages/CreatePost";
import AdminDashboard from "./pages/AdminDashboard";
import VerifyOtp from "./pages/VerifyOtp";

import axios from "axios";
import API_BASE from "@/lib/apiBase";
import { setCredentials, logout } from "./store/userSlice";

import "primereact/resources/themes/lara-light-cyan/theme.css"; // Or any other theme
import "primereact/resources/primereact.min.css"; // Core CSS
import "primeicons/primeicons.css"; // Icons

import { useDispatch, useSelector } from "react-redux";
import PrivateRoute from "./components/PrivateRoute";
import AuthorPage from "./pages/AuthorPage";

function App() {
  const toastRef = useRef(null);
  const toastData = useSelector((state) => state.ui?.toast);

  const dispatch = useDispatch();

  useEffect(() => {
    // Use the optional 'key' we added to the slice to trigger the effect
    if (toastData?.severity && toastRef.current) {
      toastRef.current.show({
        severity: toastData.severity,
        summary: toastData.summary,
        detail: toastData.detail,
        life: 4000,
      });
    }
  }, [toastData?.key]); // Dependency on the unique key

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // No need to manually send headers. Browser sends the cookie automatically.
        const res = await axios.get(`${API_BASE}/users/me`);
        dispatch(setCredentials(res.data.user));
      } catch (err) {
        dispatch(logout());
      }
    };
    verifyToken();
  }, [dispatch]);

  return (
    <>
      <Toast ref={toastRef} position='top-right' />
      <Navbar />
      <main className='py-10 px-4 '>
        <Routes>
          {/* Route 1: The Homepage */}
          <Route path='/' element={<Home />} />
          
          <Route path='/blog/:id' element={<BlogDetail />} />
          <Route path='/about' element={<About />} />
          <Route path='/category/:name' element={<Category />} />

          {/* Authentication Routes */}
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login />} />
          <Route path='/verify-email' element={<VerifyOtp />} />

          {/* Author Routes */}
          <Route path='/author' element={<AuthorPage />} />
          <Route path='/author/:authorId' element={<AuthorProfile />} />
          <Route path='/authors' element={<Authors />} />

          <Route
            path='/following'
            element={
              <PrivateRoute>
                <Following />
              </PrivateRoute>
            }
          />
          
          <Route
            path='/become-author'
            element={
              <PrivateRoute>
                <BecomeAuthor />
              </PrivateRoute>
            }
          />

          <Route
            path='/profile-user'
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          <Route
            path='/create-post'
            element={
              <PrivateRoute>
                <CreatePost />
              </PrivateRoute>
            }
          />

          <Route
            path='/admin'
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
