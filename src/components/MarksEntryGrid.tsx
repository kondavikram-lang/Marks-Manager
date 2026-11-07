import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from './Toast';
import { ClassItem, SubjectItem, StudentItem, MarkItem, StudentCalculated } from '../types/database';
import { calculateClassStats, getGradeBadgeClasses } from '../lib/grading';
import {
  FileSpreadsheet,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  HelpCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface MarksEntryGridProps {
  selectedClass: ClassItem | null;
  subjects: SubjectItem[];
  students: StudentItem[];
  marks: MarkItem[];
  onRefreshData: () => void;
}

export const MarksEntryGrid: React.FC<MarksEntryGridProps> = ({
  selectedClass,
  subjects,
  students,
  marks,
  onRefreshData,
}) => {
  const { showToast } = useToast();

  // Local grid values: key is `${student_id}_${subject_id}` -> number | ''
  const [gridValues, setGridValues] = useState<Record<string, string>>({});
  // Dirty cells to track what changed
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set());
  // Saving status
  const [isSaving, setIsSaving] = useState(false);
  // Auto-calculated live preview
  const [liveCalculated, setLiveCalculated] = useState<StudentCalculated[]>([]);

  // Synchronize when incoming students/subjects/marks change
  useEffect(() => {
    const newValues: Record<string, string> = {};
    for (const m of marks) {
      newValues[`${m.student_id}_${m.subject_id}`] = String(m.marks_obtained);
    }
    setGridValues(newValues);
    setDirtyKeys(new Set());
  }, [marks, students, subjects]);

  // Recalculate live totals whenever grid values change
  useEffect(() => {
    if (!students.length || !subjects.length) {
      setLiveCalculated([]);
      return;
    }

    // Convert current gridValues to MarkItem array
    const simulatedMarks: MarkItem[] = [];
    students.forEach((st) => {
      subjects.forEach((sub) => {
        const valStr = gridValues[`${st.id}_${sub.id}`];
        if (valStr !== undefined && valStr !== '' && !isNaN(Number(valStr))) {
          simulatedMarks.push({
            student_id: st.id,
            subject_id: sub.id,
            marks_obtained: Number(valStr),
          });
        }
      });
    });

    const stats = calculateClassStats(students, subjects, simulatedMarks);
    setLiveCalculated(stats);
  }, [gridValues, students, subjects]);

  const handleCellChange = (studentId: string, subjectId: string, value: string, maxMarks: number) => {
    // Basic format filter: empty string or number
    if (value !== '' && isNaN(Number(value))) {
      return;
    }

    const cellKey = `${studentId}_${subjectId}`;
    setGridValues((prev) => ({
      ...prev,
      [cellKey]: value,
    }));

    setDirtyKeys((prev) => {
      const next = new Set(prev);
      next.add(cellKey);
      return next;
    });
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    studentIdx: number,
    subjectIdx: number
  ) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter') {
      e.preventDefault();
      const nextInput = document.getElementById(
        `cell-${studentIdx + 1}-${subjectIdx}`
      ) as HTMLInputElement | null;
      if (nextInput) nextInput.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevInput = document.getElementById(
        `cell-${studentIdx - 1}-${subjectIdx}`
      ) as HTMLInputElement | null;
      if (prevInput) prevInput.focus();
    } else if (e.key === 'ArrowRight' && (e.target as HTMLInputElement).selectionStart === (e.target as HTMLInputElement).value.length) {
      const nextCol = document.getElementById(
        `cell-${studentIdx}-${subjectIdx + 1}`
      ) as HTMLInputElement | null;
      if (nextCol) nextCol.focus();
    } else if (e.key === 'ArrowLeft' && (e.target as HTMLInputElement).selectionStart === 0) {
      const prevCol = document.getElementById(
        `cell-${studentIdx}-${subjectIdx - 1}`
      ) as HTMLInputElement | null;
      if (prevCol) prevCol.focus();
    }
  };

  const handleSaveAll = async () => {
    if (!supabase) {
      showToast('error', 'Supabase error', 'Database client is not available.');
      return;
    }

    // Validation: check for negative marks or marks > max_marks
    const errors: string[] = [];
    const payloadToUpsert: {
      student_id: string;
      subject_id: string;
      marks_obtained: number;
    }[] = [];

    students.forEach((st) => {
      subjects.forEach((sub) => {
        const key = `${st.id}_${sub.id}`;
        const valStr = gridValues[key];

        if (valStr !== undefined && valStr.trim() !== '') {
          const num = Number(valStr);
          if (isNaN(num)) {
            errors.push(`${st.name} - ${sub.name}: Invalid number`);
          } else if (num < 0) {
            errors.push(`${st.name} - ${sub.name}: Marks cannot be negative`);
          } else if (num > sub.max_marks) {
            errors.push(
              `${st.name} - ${sub.name}: Marks (${num}) exceed max limit of ${sub.max_marks}`
            );
          } else {
            payloadToUpsert.push({
              student_id: st.id,
              subject_id: sub.id,
              marks_obtained: num,
            });
          }
        }
      });
    });

    if (errors.length > 0) {
      showToast('error', 'Validation errors found', errors.slice(0, 3).join('\n'));
      return;
    }

    if (payloadToUpsert.length === 0 && dirtyKeys.size === 0) {
      showToast('info', 'Nothing to save', 'No marks have been modified.');
      return;
    }

    setIsSaving(true);
    try {
      // Upsert into marks table on conflict (student_id, subject_id)
      const { error } = await supabase
        .from('marks')
        .upsert(payloadToUpsert, { onConflict: 'student_id,subject_id' });

      if (error) {
        showToast('error', 'Failed to save marks to Supabase', error.message);
      } else {
        showToast(
          'success',
          'Marks saved successfully!',
          `${payloadToUpsert.length} mark records stored in database.`
        );
        setDirtyKeys(new Set());
        onRefreshData();
      }
    } catch (err: any) {
      showToast('error', 'Supabase call error', err?.message || 'Failed to save marks');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFillZeroes = () => {
    const updated = { ...gridValues };
    const newDirty = new Set(dirtyKeys);

    students.forEach((st) => {
      subjects.forEach((sub) => {
        const key = `${st.id}_${sub.id}`;
        if (updated[key] === undefined || updated[key] === '') {
          updated[key] = '0';
          newDirty.add(key);
        }
      });
    });

    setGridValues(updated);
    setDirtyKeys(newDirty);
    showToast('info', 'Blank entries filled', 'Unfilled marks populated with 0. Click "Save All Changes" to persist.');
  };

  const handleResetToSaved = () => {
    const resetVals: Record<string, string> = {};
    for (const m of marks) {
      resetVals[`${m.student_id}_${m.subject_id}`] = String(m.marks_obtained);
    }
    setGridValues(resetVals);
    setDirtyKeys(new Set());
    showToast('info', 'Changes reverted', 'Grid reset to last saved state from Supabase.');
  };

  // Map calculated stats for easy row lookup
  const calcMap = new Map<string, StudentCalculated>();
  for (const c of liveCalculated) {
    calcMap.set(c.student.id, c);
  }

  if (!selectedClass) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">No Class Selected</h3>
        <p className="text-sm text-slate-500 mt-1">Please select an active class to input student marks.</p>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">No Subjects Defined</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Please add subjects to <span className="font-semibold">{selectedClass.name}</span> before entering marks.
        </p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">No Students Enrolled</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Please enroll students in <span className="font-semibold">{selectedClass.name}</span> in the Students tab before entering marks.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Marks Entry Spreadsheet</span>
            {dirtyKeys.size > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-semibold border border-amber-300 dark:border-amber-700 animate-pulse">
                {dirtyKeys.size} unsaved changes
              </span>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time matrix for <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedClass.name}</span>. Total, percentage, grade, and rank update instantly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {dirtyKeys.size > 0 && (
            <button
              onClick={handleResetToSaved}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard</span>
            </button>
          )}

          <button
            onClick={handleFillZeroes}
            title="Fill empty cells with 0"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
          >
            <span>Fill Blanks with 0</span>
          </button>

          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-sm shadow-indigo-600/30 disabled:opacity-50 transition cursor-pointer"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save All to Supabase</span>
          </button>
        </div>
      </div>

      {/* Grid instructions notice */}
      <div className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>
            Use <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-mono text-[10px]">Enter</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-mono text-[10px]">↓</kbd> to jump to the next student, <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-mono text-[10px]">Tab</kbd> to jump between subjects.
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
            Modified
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            Saved
          </span>
        </div>
      </div>

      {/* Spreadsheet Matrix Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-20 bg-slate-100/95 dark:bg-slate-800/95 backdrop-blur-md shadow-xs text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-3.5 sticky left-0 z-30 bg-slate-100/95 dark:bg-slate-800/95 w-16">
                  Roll #
                </th>
                <th className="py-3 px-4 sticky left-16 z-30 bg-slate-100/95 dark:bg-slate-800/95 min-w-[170px]">
                  Student Name
                </th>
                {subjects.map((sub, sIdx) => (
                  <th key={sub.id} className="py-3 px-3 min-w-[130px] text-center">
                    <div>{sub.name}</div>
                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono lowercase tracking-normal">
                      max: {sub.max_marks}
                    </div>
                  </th>
                ))}
                <th className="py-3 px-3 text-center min-w-[90px] bg-slate-200/50 dark:bg-slate-700/50">
                  Total
                </th>
                <th className="py-3 px-3 text-center min-w-[80px] bg-slate-200/50 dark:bg-slate-700/50">
                  %
                </th>
                <th className="py-3 px-3 text-center min-w-[80px] bg-slate-200/50 dark:bg-slate-700/50">
                  Grade
                </th>
                <th className="py-3 px-3 text-center min-w-[70px] bg-slate-200/50 dark:bg-slate-700/50">
                  Rank
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {students.map((student, rIdx) => {
                const stat = calcMap.get(student.id);

                return (
                  <tr
                    key={student.id}
                    className="hover:bg-indigo-50/20 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Fixed Roll */}
                    <td className="py-2.5 px-3.5 sticky left-0 z-10 bg-white dark:bg-slate-900 font-mono font-semibold text-indigo-600 dark:text-indigo-400 text-xs">
                      #{student.roll_number}
                    </td>

                    {/* Fixed Name */}
                    <td className="py-2.5 px-4 sticky left-16 z-10 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate max-w-[200px]">
                      {student.name}
                    </td>

                    {/* Subject cells */}
                    {subjects.map((sub, cIdx) => {
                      const cellKey = `${student.id}_${sub.id}`;
                      const rawValue = gridValues[cellKey] ?? '';
                      const isDirty = dirtyKeys.has(cellKey);
                      const numVal = Number(rawValue);
                      const isOverMax = rawValue !== '' && !isNaN(numVal) && numVal > sub.max_marks;
                      const isNegative = rawValue !== '' && !isNaN(numVal) && numVal < 0;
                      const hasError = isOverMax || isNegative;

                      return (
                        <td key={sub.id} className="p-1.5 text-center">
                          <div className="relative">
                            <input
                              id={`cell-${rIdx}-${cIdx}`}
                              type="number"
                              min={0}
                              max={sub.max_marks}
                              step="any"
                              value={rawValue}
                              onChange={(e) =>
                                handleCellChange(student.id, sub.id, e.target.value, sub.max_marks)
                              }
                              onKeyDown={(e) => handleKeyDown(e, rIdx, cIdx)}
                              placeholder="—"
                              className={`w-full py-1.5 px-2 text-center text-xs font-mono rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                                hasError
                                  ? 'bg-red-50 dark:bg-red-950/50 border-red-400 text-red-600 focus:ring-red-400'
                                  : isDirty
                                  ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-400 text-amber-900 dark:text-amber-200 focus:ring-amber-400 font-semibold'
                                  : rawValue !== ''
                                  ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-indigo-500'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 focus:ring-indigo-500'
                              }`}
                            />
                            {isDirty && !hasError && (
                              <span
                                title="Unsaved changes"
                                className="absolute right-1 top-1 w-1.5 h-1.5 rounded-full bg-amber-500 pointer-events-none"
                              />
                            )}
                            {hasError && (
                              <span
                                title={isOverMax ? `Exceeds max (${sub.max_marks})` : 'Negative marks'}
                                className="absolute right-1 top-1 text-red-500 pointer-events-none"
                              >
                                <AlertCircle className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {/* Calculated Live Total */}
                    <td className="py-2 px-3 text-center font-mono font-semibold text-slate-800 dark:text-slate-200 text-xs bg-slate-50/60 dark:bg-slate-800/30">
                      {stat ? `${stat.totalObtained}` : '0'}
                      <span className="text-[10px] text-slate-400 block font-normal">
                        /{stat?.totalMax || 0}
                      </span>
                    </td>

                    {/* Percentage */}
                    <td className="py-2 px-3 text-center font-mono font-semibold text-slate-900 dark:text-slate-100 text-xs bg-slate-50/60 dark:bg-slate-800/30">
                      {stat ? `${stat.percentage}%` : '0%'}
                    </td>

                    {/* Auto Grade */}
                    <td className="py-2 px-3 text-center bg-slate-50/60 dark:bg-slate-800/30">
                      {stat ? (
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${getGradeBadgeClasses(
                            stat.grade
                          )}`}
                        >
                          {stat.grade}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Auto Rank */}
                    <td className="py-2 px-3 text-center font-mono font-bold text-xs bg-slate-50/60 dark:bg-slate-800/30">
                      {stat && stat.totalObtained > 0 ? (
                        <span
                          className={`${
                            stat.rank === 1
                              ? 'text-amber-500 font-extrabold'
                              : stat.rank === 2
                              ? 'text-slate-400 font-bold'
                              : stat.rank === 3
                              ? 'text-amber-700 font-bold'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          #{stat.rank}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
