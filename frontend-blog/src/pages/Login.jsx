import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@shared/validation";

import axios from "axios";
import API_BASE from "@/lib/apiBase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/userSlice"; // Created in previous response
import { showToast } from "@/store/uiSlice";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  // 2. Initialize the Form
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  axios.defaults.withCredentials = true;
  //  Submit Handler
  const onSubmit = async (values) => {
    setServerError(""); // Clear previous errors
    try {
      const response = await axios.post(`${API_BASE}/users/login`, values);

      if (response.data.success) {
        dispatch(setCredentials(response.data.user));

        dispatch(
          showToast({
            severity: "success",
            summary: "Login Success",
            detail: `Welcome back, ${response.data.user.name}!`,
          }),
        );

        navigate("/");
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Login failed. Please check your connection.";

      // Update the red alert box in the UI
      setServerError(message);

      dispatch(
        showToast({
          severity: "error",
          summary: "Login Error",
          detail: message,
        }),
      );

      if (message.includes("verify your email")) {
        navigate("/verify-email", { state: { email: values.email } });
      }
    }
  };

  return (
    <div className='flex items-center justify-center min-h-[80vh] px-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl font-bold text-center'>
            Welcome back
          </CardTitle>
          <CardDescription className='text-center'>
            Enter your email to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 4. Wrap with shadcn Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              {serverError && (
                <div className='bg-destructive/15 text-destructive text-sm p-3 rounded-md text-center'>
                  {serverError}
                </div>
              )}

              {/* Email Input */}
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder='m@example.com' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Input */}
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-center justify-between'>
                      <FormLabel>Password</FormLabel>
                      <Link
                        to='#'
                        className='text-sm text-muted-foreground hover:underline'
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder='Enter your password'
                          {...field}
                        />
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className='h-4 w-4' />
                          ) : (
                            <Eye className='h-4 w-4' />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type='submit'
                className='w-full'
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                )}
                Sign In
              </Button>
            </form>
          </Form>



        </CardContent>
        <CardFooter>
          <div className='text-sm text-center w-full text-muted-foreground'>
            Don't have an account?{" "}
            <Link
              to='/register'
              className='text-primary hover:underline font-medium'
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
