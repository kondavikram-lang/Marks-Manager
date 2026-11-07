import React, { useRef, useState } from 'react';
import { ClassItem, SubjectItem, StudentItem, SettingItem, StudentCalculated } from '../types/database';
import { calculateGrade, getGradeRemarks, getGradeBadgeClasses } from '../lib/grading';
import {
  Printer,
  X,
  ChevronLeft,
  ChevronRight,
  School,
  Award,
  CheckCircle,
  Download,
  Calendar,
  User,
} from 'lucide-react';

interface ReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentItem | null;
  selectedClass: ClassItem | null;
  subjects: SubjectItem[];
  students: StudentItem[];
  calculatedStudents: StudentCalculated[];
  settings: SettingItem | null;
  onSelectStudent: (student: StudentItem) => void;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
  isOpen,
  onClose,
  student,
  selectedClass,
  subjects,
  students,
  calculatedStudents,
  settings,
  onSelectStudent,
}) => {
  const [printAll, setPrintAll] = useState(false);
  const printContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !student || !selectedClass) return null;

  // Find current student calculation
  const currentCalc = calculatedStudents.find((c) => c.student.id === student.id);
  const currentIndex = students.findIndex((s) => s.id === student.id);

  const prevStudent = currentIndex > 0 ? students[currentIndex - 1] : null;
  const nextStudent = currentIndex < students.length - 1 ? students[currentIndex + 1] : null;

  const handlePrint = (all = false) => {
    setPrintAll(all);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const schoolName = settings?.school_name || 'St. Jude Academic School';
  const logoUrl = settings?.logo_url;

  const renderSingleReportCard = (targetStudent: StudentItem, targetCalc?: StudentCalculated) => {
    const totalObtained = targetCalc ? targetCalc.totalObtained : 0;
    const totalMax = targetCalc ? targetCalc.totalMax : 0;
    const percentage = targetCalc ? targetCalc.percentage : 0;
    const grade = targetCalc ? targetCalc.grade : 'F';
    const rank = targetCalc && targetCalc.totalObtained > 0 ? targetCalc.rank : '—';
    const remarks = getGradeRemarks(grade);

    return (
      <div
        key={targetStudent.id}
        className="report-card-sheet bg-white text-slate-900 p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-200 max-w-3xl mx-auto my-4 page-break-after-always print:p-6 print:shadow-none print:border-none print:m-0 print:rounded-none"
      >
        {/* School Banner Header */}
        <div className="flex items-center justify-between pb-6 border-b-2 border-indigo-900/80 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl border border-indigo-100 bg-indigo-50 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={schoolName}
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <School className="w-9 h-9 text-indigo-700" />
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-indigo-950 font-serif uppercase">
                {schoolName}
              </h1>
              <p className="text-xs text-slate-500 font-medium tracking-widest uppercase">
                Official Student Academic Performance Report
              </p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px] font-semibold mt-1">
                <Calendar className="w-3 h-3" />
                <span>Academic Session: {selectedClass.academic_year}</span>
              </div>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Class
              </span>
              <span className="text-sm font-extrabold text-slate-900 font-serif">
                {selectedClass.name}
              </span>
            </div>
          </div>
        </div>

        {/* Student Metadata Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
              Student Full Name
            </span>
            <span className="font-bold text-slate-900 text-sm">{targetStudent.name}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
              Roll / Student ID
            </span>
            <span className="font-mono font-bold text-indigo-700 text-sm">
              #{targetStudent.roll_number}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
              Class & Section
            </span>
            <span className="font-semibold text-slate-800">{selectedClass.name}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
              Class Rank
            </span>
            <span className="font-mono font-bold text-amber-600 text-sm">
              {rank !== '—' ? `#${rank} of ${students.length}` : 'Pending'}
            </span>
          </div>
        </div>

        {/* Subject-Wise Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-indigo-900 text-white font-bold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3.5">#</th>
                <th className="py-2.5 px-3.5">Curriculum Subject</th>
                <th className="py-2.5 px-3.5 text-center">Max Marks</th>
                <th className="py-2.5 px-3.5 text-center">Marks Scored</th>
                <th className="py-2.5 px-3.5 text-center">Subject %</th>
                <th className="py-2.5 px-3.5 text-center">Grade</th>
                <th className="py-2.5 px-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {subjects.map((sub, sIdx) => {
                const scored = targetCalc?.subjectMarks[sub.id];
                const maxMarks = Number(sub.max_marks) || 100;
                const subPct =
                  scored !== null && scored !== undefined
                    ? Math.round((Number(scored) / maxMarks) * 1000) / 10
                    : null;
                const subGrade = subPct !== null ? calculateGrade(subPct) : null;
                const isPass = subGrade !== null && subGrade !== 'F';

                return (
                  <tr key={sub.id} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3.5 font-mono text-slate-400">{sIdx + 1}</td>
                    <td className="py-2 px-3.5 font-semibold text-slate-800">{sub.name}</td>
                    <td className="py-2 px-3.5 text-center font-mono text-slate-600">{maxMarks}</td>
                    <td className="py-2 px-3.5 text-center font-mono font-bold text-slate-900">
                      {scored !== null && scored !== undefined ? scored : '—'}
                    </td>
                    <td className="py-2 px-3.5 text-center font-mono">
                      {subPct !== null ? `${subPct}%` : '—'}
                    </td>
                    <td className="py-2 px-3.5 text-center">
                      {subGrade ? (
                        <span className="font-bold text-xs">{subGrade}</span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-2 px-3.5 text-center font-medium">
                      {subGrade ? (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isPass ? 'Pass' : 'Needs Retake'}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Aggregated Score & Grade Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Total Marks
            </span>
            <span className="text-base sm:text-lg font-black font-mono text-slate-900">
              {totalObtained}{' '}
              <span className="text-xs font-normal text-slate-500">/ {totalMax}</span>
            </span>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Overall Percentage
            </span>
            <span className="text-base sm:text-lg font-black font-mono text-indigo-700">
              {percentage}%
            </span>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Final Grade
            </span>
            <span
              className={`inline-block px-3 py-0.5 rounded-full text-sm font-black mt-0.5 border ${getGradeBadgeClasses(
                grade
              )}`}
            >
              Grade {grade}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Academic Standing
            </span>
            <span className="text-xs font-bold text-slate-800 block mt-1">{remarks}</span>
          </div>
        </div>

        {/* Grading Scale Reference */}
        <div className="py-2.5 px-3 rounded-lg bg-slate-100/70 border border-slate-200/70 text-[10px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <span className="font-bold text-slate-700 uppercase tracking-wider">Grading Key:</span>
          <span>90%+ : A (Outstanding)</span>
          <span>75% - 89% : B (Very Good)</span>
          <span>60% - 74% : C (Good)</span>
          <span>40% - 59% : D (Satisfactory)</span>
          <span>Below 40% : F (Fail / Retake)</span>
        </div>

        {/* Signature & Seal Area */}
        <div className="mt-12 pt-6 grid grid-cols-3 gap-6 text-center text-xs text-slate-600">
          <div>
            <div className="border-b border-slate-400 w-36 mx-auto mb-2 h-10"></div>
            <span className="font-semibold block text-slate-800">Class Teacher</span>
            <span className="text-[10px] text-slate-400">Signature</span>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center p-1">
              Official Seal
            </div>
          </div>

          <div>
            <div className="border-b border-slate-400 w-36 mx-auto mb-2 h-10"></div>
            <span className="font-semibold block text-slate-800">Principal / Dean</span>
            <span className="text-[10px] text-slate-400">Signature & Date</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-100 dark:bg-slate-950 rounded-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Top Control Bar (hidden in print) */}
        <div className="px-6 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 no-print shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                disabled={!prevStudent}
                onClick={() => prevStudent && onSelectStudent(prevStudent)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Previous Student"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={!nextStudent}
                onClick={() => nextStudent && onSelectStudent(nextStudent)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Next Student"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Report Card: {student.name}
              </h3>
              <p className="text-xs text-slate-500">
                Student {currentIndex + 1} of {students.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePrint(false)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            {students.length > 1 && (
              <button
                onClick={() => handlePrint(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition cursor-pointer"
              >
                <span>Print All ({students.length})</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div ref={printContainerRef} className="overflow-y-auto p-4 sm:p-6 print:p-0">
          {printAll ? (
            <div>
              {students.map((st) => {
                const targetCalc = calculatedStudents.find((c) => c.student.id === st.id);
                return renderSingleReportCard(st, targetCalc);
              })}
            </div>
          ) : (
            renderSingleReportCard(student, currentCalc)
          )}
        </div>
      </div>
    </div>
  );
};
