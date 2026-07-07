export const purifyConfig = {
  ADD_TAGS: ["iframe", "video", "source"],
  ADD_ATTR: [
    "src",
    "type",
    "controls",
    "controlslist",
    "autoplay",
    "muted",
    "loop",
    "playsinline",
    "poster",
    "preload",
    "allow",
    "allowfullscreen",
    "webkitallowfullscreen",
    "mozallowfullscreen",
    "frameborder",
    "scrolling",
    "referrerpolicy",
    "width",
    "height",
    "style",
    "class",
    "data-video",
    "align",
    "alt",
    "flipx",
    "flipy",
  ],
};

const decodeHtmlEntities = (html = "") => {
  const textarea = document.createElement("textarea");
  let decoded = html;

  // Decode once or twice, useful if DB has &lt;p&gt; or &amp;quot;
  for (let i = 0; i < 2; i++) {
    textarea.innerHTML = decoded;
    const next = textarea.value;

    if (next === decoded) break;
    decoded = next;
  }

  return decoded;
};

const cleanMediaUrl = (src = "") => {
  let value = String(src).trim().replace(/\\/g, "");

  // If src became markdown link: [https://x](https://x)
  const markdownUrl = value.match(/\]\((https?:\/\/[^)\s]+)\)/i);
  if (markdownUrl?.[1]) return markdownUrl[1];

  // Otherwise get first real URL
  const firstUrl = value.match(/https?:\/\/[^\s\])"'<>]+/i);
  if (firstUrl?.[0]) return firstUrl[0];

  return value;
};

const isDirectVideoUrl = (src = "") => {
  return (
    /res\.cloudinary\.com\/.+\/video\/upload\/.+/i.test(src) ||
    /\.(mp4|webm|ogg)(\?.*)?$/i.test(src)
  );
};

export const normalizePostContent = (html = "") => {
  const decodedHtml = decodeHtmlEntities(html);
  const doc = new DOMParser().parseFromString(decodedHtml, "text/html");

  // 1. Fix broken/escaped URLs
  doc.querySelectorAll("img, iframe, video, source").forEach((el) => {
    let src = el.getAttribute("src");
    if (src) {
      // Remove backslashes and quotes that might have survived DB storage
      src = src.replace(/\\"/g, '"').replace(/"/g, "").trim();
      el.setAttribute("src", cleanMediaUrl(src));
    }
  });

  // 2. Convert MP4 iframes to Video Tags
  doc.querySelectorAll("iframe").forEach((iframe) => {
    const src = iframe.getAttribute("src") || "";

    if (isDirectVideoUrl(src)) {
      const video = doc.createElement("video");
      video.setAttribute("src", src);
      video.setAttribute("controls", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("preload", "metadata");
      video.setAttribute("width", "100%");
      // Add styling to ensure visibility
      video.style.display = "block";
      video.style.width = "100%";
      video.style.borderRadius = "8px";
      video.className = "blog-video";

      // Find the top-most wrapper (Tiptap usually adds .iframe-wrapper)
      const tiptapWrapper = iframe.closest(".iframe-wrapper");
      if (tiptapWrapper) {
        // Replace the entire Tiptap helper structure with just the video
        tiptapWrapper.replaceWith(video);
      } else {
        iframe.replaceWith(video);
      }
    } else {
      // Handle Youtube/Vimeo
      iframe.setAttribute("allowfullscreen", "true");
      iframe.style.width = "100%";
      iframe.style.aspectRatio = "16/9";
    }
  });

  return doc.body.innerHTML;
};
