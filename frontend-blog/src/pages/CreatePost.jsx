import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
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

const CATEGORIES = [
  { value: "ai", label: "AI" },
  { value: "technology", label: "Technology" },
  { value: "programming", label: "Programming" },
  { value: "education", label: "Education" },
  { value: "review", label: "Review" },
  { value: "introduction", label: "Introduction" },
];

// Custom Upload Adapter for CKEditor Images
class MyUploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }

  upload() {
    return this.loader.file.then(
      (file) =>
        new Promise((resolve, reject) => {
          const data = new FormData();
          data.append("image", file);

          const token = localStorage.getItem("token");

          axios
            .post(`${API_BASE}/upload/editor-image`, data, {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
              },
            })
            .then((response) => {
              resolve({
                default: response.data.url,
              });
            })
            .catch((error) => {
              reject(error);
            });
        }),
    );
  }

  abort() {
    // Handle abort
  }
}

function MyCustomUploadAdapterPlugin(editor) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
    return new MyUploadAdapter(loader);
  };
}

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

  // Check permissions
  if (userInfo?.role !== "author" && userInfo?.role !== "admin") {
    return (
      <div className='text-center py-20'>Access Denied. Authors only.</div>
    );
  }

  // Enhanced CKEditor Configuration with Image Upload
  const editorConfiguration = {
    extraPlugins: [MyCustomUploadAdapterPlugin],
    placeholder: "Start writing your story here...",
    toolbar: {
      items: [
        "heading",
        "|",
        "fontSize",
        "fontFamily",
        "fontColor",
        "fontBackgroundColor",
        "|",
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "|",
        "alignment",
        "|",
        "numberedList",
        "bulletedList",
        "|",
        "outdent",
        "indent",
        "|",
        "link",
        "imageUpload",
        "blockQuote",
        "insertTable",
        "mediaEmbed",
        "|",
        "code",
        "codeBlock",
        "|",
        "horizontalLine",
        "|",
        "undo",
        "redo",
      ],
    },
    fontSize: {
      options: [9, 11, 13, "default", 17, 19, 21, 23, 25, 27],
    },
    fontFamily: {
      options: [
        "default",
        "Arial, Helvetica, sans-serif",
        "Courier New, Courier, monospace",
        "Georgia, serif",
        "Lucida Sans Unicode, Lucida Grande, sans-serif",
        "Tahoma, Geneva, sans-serif",
        "Times New Roman, Times, serif",
        "Trebuchet MS, Helvetica, sans-serif",
        "Verdana, Geneva, sans-serif",
      ],
    },
    heading: {
      options: [
        {
          model: "paragraph",
          title: "Paragraph",
          class: "ck-heading_paragraph",
        },
        {
          model: "heading1",
          view: "h1",
          title: "Heading 1",
          class: "ck-heading_heading1",
        },
        {
          model: "heading2",
          view: "h2",
          title: "Heading 2",
          class: "ck-heading_heading2",
        },
        {
          model: "heading3",
          view: "h3",
          title: "Heading 3",
          class: "ck-heading_heading3",
        },
        {
          model: "heading4",
          view: "h4",
          title: "Heading 4",
          class: "ck-heading_heading4",
        },
      ],
    },
    image: {
      toolbar: [
        "imageTextAlternative",
        "imageStyle:inline",
        "imageStyle:block",
        "imageStyle:side",
        "linkImage",
      ],
    },
    table: {
      contentToolbar: [
        "tableColumn",
        "tableRow",
        "mergeTableCells",
        "tableCellProperties",
        "tableProperties",
      ],
    },
  };

  // Hashtag Management
  const addHashtag = (rawTag) => {
    const tag = rawTag.trim().replace(/^#/, "");

    if (!tag || hashtags.includes(tag) || hashtags.length >= 10) {
      return;
    }

    setHashtags((prev) => [...prev, tag]);
    setHashtagInput("");
  };

  const handleAddHashtag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addHashtag(hashtagInput);
    }
  };

  const handleHashtagBlur = () => {
    if (hashtagInput.trim()) {
      addHashtag(hashtagInput);
    }
  };

  const removeHashtag = (tagToRemove) => {
    setHashtags(hashtags.filter((tag) => tag !== tagToRemove));
  };

  // Form Submission
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

    hashtags.forEach((tag) => {
      formData.append("hashtags", tag);
    });

    if (image) {
      formData.append("image", image);
    }

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
      console.error(err.response?.data);
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
        {/* Featured Image Upload */}
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
                <X className='w-4 h-4 mr-1' />
                Remove
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
              <span className='text-xs text-muted-foreground mt-1'>
                PNG, JPG up to 10MB
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

        {/* Title */}
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
          <p className='text-xs text-muted-foreground'>
            {title.length}/500 characters
          </p>
        </div>

        {/* Category and Special Status */}
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
                <SelectValue placeholder='Is this a special post?' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='no'>No</SelectItem>
                <SelectItem value='yes'>Yes ⭐</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Hashtags */}
        <div className='space-y-2'>
          <Label htmlFor='hashtags'>
            Hashtags (Press Enter or comma to add)
          </Label>
          <Input
            id='hashtags'
            value={hashtagInput}
            onChange={(e) => setHashtagInput(e.target.value)}
            onKeyDown={handleAddHashtag}
            onBlur={handleHashtagBlur}
            placeholder='Add hashtags... (max 10)'
            disabled={hashtags.length >= 10}
          />
          {hashtags.length > 0 && (
            <div className='flex flex-wrap gap-2 mt-3'>
              {hashtags.map((tag) => (
                <Badge
                  key={tag}
                  variant='secondary'
                  className='flex items-center gap-1 px-3 py-1.5 text-sm'
                >
                  #{tag}
                  <button
                    type='button'
                    onClick={() => removeHashtag(tag)}
                    className='ml-1 hover:text-destructive transition-colors'
                  >
                    <X className='w-3 h-3' />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <p className='text-xs text-muted-foreground'>
            {hashtags.length}/10 hashtags added
          </p>
        </div>

        {/* Excerpt */}
        <div className='space-y-2'>
          <Label htmlFor='excerpt'>Excerpt (Short Summary)</Label>
          <Textarea
            id='excerpt'
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder='Write a brief summary of your article...'
            rows={3}
            maxLength={1000}
          />
          <p className='text-xs text-muted-foreground'>
            {excerpt.length}/1000 characters
          </p>
        </div>

        {/* Main Content (CKEditor) */}
        <div className='space-y-2'>
          <Label>
            Content <span className='text-destructive'>*</span>
          </Label>
          <div className='ckeditor-wrapper rounded-lg border overflow-hidden bg-background'>
            <CKEditor
              editor={ClassicEditor}
              data={content}
              config={editorConfiguration}
              onChange={(event, editor) => {
                const data = editor.getData();
                setContent(data);
              }}
            />
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
