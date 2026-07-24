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

  const initialEmail = location.state?.email || "";

  const [emailInput, setEmailInput] = useState(initialEmail);
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false); // New state for resending loader
  const [serverError, setServerError] = useState("");

  // Timer State
  const [timeLeft, setTimeLeft] = useState(30);
  const canResend = timeLeft === 0;

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer); // Cleanup on unmount
  }, [timeLeft]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const verificationEmail = emailInput.trim();
    if (!verificationEmail) {
      setServerError("Please enter the email address.");
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
    } finally {
      setIsLoading(false);
    }
  };

  // --- RESEND OTP LOGIC ---
  const handleResend = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    try {
      // Replace with your actual backend endpoint
      await axios.post(`${API_BASE}/users/resend-otp`, {
        email: emailInput,
      });

      dispatch(
        showToast({
          severity: "success",
          summary: "OTP Sent",
          detail: "A new code has been sent to your email.",
        }),
      );

      // Reset timer
      setTimeLeft(30);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to resend OTP";
      dispatch(
        showToast({
          severity: "error",
          summary: "Error",
          detail: message,
        }),
      );
    } finally {
      setIsResending(false);
    }
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
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className='flex flex-col items-center space-y-6'
          >
            {serverError && (
              <div className='bg-destructive/15 text-destructive text-sm p-3 rounded-md w-full'>
                {serverError}
              </div>
            )}

            <div className='w-full space-y-2 text-left'>
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
              type='button'
              onClick={handleResend}
              disabled={!canResend || isResending}
              className={`font-medium transition-colors ${
                canResend && !isResending
                  ? "text-primary hover:underline cursor-pointer"
                  : "text-muted-foreground/50 cursor-not-allowed"
              }`}
            >
              {isResending ? (
                <span className='flex items-center gap-1'>
                  <Loader2 className='h-3 w-3 animate-spin' /> Sending...
                </span>
              ) : canResend ? (
                "Resend"
              ) : (
                `Resend in ${timeLeft}s`
              )}
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
