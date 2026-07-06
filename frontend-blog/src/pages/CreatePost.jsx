import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE from "@/lib/apiBase";
import { showToast } from "../store/uiSlice";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ImagePlus, Loader2, X } from "lucide-react";

import PostContentEditor from "@/components/TiptapEditor";

const CATEGORIES = [
  { value: "ai", label: "AI" },
  { value: "technology", label: "Technology" },
  { value: "programming", label: "Programming" },
  { value: "education", label: "Education" },
  { value: "review", label: "Review" },
  { value: "introduction", label: "Introduction" },
];

const CreatePost = () => {
  const { userInfo } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [isSpecial, setIsSpecial] = useState("no");
  const [hashtags, setHashtags] = useState([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (userInfo?.role !== "author" && userInfo?.role !== "admin") {
    return (
      <div className='text-center py-20'>Access Denied. Authors only.</div>
    );
  }

  // Hashtag Management logic (unchanged)
  const addHashtag = (rawTag) => {
    const tag = rawTag.trim().replace(/^#/, "");
    if (!tag || hashtags.includes(tag) || hashtags.length >= 10) return;
    setHashtags((prev) => [...prev, tag]);
    setHashtagInput("");
  };

  const handleAddHashtag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addHashtag(hashtagInput);
    }
  };

  const removeHashtag = (tagToRemove) => {
    setHashtags(hashtags.filter((tag) => tag !== tagToRemove));
  };

  // send form data to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category) {
      dispatch(
        showToast({ severity: "error", detail: "Please select a category" }),
      );
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("content", content);
    formData.append("excerpt", excerpt);
    formData.append("isSpecial", isSpecial === "yes");
    formData.append("isFeatured", isSpecial === "yes");

    hashtags.forEach((tag) => formData.append("hashtags", tag));
    if (image) formData.append("image", image);

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };
      await axios.post(`${API_BASE}/posts`, formData, config);
      dispatch(
        showToast({ severity: "success", detail: "Published successfully!" }),
      );
      navigate("/");
    } catch (err) {
      dispatch(
        showToast({
          severity: "error",
          detail: err.response?.data?.message || "Failed to publish",
        }),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='max-w-5xl mx-auto py-12 px-4'>
      <h1 className='text-3xl font-bold mb-8'>Write New Article</h1>
      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Featured Image Upload (UI Logic remains same) */}
        <div className='border-2 border-dashed rounded-xl p-8 text-center bg-muted/30 hover:bg-muted/50 transition-colors'>
          {image ? (
            <div className='relative'>
              <img
                src={URL.createObjectURL(image)}
                alt='Preview'
                className='max-h-64 mx-auto rounded-lg mb-4 object-cover'
              />
              <Button
                type='button'
                variant='secondary'
                size='sm'
                onClick={() => setImage(null)}
              >
                <X className='w-4 h-4 mr-1' /> Remove
              </Button>
            </div>
          ) : (
            <Label
              htmlFor='post-img'
              className='cursor-pointer flex flex-col items-center'
            >
              <ImagePlus className='w-12 h-12 mb-2 opacity-50' />
              <span className='text-sm font-medium'>
                Click to upload featured image
              </span>
            </Label>
          )}
          <input
            id='post-img'
            type='file'
            className='hidden'
            accept='image/*'
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>

        {/* Title Input */}
        <div className='space-y-2'>
          <Label htmlFor='title'>
            Title <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='title'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='Enter an engaging title...'
            required
            maxLength={500}
          />
        </div>

        {/* Category and Special Status (Same) */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='category'>
              Category <span className='text-destructive'>*</span>
            </Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id='category'>
                <SelectValue placeholder='Select a category' />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='special'>Mark as Special Post</Label>
            <Select value={isSpecial} onValueChange={setIsSpecial}>
              <SelectTrigger id='special'>
                <SelectValue placeholder='No' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='no'>No</SelectItem>
                <SelectItem value='yes'>Yes ⭐</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Hashtags and Excerpt (Same) */}
        <div className='space-y-2'>
          <Label htmlFor='hashtags'>Hashtags</Label>
          <Input
            id='hashtags'
            value={hashtagInput}
            onChange={(e) => setHashtagInput(e.target.value)}
            onKeyDown={handleAddHashtag}
            placeholder='Add hashtags...'
          />
          <div className='flex flex-wrap gap-2 mt-2'>
            {hashtags.map((tag) => (
              <Badge key={tag} variant='secondary' className='gap-1'>
                #{tag}{" "}
                <X
                  className='w-3 h-3 cursor-pointer'
                  onClick={() => removeHashtag(tag)}
                />
              </Badge>
            ))}
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='excerpt'>Excerpt (Summary)</Label>
          <Textarea
            id='excerpt'
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder='Summary...'
            rows={3}
          />
        </div>

        <div className='space-y-2'>
          <Label>
            Content <span className='text-destructive'>*</span>
          </Label>
          <div className='rounded-lg border bg-background min-h-[400px]'>
            <PostContentEditor value={content} onChange={setContent} />
          </div>
        </div>

        <Button
          type='submit'
          className='w-full py-6 text-lg font-semibold'
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className='animate-spin mr-2' /> Publishing...
            </>
          ) : (
            "Publish Article"
          )}
        </Button>
      </form>
    </div>
  );
};

export default CreatePost;
