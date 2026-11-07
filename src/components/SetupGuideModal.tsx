import React, { useState } from 'react';
import { X, Database, Copy, Check, ExternalLink, ShieldAlert } from 'lucide-react';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const envSample = `VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOi..."`;

  const sqlSchema = `-- Schema reference for existing tables:
-- 1. Classes table
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  max_marks NUMERIC NOT NULL DEFAULT 100
);

-- 3. Students table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  roll_number TEXT NOT NULL,
  name TEXT NOT NULL
);

-- 4. Marks table
CREATE TABLE IF NOT EXISTS public.marks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  marks_obtained NUMERIC NOT NULL DEFAULT 0,
  UNIQUE(student_id, subject_id)
);

-- 5. Settings table
CREATE TABLE IF NOT EXISTS public.settings (
  teacher_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_name TEXT NOT NULL DEFAULT 'Springfield High School',
  logo_url TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Sample standard teacher policies (authenticated users):
CREATE POLICY "Teacher own classes" ON public.classes FOR ALL USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teacher own subjects" ON public.subjects FOR ALL USING (class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid())) WITH CHECK (class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid()));
CREATE POLICY "Teacher own students" ON public.students FOR ALL USING (class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid())) WITH CHECK (class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid()));
CREATE POLICY "Teacher own marks" ON public.marks FOR ALL USING (student_id IN (SELECT id FROM public.students WHERE class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid()))) WITH CHECK (student_id IN (SELECT id FROM public.students WHERE class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid())));
CREATE POLICY "Teacher own settings" ON public.settings FOR ALL USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);
`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Supabase Connection & Schema Guide
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Environment variables & table configuration details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 dark:text-slate-300">
          {/* Environment variables notice */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>1. Required Environment Variables</span>
              </h4>
              <button
                onClick={() => copyText(envSample, 'env')}
                className="text-xs flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                {copied === 'env' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied === 'env' ? 'Copied' : 'Copy .env variables'}
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
              {envSample}
            </pre>
            <p className="text-xs text-slate-500 mt-2">
              The application reads strictly from <code className="text-indigo-500 font-semibold">VITE_SUPABASE_URL</code> and <code className="text-indigo-500 font-semibold">VITE_SUPABASE_PUBLISHABLE_KEY</code> without hard-coding secrets.
            </p>
          </div>

          {/* Database Tables structure */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>2. Table Schemas & Policies</span>
              </h4>
              <button
                onClick={() => copyText(sqlSchema, 'sql')}
                className="text-xs flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                {copied === 'sql' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied === 'sql' ? 'Copied' : 'Copy SQL Schema'}
              </button>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800 max-h-64">
              <pre>{sqlSchema}</pre>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-300">
              <p className="font-semibold mb-1">Row-Level Security Notice</p>
              <p>
                When Row Level Security (RLS) is enabled, teachers only query and manage classes, subjects, students, and marks associated with their own user account.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
