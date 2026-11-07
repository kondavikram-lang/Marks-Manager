import React from 'react';
import { ClassItem, SubjectItem, StudentItem, StudentCalculated, SubjectStats } from '../types/database';
import { calculateSubjectAnalytics, getGradeBadgeClasses } from '../lib/grading';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  CheckCircle,
  AlertOctagon,
  Sparkles,
  BookOpen,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';

interface DashboardViewProps {
  selectedClass: ClassItem | null;
  classes: ClassItem[];
  subjects: SubjectItem[];
  students: StudentItem[];
  calculatedStudents: StudentCalculated[];
  onNavigateToMarks: () => void;
  onNavigateToStudents: () => void;
  onOpenReportCard: (student: StudentItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  selectedClass,
  classes,
  subjects,
  students,
  calculatedStudents,
  onNavigateToMarks,
  onNavigateToStudents,
  onOpenReportCard,
}) => {
  if (!selectedClass) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <GraduationCap className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">No Class Selected</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          Please select or create a class from the top selector to inspect academic performance metrics.
        </p>
      </div>
    );
  }

  // Calculate metrics
  const totalStudents = students.length;
  const gradedStudents = calculatedStudents.filter((c) => c.totalObtained > 0);
  const classAvg =
    gradedStudents.length > 0
      ? Math.round(
          (gradedStudents.reduce((acc, c) => acc + c.percentage, 0) / gradedStudents.length) * 10
        ) / 10
      : 0;

  const highestScore =
    gradedStudents.length > 0
      ? Math.max(...gradedStudents.map((c) => c.percentage))
      : 0;

  const passedStudents = gradedStudents.filter((c) => c.passed);
  const passRate =
    gradedStudents.length > 0
      ? Math.round((passedStudents.length / gradedStudents.length) * 100)
      : 0;

  // Grade Breakdown
  const gradeCounts = {
    A: calculatedStudents.filter((c) => c.grade === 'A' && c.totalObtained > 0).length,
    B: calculatedStudents.filter((c) => c.grade === 'B' && c.totalObtained > 0).length,
    C: calculatedStudents.filter((c) => c.grade === 'C' && c.totalObtained > 0).length,
    D: calculatedStudents.filter((c) => c.grade === 'D' && c.totalObtained > 0).length,
    F: calculatedStudents.filter((c) => c.grade === 'F' && c.totalObtained > 0).length,
  };

  const topStudents = [...calculatedStudents]
    .filter((c) => c.totalObtained > 0)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 5);

  const atRiskStudents = calculatedStudents.filter(
    (c) => c.totalObtained > 0 && c.grade === 'F'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {selectedClass.name} Dashboard
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium border border-indigo-200 dark:border-indigo-800">
              Session {selectedClass.academic_year}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time aggregate performance indicators, grade distributions, and student standings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToMarks}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-600/30 transition cursor-pointer"
          >
            <span>Open Marks Matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Enrolled
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {totalStudents}
            </span>
            <span className="text-xs text-slate-500">students</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {gradedStudents.length} graded ({totalStudents - gradedStudents.length} pending)
          </div>
        </div>

        {/* Class Average % */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Class Average
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {classAvg}%
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              overall
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Across {subjects.length} curriculum subjects
          </div>
        </div>

        {/* Top Score */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Top Score
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {highestScore}%
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
              Rank 1
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 truncate">
            {topStudents[0]?.student.name || 'No marks yet'}
          </div>
        </div>

        {/* Passing Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Passing Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {passRate}%
            </span>
            <span className="text-xs text-slate-500">≥ 40%</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {passedStudents.length} of {gradedStudents.length} passing
          </div>
        </div>
      </div>

      {/* Mid row: Grade Distribution Chart + Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Grade Distribution Bar Chart */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Grade Distribution Chart</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official grading scale: 90+ (A), 75+ (B), 60+ (C), 40+ (D), below 40 (F)
                </p>
              </div>
            </div>

            {/* Custom SVG / Bar Breakdown */}
            <div className="space-y-4 mt-5">
              {[
                { grade: 'A', label: '90%+', count: gradeCounts.A, color: 'bg-emerald-500', barBg: 'bg-emerald-500' },
                { grade: 'B', label: '75% - 89%', count: gradeCounts.B, color: 'bg-blue-500', barBg: 'bg-blue-500' },
                { grade: 'C', label: '60% - 74%', count: gradeCounts.C, color: 'bg-amber-500', barBg: 'bg-amber-500' },
                { grade: 'D', label: '40% - 59%', count: gradeCounts.D, color: 'bg-orange-500', barBg: 'bg-orange-500' },
                { grade: 'F', label: '< 40%', count: gradeCounts.F, color: 'bg-rose-500', barBg: 'bg-rose-500' },
              ].map((item) => {
                const totalGraded = gradedStudents.length || 1;
                const pct = Math.round((item.count / totalGraded) * 100);

                return (
                  <div key={item.grade} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-6 font-bold font-mono text-slate-800 dark:text-slate-200">
                          Grade {item.grade}
                        </span>
                        <span className="text-slate-400 text-[11px]">({item.label})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">
                          {item.count} {item.count === 1 ? 'student' : 'students'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">({pct}%)</span>
                      </div>
                    </div>

                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${item.barBg}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Minimum passing requirement: 40% (Grade D)</span>
            <span className="font-mono">{gradedStudents.length} graded records</span>
          </div>
        </div>

        {/* Top Performers Leaderboard */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Class Leaderboard</span>
              </h3>
              <span className="text-xs text-slate-400">Top Performers</span>
            </div>

            {topStudents.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No marks recorded yet. Input student marks to see rank podium.
              </div>
            ) : (
              <div className="space-y-3 mt-4">
                {topStudents.map((st, idx) => (
                  <div
                    key={st.student.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between hover:border-amber-300 dark:hover:border-amber-700/60 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center font-mono ${
                          st.rank === 1
                            ? 'bg-amber-400 text-amber-950 shadow-xs'
                            : st.rank === 2
                            ? 'bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-slate-100'
                            : st.rank === 3
                            ? 'bg-amber-700 text-amber-50'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {st.rank}
                      </div>

                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                          {st.student.name}
                        </h4>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Roll #{st.student.roll_number}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
                          {st.percentage}%
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {st.totalObtained}/{st.totalMax}
                        </div>
                      </div>

                      <button
                        title="View Report Card"
                        onClick={() => onOpenReportCard(st.student)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-700 transition"
                      >
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {atRiskStudents.length > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  <strong>{atRiskStudents.length}</strong> student(s) currently below passing (Grade F).
                </span>
              </div>
              <button
                onClick={onNavigateToStudents}
                className="text-xs font-semibold underline hover:no-underline"
              >
                View
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
