import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Loader2, Mail } from "lucide-react";
import axios from "axios";
import API_BASE from "@/lib/apiBase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { useDispatch } from "react-redux";
import { showToast } from "@/store/uiSlice";

const VerifyOtp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from navigation state or allow fallback input
  const initialEmail = location.state?.email || "";
  const previewUrl = location.state?.previewUrl || null;

  const [emailInput, setEmailInput] = useState(initialEmail);
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // Timer State for "Resend Code"
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const verificationEmail = emailInput.trim();
    if (!verificationEmail) {
      setServerError(
        "Please enter the email address used during registration.",
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/users/verify-otp`, {
        email: verificationEmail,
        otp: value,
      });

      if (response.data.success) {
        dispatch(
          showToast({
            severity: "success",
            summary: "Account Verified",
            detail: "You can now log in!",
          }),
        );
        navigate("/login");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Invalid OTP";
      setServerError(message);
      dispatch(
        showToast({
          severity: "error",
          summary: "Verification Failed",
          detail: message,
        }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Resend Click
  const handleResend = () => {
    // You would typically call an axios.post("/api/users/resend-otp", { email }) here
    setTimeLeft(30);
    setCanResend(false);
    alert("Check your email for a new code!");
  };

  return (
    <div className='flex items-center justify-center min-h-[80vh] px-4'>
      <Card className='w-full max-w-md text-center'>
        <CardHeader>
          <div className='flex justify-center mb-4'>
            <div className='p-3 bg-muted rounded-full'>
              <Mail className='h-6 w-6 text-primary' />
            </div>
          </div>
          <CardTitle className='text-2xl'>Verify your email</CardTitle>
          <CardDescription>
            We have sent a 6-digit code to{" "}
            <strong>{emailInput || "your email"}</strong>.
            <br />
            Enter it below to confirm your account.
          </CardDescription>
          {previewUrl && (
            <div className='mt-3 text-sm text-muted-foreground'>
              Test preview available:
              <a
                href={previewUrl}
                target='_blank'
                rel='noreferrer'
                className='text-primary underline'
              >
                Open email
              </a>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className='flex flex-col items-center space-y-6'
          >
            {/* Show error from backend if OTP is wrong or expired */}
            {serverError && (
              <div className='bg-destructive/15 text-destructive text-sm p-3 rounded-md w-full'>
                {serverError}
              </div>
            )}

            <div className='w-full space-y-2'>
              <Label>Email</Label>
              <Input
                type='email'
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder='you@example.com'
                required
              />
            </div>

            <InputOTP
              maxLength={6}
              value={value}
              onChange={(val) => setValue(val)}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>

            <Button
              type='submit'
              className='w-full'
              disabled={value.length < 6 || isLoading}
            >
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Verify Account
            </Button>
          </form>
        </CardContent>

        <CardFooter className='flex flex-col gap-4'>
          <div className='text-sm text-muted-foreground'>
            Didn't receive the code?{" "}
            <button
              onClick={handleResend}
              disabled={!canResend}
              className={`font-medium underline-offset-4 ${
                canResend
                  ? "text-primary hover:underline cursor-pointer"
                  : "text-muted-foreground/50 cursor-not-allowed"
              }`}
            >
              {canResend ? "Resend" : `Resend in ${timeLeft}s`}
            </button>
          </div>

          <Link
            to='/login'
            className='text-sm text-muted-foreground hover:text-foreground flex items-center gap-1'
          >
            ← Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyOtp;
