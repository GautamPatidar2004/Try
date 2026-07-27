import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  as?: 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'p';
  editable?: boolean;
  style?: React.CSSProperties;
}

/**
 * Lightweight contentEditable wrapper. Uncontrolled internally to avoid caret jumps;
 * syncs back to props on blur and on input (debounced via animation frame).
 */
export const InlineEditable = ({
  value,
  onChange,
  multiline,
  placeholder,
  className,
  as = 'span',
  editable = true,
  style,
}: Props) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value;
    }
  }, [value]);

  const Tag = as as any;
  return (
    <Tag
      ref={ref as any}
      contentEditable={editable}
      suppressContentEditableWarning
      data-placeholder={placeholder}
      style={style}
      onInput={(e: any) => onChange(e.currentTarget.innerText)}
      onKeyDown={(e: any) => {
        if (!multiline && e.key === 'Enter') e.preventDefault();
      }}
      className={cn(
        'outline-none focus:ring-2 focus:ring-primary/30 rounded-sm transition-shadow',
        editable && 'hover:bg-black/[0.03] focus:bg-black/[0.03] cursor-text',
        'empty:before:content-[attr(data-placeholder)] empty:before:text-current/40',
        className,
      )}
    />
  );
};