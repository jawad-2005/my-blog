import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@shared/validation";

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
import { showToast } from "@/store/uiSlice";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  //  Initialize Form/ state input
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  //  Submit Handler
  const onSubmit = async (values) => {
    setServerError(""); // Clear previous errors

    try {
      const response = await axios.post(`${API_BASE}/users/register`, values);

      if (response.data.success) {
        const previewUrl = response.data.previewUrl;
        dispatch(
          showToast({
            severity: "success",
            summary: "Registration Success",
            detail: previewUrl
              ? `OTP sent (test preview available).`
              : "OTP sent to your email!",
          }),
        );
        navigate("/verify-email", {
          state: { email: values.email, previewUrl: previewUrl || null },
        });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Registration failed.";
      dispatch(
        showToast({ severity: "error", summary: "Error", detail: errorMsg }),
      );
    }
  };

  return (
    <div className='flex items-center justify-center min-h-[80vh] px-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl font-bold text-center'>
            Create an account
          </CardTitle>
          <CardDescription className='text-center'>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              {/* Server Error Message */}
              {serverError && (
                <div className='bg-destructive/15 text-destructive text-sm p-3 rounded-md text-center'>
                  {serverError}
                </div>
              )}

              {/* Name Input */}
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder='John Doe' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Input */}
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='m@example.com'
                        type='email'
                        {...field}
                      />
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
                    <FormLabel>Password</FormLabel>
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
                            <EyeOff className='h-4 w-4 text-muted-foreground' />
                          ) : (
                            <Eye className='h-4 w-4 text-muted-foreground' />
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
                Create Account
              </Button>
            </form>
          </Form>


        </CardContent>
        <CardFooter>
          <div className='text-sm text-center w-full text-muted-foreground'>
            Already have an account?{" "}
            <Link
              to='/login'
              className='text-primary hover:underline font-medium'
            >
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
