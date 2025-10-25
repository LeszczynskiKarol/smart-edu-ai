// src/components/Editor.tsx
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const QuillEditor = dynamic(() => import('react-quill'), { ssr: false });

interface EditorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ align: [] }],
    [{ color: [] }, { background: [] }],
    ['link', 'image'],
    ['clean'],
  ],
};

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'indent',
  'align',
  'color',
  'background',
  'link',
  'image',
];

export default function Editor({
  value = '',
  onChange,
  placeholder,
  className = '',
  readOnly = false,
}: EditorProps) {
  return (
    <div className={`quill-wrapper ${className}`}>
      <style jsx global>{`
        /* Lepsze spacing dla contentu w edytorze */
        .quill-wrapper .ql-editor {
          font-size: 16px;
          line-height: 1.8 !important;
          padding: 20px !important;
          min-height: 400px;
        }

        /* Spacing dla paragrafów */
        .quill-wrapper .ql-editor p {
          margin-bottom: 1em;
          line-height: 1.8;
        }

        /* Spacing dla nagłówków */
        .quill-wrapper .ql-editor h1 {
          font-size: 2em;
          margin-top: 0.8em;
          margin-bottom: 0.6em;
          line-height: 1.3;
          font-weight: 700;
        }

        .quill-wrapper .ql-editor h2 {
          font-size: 1.7em;
          margin-top: 0.7em;
          margin-bottom: 0.5em;
          line-height: 1.35;
          font-weight: 700;
        }

        .quill-wrapper .ql-editor h3 {
          font-size: 1.5em;
          margin-top: 0.6em;
          margin-bottom: 0.5em;
          line-height: 1.4;
          font-weight: 600;
        }

        .quill-wrapper .ql-editor h4 {
          font-size: 1.3em;
          margin-top: 0.5em;
          margin-bottom: 0.4em;
          line-height: 1.45;
          font-weight: 600;
        }

        .quill-wrapper .ql-editor h5 {
          font-size: 1.15em;
          margin-top: 0.4em;
          margin-bottom: 0.4em;
          line-height: 1.5;
          font-weight: 600;
        }

        .quill-wrapper .ql-editor h6 {
          font-size: 1em;
          margin-top: 0.4em;
          margin-bottom: 0.3em;
          line-height: 1.5;
          font-weight: 600;
        }

        /* Listy */
        .quill-wrapper .ql-editor ul,
        .quill-wrapper .ql-editor ol {
          margin-top: 0.5em;
          margin-bottom: 1em;
          padding-left: 1.5em;
        }

        .quill-wrapper .ql-editor li {
          margin-bottom: 0.4em;
          line-height: 1.7;
        }

        /* Blockquotes */
        .quill-wrapper .ql-editor blockquote {
          margin: 1.5em 0;
          padding: 1em 1.5em;
          border-left: 4px solid #ccc;
          background-color: #f9f9f9;
        }

        /* Dark mode styles */
        .dark .quill-wrapper .ql-toolbar {
          background-color: rgb(31 41 55);
          border-color: rgb(55 65 81);
          border-radius: 0.5rem 0.5rem 0 0;
        }

        .dark .quill-wrapper .ql-container {
          background-color: rgb(17 24 39);
          border-color: rgb(55 65 81);
          color: rgb(243 244 246);
          border-radius: 0 0 0.5rem 0.5rem;
        }

        .dark .quill-wrapper .ql-editor {
          color: rgb(243 244 246);
        }

        .dark .quill-wrapper .ql-editor.ql-blank::before {
          color: rgb(156 163 175);
        }

        .dark .quill-wrapper .ql-stroke {
          stroke: rgb(209 213 219);
        }

        .dark .quill-wrapper .ql-fill {
          fill: rgb(209 213 219);
        }

        .dark .quill-wrapper .ql-picker-label {
          color: rgb(209 213 219);
        }

        .dark .quill-wrapper .ql-picker-options {
          background-color: rgb(31 41 55);
          border-color: rgb(55 65 81);
        }

        .dark .quill-wrapper .ql-picker-item {
          color: rgb(209 213 219);
        }

        .dark .quill-wrapper .ql-picker-item:hover {
          background-color: rgb(55 65 81);
        }

        .dark .quill-wrapper .ql-toolbar button:hover,
        .dark .quill-wrapper .ql-toolbar button:focus,
        .dark .quill-wrapper .ql-toolbar button.ql-active,
        .dark .quill-wrapper .ql-toolbar .ql-picker-label:hover,
        .dark .quill-wrapper .ql-toolbar .ql-picker-label.ql-active {
          background-color: rgb(55 65 81);
        }

        .dark .quill-wrapper .ql-toolbar button:hover .ql-stroke,
        .dark .quill-wrapper .ql-toolbar button.ql-active .ql-stroke,
        .dark .quill-wrapper .ql-toolbar .ql-picker-label:hover .ql-stroke,
        .dark .quill-wrapper .ql-toolbar .ql-picker-label.ql-active .ql-stroke {
          stroke: rgb(96 165 250);
        }

        .dark .quill-wrapper .ql-toolbar button:hover .ql-fill,
        .dark .quill-wrapper .ql-toolbar button.ql-active .ql-fill,
        .dark .quill-wrapper .ql-toolbar .ql-picker-label:hover .ql-fill,
        .dark .quill-wrapper .ql-toolbar .ql-picker-label.ql-active .ql-fill {
          fill: rgb(96 165 250);
        }

        .dark .quill-wrapper .ql-editor blockquote {
          background-color: rgb(31 41 55);
          border-left-color: rgb(75 85 99);
        }

        /* Light mode toolbar */
        .quill-wrapper .ql-toolbar {
          background-color: rgb(249 250 251);
          border-radius: 0.5rem 0.5rem 0 0;
        }

        .quill-wrapper .ql-container {
          border-radius: 0 0 0.5rem 0.5rem;
        }

        /* Focus state */
        .quill-wrapper .ql-container.ql-snow {
          border: 1px solid rgb(209 213 219);
        }

        .dark .quill-wrapper .ql-container.ql-snow {
          border: 1px solid rgb(55 65 81);
        }

        .quill-wrapper:focus-within .ql-container.ql-snow {
          border-color: rgb(59 130 246);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .dark .quill-wrapper:focus-within .ql-container.ql-snow {
          border-color: rgb(96 165 250);
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
        }

        /* Scrollbar */
        .quill-wrapper .ql-editor::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .quill-wrapper .ql-editor::-webkit-scrollbar-track {
          background-color: rgb(243 244 246);
        }

        .dark .quill-wrapper .ql-editor::-webkit-scrollbar-track {
          background-color: rgb(17 24 39);
        }

        .quill-wrapper .ql-editor::-webkit-scrollbar-thumb {
          background-color: rgb(209 213 219);
          border-radius: 4px;
        }

        .dark .quill-wrapper .ql-editor::-webkit-scrollbar-thumb {
          background-color: rgb(75 85 99);
        }

        .quill-wrapper .ql-editor::-webkit-scrollbar-thumb:hover {
          background-color: rgb(156 163 175);
        }

        .dark .quill-wrapper .ql-editor::-webkit-scrollbar-thumb:hover {
          background-color: rgb(107 114 128);
        }
      `}</style>

      <QuillEditor
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </div>
  );
}
