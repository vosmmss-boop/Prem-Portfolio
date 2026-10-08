import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Superscript,
  Subscript,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Table as TableIcon,
  Minus,
  Quote,
  Code,
  Undo2,
  Redo2,
  Eraser,
  Maximize2,
  Minimize2,
  Search,
  FileCode,
  Palette,
  Highlighter,
  Type,
  Upload,
  RefreshCw,
  AlertTriangle,
  X,
  Check,
  Trash2,
  Plus,
  Columns,
  Rows,
  Sparkles,
  CheckSquare,
  ArrowUpDown
} from 'lucide-react';
import { UploadTask } from 'firebase/storage';
import {
  uploadImageToFirebaseStorage,
  formatFirebaseStorageError
} from '../../services/firebase';
import {
  normalizeContentToHtml,
  sanitizeRichHtml,
  stripHtmlToPlainText
} from '../../utils/htmlSanitizer';

export interface UniversalRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string | number;
  maxHeight?: string | number;
  disabled?: boolean;
  editable?: boolean;
  allowImages?: boolean;
  allowTables?: boolean;
  allowLinks?: boolean;
  showWordCount?: boolean;
  label?: string;
  isNepali?: boolean;
  storageFolder?: 'editor_images' | 'blog_covers' | 'gallery';
  draftKey?: string;
  onNotify?: (msg: string, type?: 'success' | 'warning' | 'error') => void;
}

const FONT_FAMILIES = [
  { label: 'Default (Jakarta)', value: "'Plus Jakarta Sans', sans-serif" },
  { label: 'Editorial (Cormorant)', value: "'Cormorant Garamond', Georgia, serif" },
  { label: 'Nepali (Mukta)', value: "'Mukta', sans-serif" },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
  { label: 'Courier New', value: "'Courier New', Courier, monospace" }
];

const FONT_SIZES = [
  { label: '12px', value: '12px' },
  { label: '14px', value: '14px' },
  { label: '16px', value: '16px' },
  { label: '18px', value: '18px' },
  { label: '20px', value: '20px' },
  { label: '24px', value: '24px' },
  { label: '28px', value: '28px' },
  { label: '32px', value: '32px' },
  { label: '36px', value: '36px' }
];

const BLOCK_TYPES = [
  { label: 'Normal Text', value: 'P' },
  { label: 'Heading 1', value: 'H1' },
  { label: 'Heading 2', value: 'H2' },
  { label: 'Heading 3', value: 'H3' },
  { label: 'Heading 4', value: 'H4' },
  { label: 'Heading 5', value: 'H5' },
  { label: 'Heading 6', value: 'H6' },
  { label: 'Blockquote', value: 'BLOCKQUOTE' },
  { label: 'Code Block', value: 'PRE' }
];

const TEXT_COLORS = [
  '#171717',
  '#047857',
  '#065f46',
  '#b45309',
  '#be123c',
  '#1d4ed8',
  '#6d28d9',
  '#525252',
  '#dc2626',
  '#0d9488'
];

const HIGHLIGHT_COLORS = [
  '#fef08a',
  '#bbf7d0',
  '#bae6fd',
  '#fecdd3',
  '#e9d5ff',
  '#fed7aa',
  '#e5e5e5'
];

const SPECIAL_CHARS = [
  'ॐ',
  'रू',
  '₹',
  '✓',
  '•',
  '°',
  '±',
  '×',
  '÷',
  '≥',
  '≤',
  '→',
  '←',
  '—',
  '–',
  '§',
  '©',
  '®',
  '™',
  '★',
  '♥',
  '॥',
  '।'
];

export const UniversalRichTextEditor: React.FC<UniversalRichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write formatted content here...',
  minHeight = 200,
  maxHeight = 560,
  disabled = false,
  editable = true,
  allowImages = true,
  allowTables = true,
  allowLinks = true,
  showWordCount = true,
  label,
  isNepali = false,
  storageFolder = 'editor_images',
  draftKey,
  onNotify
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceImageInputRef = useRef<HTMLInputElement | null>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const activeUploadTaskRef = useRef<UploadTask | null>(null);

  const isReadOnly = disabled || !editable;

  // UI Popovers & Modes
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [sourceCode, setSourceCode] = useState('');
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [findResultCount, setFindResultCount] = useState<number | null>(null);

  // Dropdown popovers
  const [activePopover, setActivePopover] = useState<
    null | 'color' | 'highlight' | 'link' | 'image' | 'table' | 'chars' | 'spacing'
  >(null);

  // Link dialog state
  const [linkUrl, setLinkUrl] = useState('https://');
  const [linkText, setLinkText] = useState('');

  // Image dialog & Firebase Storage upload state
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageAltInput, setImageAltInput] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  // Selected image inside editor for resizing / alignment / alt / deletion
  const [selectedImgEl, setSelectedImgEl] = useState<HTMLImageElement | null>(null);
  const [selectedImgAlt, setSelectedImgAlt] = useState('');

  // Selected table cell inside editor for contextual table operations
  const [activeTableCell, setActiveTableCell] = useState<HTMLTableCellElement | null>(null);
  const [tableRowsInput, setTableRowsInput] = useState(3);
  const [tableColsInput, setTableColsInput] = useState(3);

  // Undo / Redo internal history stack
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const lastEmittedValueRef = useRef<string>('');

  const pushHistory = useCallback((html: string) => {
    const stack = historyRef.current;
    const currentIdx = historyIndexRef.current;
    if (stack[currentIdx] === html) return;
    const nextStack = stack.slice(0, currentIdx + 1);
    nextStack.push(html);
    if (nextStack.length > 60) {
      nextStack.shift();
    }
    historyRef.current = nextStack;
    historyIndexRef.current = nextStack.length - 1;
  }, []);

  // Sync external `value` prop into the contentEditable DOM when changed externally
  useEffect(() => {
    const normalized = normalizeContentToHtml(value);
    if (editorRef.current && value !== lastEmittedValueRef.current) {
      if (editorRef.current.innerHTML !== normalized) {
        editorRef.current.innerHTML = normalized;
      }
      lastEmittedValueRef.current = value;
      setSourceCode(normalized);
      pushHistory(normalized);
    }
  }, [value, pushHistory]);

  // Handle Escape key in Fullscreen mode
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Save current cursor selection before clicking toolbar popovers
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current) {
      const range = sel.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        savedSelectionRef.current = range.cloneRange();
      }
    }
  };

  const restoreSelection = () => {
    if (savedSelectionRef.current && editorRef.current) {
      editorRef.current.focus();
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRef.current);
      }
    } else if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // Emit updated HTML to parent and optional localStorage draft safety key
  const emitChange = useCallback(
    (skipHistory = false) => {
      if (!editorRef.current) return;
      const rawHtml = editorRef.current.innerHTML;
      const cleaned = rawHtml === '<br>' ? '' : rawHtml;
      lastEmittedValueRef.current = cleaned;
      setSourceCode(cleaned);
      if (!skipHistory) {
        pushHistory(cleaned);
      }
      if (draftKey) {
        try {
          localStorage.setItem(`cms_editor_draft_${draftKey}`, cleaned);
        } catch {
          // ignore storage quota errors
        }
      }
      onChange(cleaned);
    },
    [onChange, pushHistory, draftKey]
  );

  // Execute standard document.execCommand with selection restoration
  const execFormat = (command: string, arg?: string) => {
    if (isReadOnly || isSourceMode) return;
    restoreSelection();
    try {
      document.execCommand('styleWithCSS', false, 'true');
    } catch {
      // ignore
    }
    document.execCommand(command, false, arg);
    saveSelection();
    emitChange();
  };

  // Undo & Redo handlers
  const handleUndo = () => {
    if (isReadOnly) return;
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const prevHtml = historyRef.current[historyIndexRef.current] || '';
      if (editorRef.current) {
        editorRef.current.innerHTML = prevHtml;
      }
      lastEmittedValueRef.current = prevHtml;
      setSourceCode(prevHtml);
      onChange(prevHtml);
    } else {
      document.execCommand('undo');
      emitChange(true);
    }
  };

  const handleRedo = () => {
    if (isReadOnly) return;
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const nextHtml = historyRef.current[historyIndexRef.current] || '';
      if (editorRef.current) {
        editorRef.current.innerHTML = nextHtml;
      }
      lastEmittedValueRef.current = nextHtml;
      setSourceCode(nextHtml);
      onChange(nextHtml);
    } else {
      document.execCommand('redo');
      emitChange(true);
    }
  };

  // Apply inline CSS style (such as exact px font-size or line-height) to selection or current block
  const applyInlineStyleToSelection = (styleProp: string, styleVal: string) => {
    if (isReadOnly || isSourceMode) return;
    restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    if (!range.collapsed) {
      const span = document.createElement('span');
      span.style.setProperty(styleProp, styleVal);
      try {
        span.appendChild(range.extractContents());
        range.insertNode(span);
        sel.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        sel.addRange(newRange);
        savedSelectionRef.current = newRange.cloneRange();
      } catch {
        // Fallback if range crosses multiple block boundaries
      }
    } else if (editorRef.current) {
      let node: Node | null = range.startContainer;
      if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentElement;
      }
      if (node && node instanceof HTMLElement && node !== editorRef.current) {
        node.style.setProperty(styleProp, styleVal);
      }
    }
    emitChange();
  };

  // Apply line-height or paragraph margin to current block element
  const applyBlockSpacing = (prop: 'line-height' | 'margin-bottom', val: string) => {
    if (isReadOnly || isSourceMode || !editorRef.current) return;
    restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    let node: Node | null = sel.getRangeAt(0).startContainer;
    while (node && node !== editorRef.current) {
      if (
        node instanceof HTMLElement &&
        /^(P|H[1-6]|DIV|LI|BLOCKQUOTE|TD|TH)$/i.test(node.tagName)
      ) {
        node.style.setProperty(prop, val);
        emitChange();
        setActivePopover(null);
        return;
      }
      node = node.parentNode;
    }

    // If directly inside editor root, wrap or apply to all paragraphs
    editorRef.current.querySelectorAll('p, li, blockquote').forEach((el) => {
      (el as HTMLElement).style.setProperty(prop, val);
    });
    emitChange();
    setActivePopover(null);
  };

  // Insert HTML snippet safely at cursor position
  const insertHtmlAtCursor = (htmlSnippet: string) => {
    if (isReadOnly || !editorRef.current) return;
    restoreSelection();
    document.execCommand('insertHTML', false, htmlSnippet);
    saveSelection();
    emitChange();
  };

  // Insert Hyperlink
  const handleInsertLink = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = linkUrl.trim();
    if (!cleanUrl || /^javascript:/i.test(cleanUrl)) return;

    const labelToUse = linkText.trim() || cleanUrl;
    const isExternal = cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://');
    const targetAttr = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
    const html = `<a href="${cleanUrl.replace(/"/g, '&quot;')}"${targetAttr}>${labelToUse
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')}</a>`;

    insertHtmlAtCursor(html);
    setLinkUrl('https://');
    setLinkText('');
    setActivePopover(null);
  };

  // Direct PC Image Upload to Firebase Storage (`editor_images/`)
  const handleEditorImageUpload = async (file: File, replaceTarget?: HTMLImageElement | null) => {
    setIsUploadingImage(true);
    setImageUploadProgress(1);
    setImageUploadError(null);

    try {
      const result = await uploadImageToFirebaseStorage(file, storageFolder, {
        maxSizeMB: 10,
        onProgress: (pct) => setImageUploadProgress(pct),
        onTaskCreated: (task) => {
          activeUploadTaskRef.current = task;
        }
      });

      const altText = (imageAltInput || file.name.replace(/\.[^/.]+$/, '') || 'Article image')
        .replace(/"/g, '&quot;');

      if (replaceTarget && editorRef.current?.contains(replaceTarget)) {
        replaceTarget.src = result.downloadURL;
        replaceTarget.alt = altText;
        emitChange();
      } else {
        const imgHtml = `<figure style="margin: 1rem 0; text-align: center;"><img src="${result.downloadURL}" alt="${altText}" style="max-width: 100%; height: auto; border-radius: 0.75rem; display: inline-block;" /></figure><p><br /></p>`;
        insertHtmlAtCursor(imgHtml);
      }

      setImageAltInput('');
      setImageUrlInput('');
      setActivePopover(null);
      if (onNotify) {
        onNotify('✓ Image uploaded to Firebase Storage and inserted into editor!', 'success');
      }
    } catch (err: any) {
      const formatted = formatFirebaseStorageError(err);
      if (!formatted.isCanceled) {
        setImageUploadError(formatted.message);
        if (onNotify) {
          onNotify(`⚠️ ${formatted.message}`, 'error');
        }
      }
    } finally {
      activeUploadTaskRef.current = null;
      setIsUploadingImage(false);
      setImageUploadProgress(0);
    }
  };

  const handleCancelEditorImageUpload = () => {
    if (activeUploadTaskRef.current) {
      try {
        activeUploadTaskRef.current.cancel();
      } catch {
        // ignore
      }
    }
    activeUploadTaskRef.current = null;
    setIsUploadingImage(false);
    setImageUploadProgress(0);
  };

  const handleInsertImageUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const url = imageUrlInput.trim();
    if (!url || /^javascript:/i.test(url)) return;
    const alt = (imageAltInput.trim() || 'Article image').replace(/"/g, '&quot;');
    const imgHtml = `<figure style="margin: 1rem 0; text-align: center;"><img src="${url.replace(
      /"/g,
      '&quot;'
    )}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 0.75rem; display: inline-block;" /></figure><p><br /></p>`;
    insertHtmlAtCursor(imgHtml);
    setImageUrlInput('');
    setImageAltInput('');
    setActivePopover(null);
  };

  // Selected image manipulation (resize, align, alt text, delete)
  const updateSelectedImageStyle = (widthPct?: string, align?: 'left' | 'center' | 'right') => {
    if (!selectedImgEl) return;
    if (widthPct) {
      selectedImgEl.style.width = widthPct;
      selectedImgEl.style.maxWidth = '100%';
      selectedImgEl.style.height = 'auto';
    }
    if (align) {
      const parentFigure = selectedImgEl.closest('figure');
      if (parentFigure) {
        parentFigure.style.textAlign = align;
      } else {
        selectedImgEl.style.display = 'block';
        selectedImgEl.style.marginLeft = align === 'center' || align === 'right' ? 'auto' : '0';
        selectedImgEl.style.marginRight = align === 'center' || align === 'left' ? 'auto' : '0';
      }
    }
    emitChange();
  };

  const handleDeleteSelectedImage = () => {
    if (!selectedImgEl) return;
    const parentFigure = selectedImgEl.closest('figure');
    if (parentFigure && parentFigure.parentElement) {
      parentFigure.remove();
    } else {
      selectedImgEl.remove();
    }
    setSelectedImgEl(null);
    emitChange();
  };

  // Table insertion & manipulation
  const handleInsertTable = (rows: number, cols: number) => {
    const rCount = Math.max(1, Math.min(20, rows));
    const cCount = Math.max(1, Math.min(10, cols));
    let html =
      '<table style="width: 100%; border-collapse: collapse; margin: 1rem 0;"><thead><tr>';
    for (let c = 0; c < cCount; c++) {
      html += `<th style="border: 1px solid #d4d4d4; padding: 8px 12px; background-color: #f5f5f5; font-weight: 700; text-align: left;">Header ${
        c + 1
      }</th>`;
    }
    html += '</tr></thead><tbody>';
    for (let r = 0; r < rCount - 1; r++) {
      html += '<tr>';
      for (let c = 0; c < cCount; c++) {
        html += '<td style="border: 1px solid #d4d4d4; padding: 8px 12px;"><br /></td>';
      }
      html += '</tr>';
    }
    html += '</tbody></table><p><br /></p>';
    insertHtmlAtCursor(html);
    setActivePopover(null);
  };

  const handleTableAction = (
    action:
      | 'addRowBelow'
      | 'addRowAbove'
      | 'addColRight'
      | 'addColLeft'
      | 'deleteRow'
      | 'deleteCol'
      | 'mergeRight'
      | 'splitCell'
      | 'deleteTable'
  ) => {
    if (!activeTableCell) return;
    const row = activeTableCell.parentElement as HTMLTableRowElement | null;
    const table = activeTableCell.closest('table') as HTMLTableElement | null;
    if (!row || !table) return;

    const colIndex = Array.from(row.cells).indexOf(activeTableCell);

    if (action === 'deleteTable') {
      table.remove();
      setActiveTableCell(null);
      emitChange();
      return;
    }

    if (action === 'addRowBelow' || action === 'addRowAbove') {
      const newRow = document.createElement('tr');
      const cellCount = row.cells.length;
      for (let i = 0; i < cellCount; i++) {
        const td = document.createElement('td');
        td.style.border = '1px solid #d4d4d4';
        td.style.padding = '8px 12px';
        td.innerHTML = '<br />';
        newRow.appendChild(td);
      }
      if (action === 'addRowBelow') {
        row.after(newRow);
      } else {
        row.before(newRow);
      }
    } else if (action === 'deleteRow') {
      const allRows = table.querySelectorAll('tr');
      if (allRows.length <= 1) {
        table.remove();
        setActiveTableCell(null);
      } else {
        row.remove();
        setActiveTableCell(null);
      }
    } else if (action === 'addColRight' || action === 'addColLeft') {
      table.querySelectorAll('tr').forEach((tr) => {
        const isHeader = tr.parentElement?.tagName.toLowerCase() === 'thead';
        const cell = document.createElement(isHeader ? 'th' : 'td');
        cell.style.border = '1px solid #d4d4d4';
        cell.style.padding = '8px 12px';
        if (isHeader) {
          cell.style.backgroundColor = '#f5f5f5';
          cell.style.fontWeight = '700';
          cell.textContent = 'Header';
        } else {
          cell.innerHTML = '<br />';
        }
        const refCell = tr.cells[colIndex] || tr.cells[tr.cells.length - 1];
        if (refCell) {
          if (action === 'addColRight') {
            refCell.after(cell);
          } else {
            refCell.before(cell);
          }
        } else {
          tr.appendChild(cell);
        }
      });
    } else if (action === 'deleteCol') {
      const firstRow = table.querySelector('tr');
      if (firstRow && firstRow.cells.length <= 1) {
        table.remove();
        setActiveTableCell(null);
      } else {
        table.querySelectorAll('tr').forEach((tr) => {
          if (tr.cells[colIndex]) {
            tr.cells[colIndex].remove();
          }
        });
        setActiveTableCell(null);
      }
    } else if (action === 'mergeRight') {
      const nextCell = activeTableCell.nextElementSibling as HTMLTableCellElement | null;
      if (nextCell) {
        const currentSpan = activeTableCell.colSpan || 1;
        const nextSpan = nextCell.colSpan || 1;
        activeTableCell.colSpan = currentSpan + nextSpan;
        if (nextCell.innerHTML && nextCell.innerHTML !== '<br>') {
          activeTableCell.innerHTML += ' ' + nextCell.innerHTML;
        }
        nextCell.remove();
      }
    } else if (action === 'splitCell') {
      const currentSpan = activeTableCell.colSpan || 1;
      if (currentSpan > 1) {
        activeTableCell.colSpan = currentSpan - 1;
        const newCell = document.createElement(activeTableCell.tagName.toLowerCase());
        newCell.style.border = '1px solid #d4d4d4';
        newCell.style.padding = '8px 12px';
        newCell.innerHTML = '<br />';
        activeTableCell.after(newCell);
      }
    }

    emitChange();
  };

  // Find & Replace inside editor content
  const handleFindCount = useCallback(
    (query: string, caseSensitive: boolean) => {
      if (!query || !editorRef.current) {
        setFindResultCount(null);
        return;
      }
      const text = editorRef.current.innerText || '';
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, caseSensitive ? 'g' : 'gi');
      const matches = text.match(regex);
      setFindResultCount(matches ? matches.length : 0);
    },
    []
  );

  const handleReplace = (replaceAll: boolean) => {
    if (!findQuery || !editorRef.current) return;
    const escaped = findQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, replaceAll ? (matchCase ? 'g' : 'gi') : matchCase ? '' : 'i');

    const walkTextNodes = (node: Node): boolean => {
      if (node.nodeType === Node.TEXT_NODE) {
        const val = node.nodeValue || '';
        if (regex.test(val)) {
          node.nodeValue = val.replace(regex, replaceQuery);
          if (!replaceAll) return true;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        for (const child of Array.from(node.childNodes)) {
          const stopped = walkTextNodes(child);
          if (stopped && !replaceAll) return true;
        }
      }
      return false;
    };

    walkTextNodes(editorRef.current);
    emitChange();
    handleFindCount(findQuery, matchCase);
  };

  // Clean paste from Microsoft Word / Google Docs (prevents base64 image bloat & unsafe scripts while preserving structure)
  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (isReadOnly) return;

    // 1. If user pastes an image file from clipboard, upload it directly to Firebase Storage!
    const items = e.clipboardData?.items;
    if (items && allowImages) {
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            await handleEditorImageUpload(file);
            return;
          }
        }
      }
    }

    // 2. If user pastes HTML (e.g. from Word or Google Docs), sanitize it cleanly
    const htmlData = e.clipboardData?.getData('text/html');
    if (htmlData && htmlData.trim()) {
      e.preventDefault();
      // Strip giant base64 data:image strings from pasted HTML so Realtime DB is never bloated
      const withoutBase64Images = htmlData.replace(
        /<img[^>]+src=["']data:image\/[^"']+["'][^>]*>/gi,
        ''
      );
      const sanitized = sanitizeRichHtml(withoutBase64Images);
      document.execCommand('insertHTML', false, sanitized);
      emitChange();
    }
  };

  // Keyboard shortcuts (Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+Z, Ctrl+Y, Tab for list indentation)
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isReadOnly) return;

    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        execFormat('outdent');
      } else {
        execFormat('indent');
      }
      return;
    }

    if (e.ctrlKey || e.metaKey) {
      const k = e.key.toLowerCase();
      if (k === 'f') {
        e.preventDefault();
        setShowFindReplace((prev) => !prev);
      } else if (k === 'z' && e.shiftKey) {
        e.preventDefault();
        handleRedo();
      }
    }
  };

  // Detect clicked image or table cell inside the editor
  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    saveSelection();
    const target = e.target as HTMLElement;

    if (target.tagName.toLowerCase() === 'img') {
      const img = target as HTMLImageElement;
      setSelectedImgEl(img);
      setSelectedImgAlt(img.alt || '');
    } else {
      setSelectedImgEl(null);
    }

    const cell = target.closest('td, th') as HTMLTableCellElement | null;
    if (cell && editorRef.current?.contains(cell)) {
      setActiveTableCell(cell);
    } else {
      setActiveTableCell(null);
    }
  };

  // Word & Character count calculation
  const plainText = stripHtmlToPlainText(value);
  const charCount = plainText.length;
  const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;

  return (
    <div
      className={`${
        isFullscreen
          ? 'fixed inset-2 sm:inset-4 z-50 bg-white rounded-2xl shadow-2xl border-2 border-emerald-700 flex flex-col overflow-hidden'
          : 'w-full flex flex-col'
      }`}
    >
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-neutral-700">
            {label}
          </label>
          {isFullscreen && (
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Minimize2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exit Fullscreen (Esc)</span>
            </button>
          )}
        </div>
      )}

      <div
        className={`bg-white border border-neutral-300 rounded-xl shadow-2xs flex flex-col ${
          isFullscreen ? 'flex-1 overflow-hidden' : ''
        }`}
      >
        {/* ============================================================
            MICROSOFT-WORD-STYLE RIBBON TOOLBAR
           ============================================================ */}
        <div className="bg-neutral-50 border-b border-neutral-200 p-2 flex flex-wrap items-center gap-1 text-xs select-none relative">
          {/* Undo / Redo */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleUndo}
            disabled={isReadOnly}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-700 disabled:opacity-40 cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleRedo}
            disabled={isReadOnly}
            title="Redo (Ctrl+Y)"
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-700 disabled:opacity-40 cursor-pointer"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-neutral-300 mx-0.5" />

          {/* Block / Heading Selector */}
          <select
            disabled={isReadOnly || isSourceMode}
            onChange={(e) => {
              execFormat('formatBlock', e.target.value);
            }}
            defaultValue="P"
            title="Paragraph / Heading Style"
            className="px-2 py-1 text-[11px] font-semibold bg-white border border-neutral-300 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
          >
            {BLOCK_TYPES.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>

          {/* Font Family Selector */}
          <select
            disabled={isReadOnly || isSourceMode}
            onChange={(e) => {
              applyInlineStyleToSelection('font-family', e.target.value);
            }}
            defaultValue={isNepali ? "'Mukta', sans-serif" : "'Plus Jakarta Sans', sans-serif"}
            title="Font Family"
            className="px-2 py-1 text-[11px] bg-white border border-neutral-300 rounded-lg text-neutral-800 max-w-[130px] focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f.label} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>

          {/* Font Size Selector */}
          <select
            disabled={isReadOnly || isSourceMode}
            onChange={(e) => {
              applyInlineStyleToSelection('font-size', e.target.value);
            }}
            defaultValue="16px"
            title="Font Size"
            className="px-1.5 py-1 text-[11px] font-mono bg-white border border-neutral-300 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
          >
            {FONT_SIZES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <div className="h-4 w-px bg-neutral-300 mx-0.5" />

          {/* Bold, Italic, Underline, Strikethrough, Subscript, Superscript */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execFormat('bold')}
            disabled={isReadOnly || isSourceMode}
            title="Bold (Ctrl+B)"
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-800 cursor-pointer"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execFormat('italic')}
            disabled={isReadOnly || isSourceMode}
            title="Italic (Ctrl+I)"
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-800 cursor-pointer"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execFormat('underline')}
            disabled={isReadOnly || isSourceMode}
            title="Underline (Ctrl+U)"
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-800 cursor-pointer"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execFormat('strikeThrough')}
            disabled={isReadOnly || isSourceMode}
            title="Strikethrough"
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-800 cursor-pointer"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execFormat('superscript')}
            disabled={isReadOnly || isSourceMode}
            title="Superscript"
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-800 cursor-pointer"
          >
            <Superscript className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execFormat('subscript')}
            disabled={isReadOnly || isSourceMode}
            title="Subscript"
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-800 cursor-pointer"
          >
            <Subscript className="w-3.5 h-3.5" />
          </button>

          {/* Text Color & Highlight Popover Triggers */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              onClick={() => setActivePopover(activePopover === 'color' ? null : 'color')}
              disabled={isReadOnly || isSourceMode}
              title="Text Color"
              className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-800 cursor-pointer flex items-center"
            >
              <Palette className="w-3.5 h-3.5 text-emerald-700" />
            </button>
            {activePopover === 'color' && (
              <div className="absolute left-0 top-full mt-1 z-30 bg-white border border-neutral-200 rounded-xl shadow-xl p-2.5 w-44 space-y-2">
                <span className="text-[10px] font-bold text-neutral-500 uppercase block">
                  Text Color
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {TEXT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        execFormat('foreColor', c);
                        setActivePopover(null);
                      }}
                      className="w-6 h-6 rounded-md border border-neutral-300 cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                  <label className="text-[10px] font-semibold text-neutral-600 cursor-pointer flex items-center gap-1">
                    <span>Custom:</span>
                    <input
                      type="color"
                      onChange={(e) => {
                        execFormat('foreColor', e.target.value);
                        setActivePopover(null);
                      }}
                      className="w-5 h-5 cursor-pointer border-0 p-0"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setActivePopover(null)}
                    className="text-[10px] text-neutral-500 hover:text-neutral-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              onClick={() => setActivePopover(activePopover === 'highlight' ? null : 'highlight')}
              disabled={isReadOnly || isSourceMode}
              title="Text Highlight Color"
              className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-800 cursor-pointer flex items-center"
            >
              <Highlighter className="w-3.5 h-3.5 text-amber-600" />
            </button>
            {activePopover === 'highlight' && (
              <div className="absolute left-0 top-full mt-1 z-30 bg-white border border-neutral-200 rounded-xl shadow-xl p-2.5 w-44 space-y-2">
                <span className="text-[10px] font-bold text-neutral-500 uppercase block">
                  Highlight Color
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {HIGHLIGHT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        execFormat('hiliteColor', c);
                        setActivePopover(null);
                      }}
                      className="w-6 h-6 rounded-md border border-neutral-300 cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      execFormat('hiliteColor', 'transparent');
                      setActivePopover(null);
                    }}
                    className="w-6 h-6 rounded-md border border-neutral-300 text-[10px] font-bold text-rose-600 flex items-center justify-center cursor-pointer"
                    title="Clear Highlight"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-neutral-300 mx-0.5" />

          {/* Alignment */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execFormat('justifyLeft')}
            disabled={isReadOnly || isSourceMode}
            title="Align Left"
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-800 cursor-pointer"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execFormat('justifyCenter')}
            disabled={isReadOnly || isSourceMode}
            title="Align Center"
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-800 cursor-pointer"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execFormat('justifyRight')}
            disabled={isReadOnly || isSourceMode}
            title="Align Right"
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-800 cursor-pointer"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execFormat('justifyFull')}
            disabled={isReadOnly || isSourceMode}
            title="Justify"
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-800 cursor-pointer"
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </button>

          {/* Line & Paragraph Spacing */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              onClick={() => setActivePopover(activePopover === 'spacing' ? null : 'spacing')}
              disabled={isReadOnly || isSourceMode}
              title="Line & Paragraph Spacing"
              className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-800 cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
            {activePopover === 'spacing' && (
              <div className="absolute left-0 top-full mt-1 z-30 bg-white border border-neutral-200 rounded-xl shadow-xl p-2.5 w-44 space-y-2">
                <span className="text-[10px] font-bold text-neutral-500 uppercase block">
                  Line Spacing
                </span>
                <div className="flex flex-wrap gap-1">
                  {['1.0', '1.15', '1.5', '1.75', '2.0'].map((lh) => (
                    <button
                      key={lh}
                      type="button"
                      onClick={() => applyBlockSpacing('line-height', lh)}
                      className="px-2 py-1 text-[11px] bg-neutral-100 hover:bg-emerald-50 hover:text-emerald-800 rounded font-mono cursor-pointer"
                    >
                      {lh}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] font-bold text-neutral-500 uppercase block pt-1">
                  Paragraph Spacing
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => applyBlockSpacing('margin-bottom', '0.35rem')}
                    className="px-2 py-1 text-[10px] bg-neutral-100 hover:bg-emerald-50 rounded cursor-pointer"
                  >
                    Compact
                  </button>
                  <button
                    type="button"
                    onClick={() => applyBlockSpacing('margin-bottom', '0.75rem')}
                    className="px-2 py-1 text-[10px] bg-neutral-100 hover:bg-emerald-50 rounded cursor-pointer"
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => applyBlockSpacing('margin-bottom', '1.25rem')}
                    className="px-2 py-1 text-[10px] bg-neutral-100 hover:bg-emerald-50 rounded cursor-pointer"
                  >
                    Relaxed
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-neutral-300 mx-0.5" />

          {/* Lists & Indentation */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execFormat('insertUnorderedList')}
            disabled={isReadOnly || isSourceMode}
            title="Bullet List"
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-800 cursor-pointer"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execFormat('insertOrderedList')}
            disabled={isReadOnly || isSourceMode}
            title="Numbered List"
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-800 cursor-pointer"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execFormat('outdent')}
            disabled={isReadOnly || isSourceMode}
            title="Decrease Indent (Shift+Tab)"
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-800 cursor-pointer"
          >
            <Outdent className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execFormat('indent')}
            disabled={isReadOnly || isSourceMode}
            title="Increase Indent (Tab)"
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-800 cursor-pointer"
          >
            <Indent className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-neutral-300 mx-0.5" />

          {/* Blockquote, Code Block, Horizontal Rule */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execFormat('formatBlock', 'BLOCKQUOTE')}
            disabled={isReadOnly || isSourceMode}
            title="Blockquote"
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-800 cursor-pointer"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execFormat('formatBlock', 'PRE')}
            disabled={isReadOnly || isSourceMode}
            title="Code Block"
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-800 cursor-pointer"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execFormat('insertHorizontalRule')}
            disabled={isReadOnly || isSourceMode}
            title="Insert Horizontal Line"
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-800 cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Insert Link & Remove Link */}
          {allowLinks && (
            <>
              <div className="relative">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    saveSelection();
                    const selText = window.getSelection()?.toString() || '';
                    if (selText) setLinkText(selText);
                  }}
                  onClick={() => setActivePopover(activePopover === 'link' ? null : 'link')}
                  disabled={isReadOnly || isSourceMode}
                  title="Insert Hyperlink"
                  className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-800 cursor-pointer"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                </button>
                {activePopover === 'link' && (
                  <form
                    onSubmit={handleInsertLink}
                    className="absolute left-0 top-full mt-1 z-30 bg-white border border-neutral-200 rounded-xl shadow-xl p-3 w-64 space-y-2"
                  >
                    <span className="text-[10px] font-bold text-neutral-500 uppercase block">
                      Insert Hyperlink
                    </span>
                    <input
                      type="text"
                      value={linkText}
                      onChange={(e) => setLinkText(e.target.value)}
                      placeholder="Link display text"
                      className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg"
                    />
                    <input
                      type="url"
                      required
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg font-mono"
                    />
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setActivePopover(null)}
                        className="px-2.5 py-1 text-[11px] bg-neutral-100 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 text-[11px] bg-emerald-700 text-white font-bold rounded-lg"
                      >
                        Insert Link
                      </button>
                    </div>
                  </form>
                )}
              </div>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execFormat('unlink')}
                disabled={isReadOnly || isSourceMode}
                title="Remove Hyperlink"
                className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-800 cursor-pointer"
              >
                <Unlink className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Insert Image (Firebase Storage PC Upload + URL) */}
          {allowImages && (
            <div className="relative">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  saveSelection();
                }}
                onClick={() => setActivePopover(activePopover === 'image' ? null : 'image')}
                disabled={isReadOnly || isSourceMode}
                title="Insert / Upload Image"
                className="p-1.5 rounded-lg hover:bg-neutral-200 text-emerald-800 cursor-pointer flex items-center gap-1"
              >
                <ImageIcon className="w-3.5 h-3.5" />
              </button>

              {activePopover === 'image' && (
                <div className="absolute right-0 sm:left-0 top-full mt-1 z-30 bg-white border border-neutral-200 rounded-xl shadow-xl p-3.5 w-72 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase">
                      Insert Image (`{storageFolder}/`)
                    </span>
                    <button
                      type="button"
                      onClick={() => setActivePopover(null)}
                      className="text-neutral-400 hover:text-neutral-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-1">
                      Image Alt Description (SEO / Accessibility)
                    </label>
                    <input
                      type="text"
                      value={imageAltInput}
                      onChange={(e) => setImageAltInput(e.target.value)}
                      placeholder="e.g. Ayurvedic herbal preparation"
                      className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg"
                    />
                  </div>

                  {/* Direct PC Upload to Firebase Storage */}
                  <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                    <button
                      type="button"
                      disabled={isUploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isUploadingImage ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading ({imageUploadProgress}%)...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Image from PC</span>
                        </>
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleEditorImageUpload(f);
                        e.target.value = '';
                      }}
                    />

                    {isUploadingImage && (
                      <div className="space-y-1">
                        <div className="w-full h-1.5 bg-emerald-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-700 transition-all duration-200"
                            style={{ width: `${imageUploadProgress}%` }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleCancelEditorImageUpload}
                          className="text-[10px] text-rose-700 font-bold hover:underline"
                        >
                          Cancel Upload
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Or insert by URL */}
                  <form onSubmit={handleInsertImageUrl} className="space-y-1.5 pt-1 border-t border-neutral-100">
                    <span className="text-[10px] font-semibold text-neutral-500 block">
                      Or Paste Direct HTTPS Image URL:
                    </span>
                    <div className="flex gap-1.5">
                      <input
                        type="url"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 px-2 py-1 text-xs border border-neutral-300 rounded-lg font-mono"
                      />
                      <button
                        type="submit"
                        className="px-2.5 py-1 bg-neutral-800 text-white text-[11px] font-bold rounded-lg"
                      >
                        Add
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Insert Table */}
          {allowTables && (
            <div className="relative">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  saveSelection();
                }}
                onClick={() => setActivePopover(activePopover === 'table' ? null : 'table')}
                disabled={isReadOnly || isSourceMode}
                title="Insert Table"
                className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-800 cursor-pointer"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
              {activePopover === 'table' && (
                <div className="absolute right-0 sm:left-0 top-full mt-1 z-30 bg-white border border-neutral-200 rounded-xl shadow-xl p-3 w-52 space-y-2.5">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase block">
                    Insert Table
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-neutral-600 mb-0.5">Rows</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={tableRowsInput}
                        onChange={(e) => setTableRowsInput(Number(e.target.value) || 3)}
                        className="w-full px-2 py-1 text-xs border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-600 mb-0.5">Columns</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={tableColsInput}
                        onChange={(e) => setTableColsInput(Number(e.target.value) || 3)}
                        className="w-full px-2 py-1 text-xs border rounded"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInsertTable(tableRowsInput, tableColsInput)}
                    className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Insert {tableRowsInput}×{tableColsInput} Table
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Special Characters Popover */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              onClick={() => setActivePopover(activePopover === 'chars' ? null : 'chars')}
              disabled={isReadOnly || isSourceMode}
              title="Insert Special / Devanagari Symbol"
              className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-800 cursor-pointer font-serif font-bold text-xs"
            >
              Ω
            </button>
            {activePopover === 'chars' && (
              <div className="absolute right-0 top-full mt-1 z-30 bg-white border border-neutral-200 rounded-xl shadow-xl p-2.5 w-52 space-y-1.5">
                <span className="text-[10px] font-bold text-neutral-500 uppercase block">
                  Special Symbols
                </span>
                <div className="grid grid-cols-6 gap-1">
                  {SPECIAL_CHARS.map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        insertHtmlAtCursor(ch);
                        setActivePopover(null);
                      }}
                      className="p-1.5 text-xs font-bold bg-neutral-50 hover:bg-emerald-100 rounded border border-neutral-200 cursor-pointer"
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-neutral-300 mx-0.5" />

          {/* Select All & Clear Formatting */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              if (editorRef.current) {
                editorRef.current.focus();
                document.execCommand('selectAll');
              }
            }}
            disabled={isReadOnly || isSourceMode}
            title="Select All (Ctrl+A)"
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-700 cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execFormat('removeFormat')}
            disabled={isReadOnly || isSourceMode}
            title="Clear Formatting"
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-700 cursor-pointer"
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>

          {/* Find & Replace Toggle */}
          <button
            type="button"
            onClick={() => setShowFindReplace(!showFindReplace)}
            disabled={isReadOnly}
            title="Find & Replace (Ctrl+F)"
            className={`p-1.5 rounded-lg cursor-pointer ${
              showFindReplace
                ? 'bg-emerald-700 text-white'
                : 'hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* HTML Source View Toggle */}
          <button
            type="button"
            onClick={() => {
              if (isSourceMode) {
                const safe = sanitizeRichHtml(sourceCode);
                if (editorRef.current) {
                  editorRef.current.innerHTML = safe;
                }
                lastEmittedValueRef.current = safe;
                onChange(safe);
                setIsSourceMode(false);
              } else {
                setSourceCode(editorRef.current?.innerHTML || '');
                setIsSourceMode(true);
              }
            }}
            disabled={isReadOnly}
            title="Toggle Safe HTML Source View"
            className={`p-1.5 rounded-lg cursor-pointer ${
              isSourceMode
                ? 'bg-emerald-700 text-white'
                : 'hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen Editor'}
            className={`p-1.5 rounded-lg ml-auto cursor-pointer ${
              isFullscreen
                ? 'bg-emerald-700 text-white'
                : 'hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* ============================================================
            CONTEXTUAL BAR: FIND & REPLACE
           ============================================================ */}
        {showFindReplace && (
          <div className="bg-neutral-100 border-b border-neutral-200 px-3 py-2 flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-neutral-600 text-[11px]">Find:</span>
              <input
                type="text"
                value={findQuery}
                onChange={(e) => {
                  setFindQuery(e.target.value);
                  handleFindCount(e.target.value, matchCase);
                }}
                placeholder="Search text..."
                className="px-2 py-1 bg-white border border-neutral-300 rounded text-xs w-36"
              />
              {findResultCount !== null && (
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                  {findResultCount} match{findResultCount === 1 ? '' : 'es'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-neutral-600 text-[11px]">Replace:</span>
              <input
                type="text"
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                placeholder="Replace with..."
                className="px-2 py-1 bg-white border border-neutral-300 rounded text-xs w-36"
              />
            </div>

            <label className="flex items-center gap-1 text-[11px] text-neutral-600 cursor-pointer">
              <input
                type="checkbox"
                checked={matchCase}
                onChange={(e) => {
                  setMatchCase(e.target.checked);
                  handleFindCount(findQuery, e.target.checked);
                }}
              />
              <span>Match case</span>
            </label>

            <button
              type="button"
              onClick={() => handleReplace(false)}
              className="px-2.5 py-1 bg-white border border-neutral-300 hover:bg-neutral-50 rounded text-[11px] font-semibold cursor-pointer"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => handleReplace(true)}
              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold cursor-pointer"
            >
              Replace All
            </button>
            <button
              type="button"
              onClick={() => setShowFindReplace(false)}
              className="ml-auto text-neutral-500 hover:text-neutral-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ============================================================
            CONTEXTUAL BAR: TABLE TOOLS (When cursor is inside a Table)
           ============================================================ */}
        {activeTableCell && !isSourceMode && (
          <div className="bg-emerald-50/90 border-b border-emerald-200 px-3 py-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="font-bold text-emerald-900 font-mono mr-1">Table Tools:</span>
            <button
              type="button"
              onClick={() => handleTableAction('addRowAbove')}
              className="px-2 py-0.5 bg-white border border-emerald-300 rounded hover:bg-emerald-100 text-emerald-900 font-semibold cursor-pointer"
            >
              + Row Above
            </button>
            <button
              type="button"
              onClick={() => handleTableAction('addRowBelow')}
              className="px-2 py-0.5 bg-white border border-emerald-300 rounded hover:bg-emerald-100 text-emerald-900 font-semibold cursor-pointer"
            >
              + Row Below
            </button>
            <button
              type="button"
              onClick={() => handleTableAction('addColLeft')}
              className="px-2 py-0.5 bg-white border border-emerald-300 rounded hover:bg-emerald-100 text-emerald-900 font-semibold cursor-pointer"
            >
              + Col Left
            </button>
            <button
              type="button"
              onClick={() => handleTableAction('addColRight')}
              className="px-2 py-0.5 bg-white border border-emerald-300 rounded hover:bg-emerald-100 text-emerald-900 font-semibold cursor-pointer"
            >
              + Col Right
            </button>
            <button
              type="button"
              onClick={() => handleTableAction('mergeRight')}
              className="px-2 py-0.5 bg-white border border-emerald-300 rounded hover:bg-emerald-100 text-emerald-900 font-semibold cursor-pointer"
            >
              Merge Right
            </button>
            <button
              type="button"
              onClick={() => handleTableAction('splitCell')}
              className="px-2 py-0.5 bg-white border border-emerald-300 rounded hover:bg-emerald-100 text-emerald-900 font-semibold cursor-pointer"
            >
              Split Cell
            </button>
            <button
              type="button"
              onClick={() => handleTableAction('deleteRow')}
              className="px-2 py-0.5 bg-white border border-rose-300 rounded hover:bg-rose-50 text-rose-700 font-semibold cursor-pointer"
            >
              Del Row
            </button>
            <button
              type="button"
              onClick={() => handleTableAction('deleteCol')}
              className="px-2 py-0.5 bg-white border border-rose-300 rounded hover:bg-rose-50 text-rose-700 font-semibold cursor-pointer"
            >
              Del Col
            </button>
            <button
              type="button"
              onClick={() => handleTableAction('deleteTable')}
              className="px-2 py-0.5 bg-rose-600 text-white rounded hover:bg-rose-700 font-semibold cursor-pointer ml-auto"
            >
              Delete Table
            </button>
          </div>
        )}

        {/* ============================================================
            CONTEXTUAL BAR: IMAGE INSPECTOR (When an image is clicked)
           ============================================================ */}
        {selectedImgEl && !isSourceMode && (
          <div className="bg-emerald-50/90 border-b border-emerald-200 px-3 py-1.5 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="font-bold text-emerald-900 font-mono">Image Tools:</span>
            <div className="flex items-center gap-1">
              {['25%', '50%', '75%', '100%'].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => updateSelectedImageStyle(w, undefined)}
                  className="px-2 py-0.5 bg-white border border-emerald-300 rounded hover:bg-emerald-100 text-emerald-900 font-mono cursor-pointer"
                >
                  {w}
                </button>
              ))}
            </div>
            <div className="h-3.5 w-px bg-emerald-300" />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => updateSelectedImageStyle(undefined, 'left')}
                className="px-2 py-0.5 bg-white border border-emerald-300 rounded hover:bg-emerald-100"
              >
                Left
              </button>
              <button
                type="button"
                onClick={() => updateSelectedImageStyle(undefined, 'center')}
                className="px-2 py-0.5 bg-white border border-emerald-300 rounded hover:bg-emerald-100"
              >
                Center
              </button>
              <button
                type="button"
                onClick={() => updateSelectedImageStyle(undefined, 'right')}
                className="px-2 py-0.5 bg-white border border-emerald-300 rounded hover:bg-emerald-100"
              >
                Right
              </button>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={selectedImgAlt}
                onChange={(e) => {
                  setSelectedImgAlt(e.target.value);
                  selectedImgEl.alt = e.target.value;
                  emitChange();
                }}
                placeholder="Alt text..."
                className="px-2 py-0.5 bg-white border border-emerald-300 rounded text-[11px] w-32"
              />
            </div>
            <button
              type="button"
              onClick={() => replaceImageInputRef.current?.click()}
              className="px-2 py-0.5 bg-white border border-emerald-300 rounded hover:bg-emerald-100 text-emerald-900 font-semibold cursor-pointer"
            >
              Replace
            </button>
            <input
              ref={replaceImageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleEditorImageUpload(f, selectedImgEl);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={handleDeleteSelectedImage}
              className="px-2 py-0.5 bg-rose-600 text-white rounded hover:bg-rose-700 font-semibold cursor-pointer ml-auto"
            >
              Remove Image
            </button>
          </div>
        )}

        {/* Image Upload Status / Error Banner inside Editor */}
        {isUploadingImage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-3 py-2 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
              <span className="font-semibold">
                Uploading image to Firebase Storage (`{storageFolder}/`) — {imageUploadProgress}%
              </span>
            </div>
            <button
              type="button"
              onClick={handleCancelEditorImageUpload}
              className="text-rose-700 font-bold hover:underline text-[11px]"
            >
              Cancel
            </button>
          </div>
        )}

        {imageUploadError && (
          <div
            role="alert"
            className="bg-rose-50 border-b border-rose-200 px-3 py-2 flex items-start justify-between gap-2 text-xs text-rose-800"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{imageUploadError}</span>
            </div>
            <button
              type="button"
              onClick={() => setImageUploadError(null)}
              className="text-rose-500 hover:text-rose-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ============================================================
            EDITABLE DOCUMENT SURFACE OR HTML SOURCE VIEW
           ============================================================ */}
        {isSourceMode ? (
          <textarea
            value={sourceCode}
            onChange={(e) => {
              setSourceCode(e.target.value);
              const safe = sanitizeRichHtml(e.target.value);
              lastEmittedValueRef.current = safe;
              onChange(safe);
            }}
            style={{
              minHeight: isFullscreen ? '100%' : minHeight,
              maxHeight: isFullscreen ? 'none' : maxHeight
            }}
            className="w-full flex-1 p-4 font-mono text-xs bg-neutral-900 text-emerald-300 focus:outline-none overflow-y-auto"
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable={!isReadOnly}
            suppressContentEditableWarning
            data-placeholder={placeholder}
            onInput={() => emitChange()}
            onBlur={() => {
              saveSelection();
              emitChange(true);
            }}
            onKeyUp={saveSelection}
            onMouseUp={saveSelection}
            onClick={handleEditorClick}
            onKeyDown={handleEditorKeyDown}
            onPaste={handlePaste}
            style={{
              minHeight: isFullscreen ? '100%' : minHeight,
              maxHeight: isFullscreen ? 'none' : maxHeight
            }}
            className={`word-editor-surface w-full flex-1 p-4 text-sm text-neutral-900 focus:outline-none overflow-y-auto leading-relaxed ${
              isNepali ? 'font-nepali' : ''
            } ${isReadOnly ? 'bg-neutral-100 cursor-not-allowed' : 'bg-white'}`}
          />
        )}

        {/* ============================================================
            EDITOR STATUS FOOTER (Word Count, Character Count, Mode)
           ============================================================ */}
        {showWordCount && (
          <div className="bg-neutral-50 border-t border-neutral-200 px-3 py-1.5 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
            <div className="flex items-center gap-3">
              <span>{wordCount} words</span>
              <span>·</span>
              <span>{charCount} characters</span>
              {isNepali && (
                <>
                  <span>·</span>
                  <span className="text-emerald-700 font-sans font-semibold">
                    Devanagari Unicode Ready
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isSourceMode && (
                <span className="text-amber-700 font-bold">HTML Source Mode</span>
              )}
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-emerald-700 hover:underline font-sans font-semibold cursor-pointer"
              >
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const RichTextEditor = UniversalRichTextEditor;
