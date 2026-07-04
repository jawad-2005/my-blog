import { useEffect, useState } from "react";

import axios from "axios";
import API_BASE from "@/lib/apiBase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Send } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "@/store/uiSlice";
import { useNavigate } from "react-router-dom";

const BecomeAuthor = () => {
  const dispatch = useDispatch();

  const handleToast = (severity, summary, detail) => {
    dispatch(showToast({ severity, summary, detail }));
  };

  const { userInfo } = useSelector((state) => state.user);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [role, setRole] = useState("user");
  const [formData, setFormData] = useState({
    portfolio: "",
    reason: "",
    sampleTitle: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/users/me`);
        if (data.success) {
          setRole(data.user.role);
          if (data.user.authorApplication?.status === "pending") {
            setIsPending(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user status", error);
      }
    };

    loadUser();
  }, []);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post(`${API_BASE}/users/apply-author`, {
        portfolio: formData.portfolio.trim(),
        reason: formData.reason.trim(),
        sampleTitle: formData.sampleTitle.trim(),
      });

      setIsSubmitted(true);
      setIsPending(true);
      handleToast("success", "Success", "Application submitted successfully!");
    } catch (error) {
      handleToast(
        "error",
        "Error",
        error.response?.data?.message || "Failed to submit application",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className='flex items-center justify-center min-h-[80vh] px-4'>
        <Card className='text-center py-10 w-full max-w-md'>
          <CardContent className='flex flex-col items-center gap-4'>
            <CheckCircle2 className='h-16 w-16 text-green-500' />
            <h2 className='text-2xl font-bold'>Request Sent!</h2>
            <p className='text-muted-foreground'>
              The General Manager will review your application. You will receive
              a notification once approved.
            </p>
            <Button
              variant='outline'
              onClick={() => navigate("/")}
              className='mt-4'
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className='flex items-center justify-center min-h-[80vh] px-4'>
        <Card className='text-center py-10 w-full max-w-md'>
          <CardContent className='flex flex-col items-center gap-4'>
            <CheckCircle2 className='h-16 w-16 text-yellow-500' />
            <h2 className='text-2xl font-bold'>Application Pending</h2>
            <p className='text-muted-foreground'>
              Your author request has already been submitted and is pending
              review. We will notify you once it is approved or rejected.
            </p>
            <Button
              variant='outline'
              onClick={() => navigate("/")}
              className='mt-4'
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='py-12 flex items-center justify-center min-h-[80vh] px-4'>
      <Card className='w-full max-w-lg'>
        <CardHeader>
          <CardTitle>Apply to become an Author</CardTitle>
          <CardDescription>
            Join our team of writers. Tell us why you want to write for us.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label>Portfolio / Website (Optional)</Label>
              <Input
                name='portfolio'
                value={formData.portfolio}
                onChange={handleChange}
                placeholder='https://your-portfolio.com'
              />
            </div>

            <div className='space-y-2'>
              <Label>Why do you want to write?</Label>
              <Textarea
                name='reason'
                value={formData.reason}
                onChange={handleChange}
                placeholder='I am an expert in React and I want to share my knowledge...'
                className='min-h-[150px]'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label>Sample Article Title</Label>
              <Input
                name='sampleTitle'
                value={formData.sampleTitle}
                onChange={handleChange}
                placeholder='e.g. 5 Tips for Better CSS'
                required
              />
            </div>

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? (
                "Submitting..."
              ) : (
                <>
                  <Send className='mr-2 h-4 w-4' /> Submit Application
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className='bg-muted/20 text-xs text-muted-foreground mt-4'>
          By clicking submit, you agree to our Writer Guidelines.
        </CardFooter>
      </Card>
    </div>
  );
};

export default BecomeAuthor;
