import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- CARD ---
export const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-card-foreground shadow-sm", className)}>
    {children}
  </div>
);

export const CardHeader = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("flex flex-col space-y-1.5 p-6 border-b border-slate-100 dark:border-slate-800", className)}>{children}</div>
);

export const CardTitle = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <h3 className={cn("text-lg font-semibold leading-none tracking-tight text-slate-900 dark:text-slate-100", className)}>{children}</h3>
);

export const CardContent = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("p-6", className)}>{children}</div>
);

// --- BADGE ---
type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "blue" | "purple" | "teal" | "orange" | "pink" | "indigo" | "cyan" | "emerald" | "rose" | "amber" | "violet" | "lime";

export const Badge = ({ className, variant = "default", children }: { className?: string; variant?: BadgeVariant; children: React.ReactNode }) => {
  const variants: Record<BadgeVariant, string> = {
    // Core
    default: "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-800 dark:border-slate-200",
    secondary: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    outline: "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600",

    // Status
    destructive: "bg-red-500 text-white border-red-600",
    success: "bg-emerald-500 text-white border-emerald-600",
    warning: "bg-amber-500 text-white border-amber-600",

    // Colors
    blue: "bg-blue-500 text-white border-blue-600",
    purple: "bg-purple-500 text-white border-purple-600",
    teal: "bg-teal-500 text-white border-teal-600",
    orange: "bg-orange-500 text-white border-orange-600",
    pink: "bg-pink-500 text-white border-pink-600",
    indigo: "bg-indigo-500 text-white border-indigo-600",
    cyan: "bg-cyan-500 text-white border-cyan-600",
    emerald: "bg-emerald-500 text-white border-emerald-600",
    rose: "bg-rose-500 text-white border-rose-600",
    amber: "bg-amber-500 text-slate-900 border-amber-600",
    violet: "bg-violet-500 text-white border-violet-600",
    lime: "bg-lime-500 text-slate-900 border-lime-600",
  };
  return (
    <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", variants[variant], className)}>
      {children}
    </div>
  );
};

// --- CATEGORY BADGE (auto-colored) ---
const categoryColors: Record<string, BadgeVariant> = {
  TIERED_DISCOUNT: "blue",
  FIXED_BUNDLE_PRICE: "emerald",
  MULTI_STEP: "violet",
  GOAL_STATEMENT: "indigo",
  ADVERSARIAL: "orange",
};

// Minimal text-only colors for table context
const categoryTextColors: Record<string, string> = {
  TIERED_DISCOUNT: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
  FIXED_BUNDLE_PRICE: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800",
  MULTI_STEP: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950 border-violet-200 dark:border-violet-800",
  GOAL_STATEMENT: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800",
  ADVERSARIAL: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800",
};

export const CategoryBadge = ({ category, minimal = false }: { category: string; minimal?: boolean }) => {
  if (minimal) {
    const colors = categoryTextColors[category] || "text-slate-600 bg-slate-50 border-slate-200";
    return (
      <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", colors)}>
        {category.replace(/_/g, ' ')}
      </span>
    );
  }
  return <Badge variant={categoryColors[category] || "outline"}>{category.replace(/_/g, ' ')}</Badge>;
};

// --- STYLE BADGE (auto-colored) ---
const styleColors: Record<string, BadgeVariant> = {
  TERSE: "cyan",
  STRUCTURED_LIST: "purple",
  CONVERSATIONAL: "pink",
  MARKETING_COPY: "rose",
  TECHNICAL_DETAILED: "teal",
  VAGUE_ASSUMES_CONTEXT: "amber",
};

const styleTextColors: Record<string, string> = {
  TERSE: "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950 border-cyan-200 dark:border-cyan-800",
  STRUCTURED_LIST: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800",
  CONVERSATIONAL: "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950 border-pink-200 dark:border-pink-800",
  MARKETING_COPY: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-800",
  TECHNICAL_DETAILED: "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 border-teal-200 dark:border-teal-800",
  VAGUE_ASSUMES_CONTEXT: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800",
};

export const StyleBadge = ({ style, minimal = false }: { style: string; minimal?: boolean }) => {
  if (minimal) {
    const colors = styleTextColors[style] || "text-slate-600 bg-slate-50 border-slate-200";
    return (
      <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", colors)}>
        {style.replace(/_/g, ' ')}
      </span>
    );
  }
  return <Badge variant={styleColors[style] || "outline"}>{style.replace(/_/g, ' ')}</Badge>;
};

// --- STATUS BADGE (minimal for tables) ---
export const StatusBadge = ({ status }: { status: 'PASS' | 'FAIL' }) => {
  const colors = status === 'PASS'
    ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800"
    : "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800";
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold", colors)}>
      {status}
    </span>
  );
};

// --- BUTTON ---
export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "ghost" | "outline" | "secondary", size?: "default" | "sm" | "lg" | "icon" }>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200",
      secondary: "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700",
      ghost: "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300",
      outline: "border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300",
    };
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    };
    return (
      <button
        ref={ref}
        className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// --- CODE BLOCK ---
export const CodeBlock = ({ code, language = 'json', label }: { code: any; language?: string, label?: string }) => {
  const codeString = typeof code === 'string' ? code : JSON.stringify(code, null, 2);
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 overflow-hidden font-mono text-xs">
      {label && <div className="bg-slate-100 dark:bg-slate-700 px-3 py-2 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-600 text-[10px] uppercase font-semibold tracking-wider">{label}</div>}
      <pre className="p-3 overflow-x-auto text-slate-700 dark:text-slate-300">
        <code>{codeString}</code>
      </pre>
    </div>
  );
};

// --- TABLE ---
export const Table = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className="relative w-full overflow-auto rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900">
    <table className={cn("w-full caption-bottom text-sm", className)}>{children}</table>
  </div>
);

export const TableHeader = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <thead className={cn("[&_tr]:border-b [&_tr]:border-slate-300 dark:[&_tr]:border-slate-600 bg-slate-100 dark:bg-slate-800", className)}>{children}</thead>
);

export const TableBody = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <tbody className={cn("[&_tr:last-child]:border-0", className)}>{children}</tbody>
);

export const TableRow = ({ className, children, onClick }: { className?: string; children: React.ReactNode; onClick?: () => void }) => (
  <tr className={cn("border-b border-slate-200 dark:border-slate-700 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 odd:bg-white even:bg-slate-50/50 dark:odd:bg-slate-900 dark:even:bg-slate-800/50", className, onClick && "cursor-pointer")} onClick={onClick}>{children}</tr>
);

export const TableHead = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <th className={cn("h-11 px-4 text-left align-middle font-semibold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider [&:has([role=checkbox])]:pr-0", className)}>{children}</th>
);

export const TableCell = ({ className, children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn("p-4 align-middle text-slate-700 dark:text-slate-300 [&:has([role=checkbox])]:pr-0", className)} {...props}>{children}</td>
);