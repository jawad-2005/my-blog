import { RichTextProvider } from "reactjs-tiptap-editor";
import "reactjs-tiptap-editor/style.css";
import "react-image-crop/dist/ReactCrop.css";

import { EditorContent, useEditor } from "@tiptap/react";
import { Document } from "@tiptap/extension-document";
import { Text } from "@tiptap/extension-text";
import { Paragraph } from "@tiptap/extension-paragraph";
import {
  Dropcursor,
  Gapcursor,
  Placeholder,
  TrailingNode,
} from "@tiptap/extensions";
import { HardBreak } from "@tiptap/extension-hard-break";
import { TextStyle } from "@tiptap/extension-text-style";
import { ListItem } from "@tiptap/extension-list";

import { common, createLowlight } from "lowlight";

import { Bold, RichTextBold } from "reactjs-tiptap-editor/bold";
import { Italic, RichTextItalic } from "reactjs-tiptap-editor/italic";
import {
  TextUnderline,
  RichTextUnderline,
} from "reactjs-tiptap-editor/textunderline";
import { Strike, RichTextStrike } from "reactjs-tiptap-editor/strike";
import { Heading, RichTextHeading } from "reactjs-tiptap-editor/heading";
import {
  BulletList,
  RichTextBulletList,
} from "reactjs-tiptap-editor/bulletlist";
import {
  OrderedList,
  RichTextOrderedList,
} from "reactjs-tiptap-editor/orderedlist";
import {
  Blockquote,
  RichTextBlockquote,
} from "reactjs-tiptap-editor/blockquote";
import { Link, RichTextLink } from "reactjs-tiptap-editor/link";
import { Code, RichTextCode } from "reactjs-tiptap-editor/code";
import { CodeBlock, RichTextCodeBlock } from "reactjs-tiptap-editor/codeblock";
import {
  History,
  RichTextUndo,
  RichTextRedo,
} from "reactjs-tiptap-editor/history";

// New extensions
import { Image, RichTextImage } from "reactjs-tiptap-editor/image";
import { Video, RichTextVideo } from "reactjs-tiptap-editor/video";
import { Color, RichTextColor } from "reactjs-tiptap-editor/color";
import { Highlight, RichTextHighlight } from "reactjs-tiptap-editor/highlight";
import {
  Column,
  ColumnNode,
  MultipleColumnNode,
  RichTextColumn,
} from "reactjs-tiptap-editor/column";
import { Table, RichTextTable } from "reactjs-tiptap-editor/table";
import {
  SearchAndReplace,
  RichTextSearchAndReplace,
} from "reactjs-tiptap-editor/searchandreplace";
import {
  FontFamily,
  RichTextFontFamily,
} from "reactjs-tiptap-editor/fontfamily";

import axios from "axios";
import API_BASE from "@/lib/apiBase";

const lowlight = createLowlight(common);

// Important for columns
const DocumentColumn = Document.extend({
  content: "(block|columns)+",
});

const uploadEditorMedia = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await axios.post(`${API_BASE}/uploads/editor`, formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return data.url;
};

const editorExtensions = [
  // Use DocumentColumn instead of normal Document because of column support
  DocumentColumn,

  Text,
  Paragraph,
  HardBreak,
  Dropcursor,
  Gapcursor,
  TrailingNode,
  ListItem,
  TextStyle,

  Placeholder.configure({
    placeholder: "Write your story using modern Tiptap editor...",
  }),

  Bold,
  Italic,
  TextUnderline,
  Strike,
  Heading,
  BulletList,
  OrderedList,
  Blockquote,

  Link.configure({
    openOnClick: false,
  }),

  Code,

  CodeBlock.configure({
    lowlight,
  }),

  History,

  Color.configure({
    defaultColor: "#111827",
    colors: [
      "#000000",
      "#111827",
      "#374151",
      "#6b7280",
      "#ef4444",
      "#f97316",
      "#eab308",
      "#22c55e",
      "#06b6d4",
      "#3b82f6",
      "#6366f1",
      "#a855f7",
      "#ec4899",
    ],
  }),

  Highlight.configure({
    defaultColor: "#fef08a",
  }),

  FontFamily.configure({
    fontFamilyList: [
      { name: "Default", value: "Default" },
      { name: "Arial", value: "Arial" },
      { name: "Georgia", value: "Georgia" },
      { name: "Times New Roman", value: "Times New Roman" },
      { name: "Verdana", value: "Verdana" },
      { name: "Tahoma", value: "Tahoma" },
      { name: "Courier New", value: "Courier New" },
      { name: "Roboto", value: "Roboto" },
      { name: "Inter", value: "Inter" },
    ],
  }),

  Image.configure({
    resourceImage: "both",
    defaultInline: false,
    enableAlt: true,
    multiple: true,
    maxSize: 5 * 1024 * 1024,
    acceptMimes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    upload: uploadEditorMedia,
    onError: ({ message }) => {
      console.error("Image upload error:", message);
    },
  }),

  Video.configure({
    resourceVideo: "both",
    width: "100%",
    videoProviders: [".", "youtube", "youtu.be", "vimeo"],
    upload: uploadEditorMedia,
  }),

  Column,
  ColumnNode,
  MultipleColumnNode,

  Table.configure({
    resizable: true,
  }),

  SearchAndReplace.configure({
    searchResultClass: "search-result",
    disableRegex: true,
  }),
];

export default function PostContentEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: editorExtensions,
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "min-h-[360px] p-4 focus:outline-none",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className='rounded-lg border bg-background overflow-hidden min-h-[400px]'>
      <RichTextProvider editor={editor}>
        <div className='flex flex-wrap gap-1 border-b p-2'>
          <RichTextHeading />

          <RichTextFontFamily />

          <RichTextBold />
          <RichTextItalic />
          <RichTextUnderline />
          <RichTextStrike />

          <RichTextColor />
          <RichTextHighlight />

          <RichTextBulletList />
          <RichTextOrderedList />
          <RichTextBlockquote />

          <RichTextLink />

          <RichTextImage />
          <RichTextVideo />

          <RichTextColumn />
          <RichTextTable />

          <RichTextCode />
          <RichTextCodeBlock />

          <RichTextSearchAndReplace />

          <RichTextUndo />
          <RichTextRedo />
        </div>

        <EditorContent editor={editor} />
      </RichTextProvider>
    </div>
  );
}
