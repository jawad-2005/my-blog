import { RichTextProvider } from "reactjs-tiptap-editor";
import "reactjs-tiptap-editor/style.css";

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

const editorExtensions = [
  Document,
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
  CodeBlock,
  History,
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
          <RichTextBold />
          <RichTextItalic />
          <RichTextUnderline />
          <RichTextStrike />
          <RichTextBulletList />
          <RichTextOrderedList />
          <RichTextBlockquote />
          <RichTextLink />
          <RichTextCode />
          <RichTextCodeBlock />
          <RichTextUndo />
          <RichTextRedo />
        </div>

        <EditorContent editor={editor} />
      </RichTextProvider>
    </div>
  );
}
