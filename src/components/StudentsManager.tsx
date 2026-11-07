import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from './Toast';
import { ClassItem, StudentItem, StudentCalculated } from '../types/database';
import { getGradeBadgeClasses } from '../lib/grading';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Search,
  ArrowUpDown,
  FileSpreadsheet,
  AlertTriangle,
  X,
  Upload,
  UserCheck,
} from 'lucide-react';

interface StudentsManagerProps {
  selectedClass: ClassItem | null;
  students: StudentItem[];
  calculatedStudents: StudentCalculated[];
  onRefreshData: () => void;
  onOpenReportCard: (student: StudentItem) => void;
}

type SortField = 'roll_number' | 'name' | 'rank' | 'percentage' | 'total';
type SortOrder = 'asc' | 'desc';

export const StudentsManager: React.FC<StudentsManagerProps> = ({
  selectedClass,
  students,
  calculatedStudents,
  onRefreshData,
  onOpenReportCard,
}) => {
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('roll_number');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Modals
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);
  const [rollNumber, setRollNumber] = useState('');
  const [studentName, setStudentName] = useState('');
  const [saving, setSaving] = useState(false);

  // Bulk add text
  const [bulkText, setBulkText] = useState('');
  const [bulkSaving, setBulkSaving] = useState(false);

  // Delete target
  const [deleteTarget, setDeleteTarget] = useState<StudentItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openAddStudent = () => {
    if (!selectedClass) {
      showToast('info', 'Select a class', 'Please choose an active class first.');
      return;
    }
    // Auto suggest next roll number
    const maxRoll = students.reduce((max, s) => {
      const num = parseInt(s.roll_number, 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    setRollNumber(maxRoll > 0 ? String(maxRoll + 1) : '1');
    setStudentName('');
    setEditingStudent(null);
    setIsAddStudentOpen(true);
  };

  const openEditStudent = (s: StudentItem) => {
    setEditingStudent(s);
    setRollNumber(s.roll_number);
    setStudentName(s.name);
    setIsAddStudentOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !supabase) return;

    if (!rollNumber.trim() || !studentName.trim()) {
      showToast('error', 'Validation error', 'Both Roll Number and Student Name are required.');
      return;
    }

    setSaving(true);
    try {
      if (editingStudent) {
        const { error } = await supabase
          .from('students')
          .update({
            roll_number: rollNumber.trim(),
            name: studentName.trim(),
          })
          .eq('id', editingStudent.id);

        if (error) {
          showToast('error', 'Failed to update student', error.message);
        } else {
          showToast('success', `Student "${studentName.trim()}" updated`);
          setIsAddStudentOpen(false);
          setEditingStudent(null);
          onRefreshData();
        }
      } else {
        const { error } = await supabase.from('students').insert({
          class_id: selectedClass.id,
          roll_number: rollNumber.trim(),
          name: studentName.trim(),
        });

        if (error) {
          showToast('error', 'Failed to add student', error.message);
        } else {
          showToast('success', `Student "${studentName.trim()}" enrolled in ${selectedClass.name}`);
          setIsAddStudentOpen(false);
          onRefreshData();
        }
      }
    } catch (err: any) {
      showToast('error', 'Database call failed', err?.message || 'Error saving student');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !supabase) return;

    const lines = bulkText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      showToast('error', 'Empty input', 'Please provide at least one student line.');
      return;
    }

    const newStudents: { class_id: string; roll_number: string; name: string }[] = [];
    let autoRoll = students.length + 1;

    for (const line of lines) {
      // Split by tab, comma, or dash
      const parts = line.split(/[,\t]+/).map((p) => p.trim());
      if (parts.length >= 2) {
        newStudents.push({
          class_id: selectedClass.id,
          roll_number: parts[0],
          name: parts[1],
        });
      } else {
        newStudents.push({
          class_id: selectedClass.id,
          roll_number: String(autoRoll++),
          name: parts[0],
        });
      }
    }

    setBulkSaving(true);
    try {
      const { error } = await supabase.from('students').insert(newStudents);
      if (error) {
        showToast('error', 'Bulk enrollment failed', error.message);
      } else {
        showToast('success', `Successfully added ${newStudents.length} students`);
        setBulkText('');
        setIsBulkAddOpen(false);
        onRefreshData();
      }
    } catch (err: any) {
      showToast('error', 'Bulk add error', err?.message || 'Failed to add students');
    } finally {
      setBulkSaving(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!deleteTarget || !supabase) return;
    setDeleting(true);

    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', deleteTarget.id);

      if (error) {
        showToast('error', 'Failed to delete student', error.message);
      } else {
        showToast('success', `Student "${deleteTarget.name}" removed`);
        setDeleteTarget(null);
        onRefreshData();
      }
    } catch (err: any) {
      showToast('error', 'Delete error', err?.message || 'Failed to delete student');
    } finally {
      setDeleting(false);
    }
  };

  // Join student with their calculated stats
  const calcMap = new Map<string, StudentCalculated>();
  for (const c of calculatedStudents) {
    calcMap.set(c.student.id, c);
  }

  // Filter and sort students
  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.roll_number.toLowerCase().includes(q)
    );
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const statA = calcMap.get(a.id);
    const statB = calcMap.get(b.id);

    let comparison = 0;
    if (sortField === 'roll_number') {
      const numA = parseInt(a.roll_number, 10);
      const numB = parseInt(b.roll_number, 10);
      if (!isNaN(numA) && !isNaN(numB)) {
        comparison = numA - numB;
      } else {
        comparison = a.roll_number.localeCompare(b.roll_number);
      }
    } else if (sortField === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === 'rank') {
      comparison = (statA?.rank || 9999) - (statB?.rank || 9999);
    } else if (sortField === 'percentage') {
      comparison = (statB?.percentage || 0) - (statA?.percentage || 0);
    } else if (sortField === 'total') {
      comparison = (statB?.totalObtained || 0) - (statA?.totalObtained || 0);
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  if (!selectedClass) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <Users className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">No Class Selected</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          Please select or create a class from the top selector or Classes tab to view and manage students.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Students in {selectedClass.name}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-mono">
              {students.length} enrolled
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage student records, roll numbers, and view real-time grading standings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBulkAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Bulk Import</span>
          </button>
          <button
            onClick={openAddStudent}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-600/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll Student</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name or roll number..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 text-xs">
          <span className="text-slate-400 shrink-0 font-medium">Sort by:</span>
          <button
            onClick={() => toggleSort('roll_number')}
            className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1 transition ${
              sortField === 'roll_number'
                ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <span>Roll No</span>
            {sortField === 'roll_number' && <ArrowUpDown className="w-3 h-3" />}
          </button>
          <button
            onClick={() => toggleSort('name')}
            className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1 transition ${
              sortField === 'name'
                ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <span>Name</span>
            {sortField === 'name' && <ArrowUpDown className="w-3 h-3" />}
          </button>
          <button
            onClick={() => toggleSort('rank')}
            className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1 transition ${
              sortField === 'rank'
                ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <span>Rank</span>
            {sortField === 'rank' && <ArrowUpDown className="w-3 h-3" />}
          </button>
          <button
            onClick={() => toggleSort('percentage')}
            className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1 transition ${
              sortField === 'percentage'
                ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <span>Percentage</span>
            {sortField === 'percentage' && <ArrowUpDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {students.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h4 className="font-bold text-slate-800 dark:text-slate-200">No students enrolled yet</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Enroll individual students or use Bulk Import to paste a roster list.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={openAddStudent}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-500"
              >
                + Add Single Student
              </button>
              <button
                onClick={() => setIsBulkAddOpen(true)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Bulk Import
              </button>
            </div>
          </div>
        ) : sortedStudents.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <p className="text-sm">No students match your search query "{searchQuery}".</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4 w-20">Roll No</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4 text-center">Rank</th>
                  <th className="py-3.5 px-4 text-center">Total Marks</th>
                  <th className="py-3.5 px-4 text-center">Percentage</th>
                  <th className="py-3.5 px-4 text-center">Grade</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {sortedStudents.map((student) => {
                  const stat = calcMap.get(student.id);
                  const isTopRank = stat && stat.rank <= 3 && stat.totalObtained > 0;

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        #{student.roll_number}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          <span>{student.name}</span>
                          {isTopRank && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold border border-amber-300 dark:border-amber-700">
                              Top {stat.rank}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-300 font-mono">
                        {stat && stat.totalObtained > 0 ? `#${stat.rank}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-300 font-mono text-xs">
                        {stat ? `${stat.totalObtained} / ${stat.totalMax}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-900 dark:text-slate-100">
                        {stat ? (
                          <div className="flex flex-col items-center">
                            <span>{stat.percentage}%</span>
                            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  stat.percentage >= 75
                                    ? 'bg-emerald-500'
                                    : stat.percentage >= 40
                                    ? 'bg-indigo-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {stat ? (
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${getGradeBadgeClasses(
                              stat.grade
                            )}`}
                          >
                            Grade {stat.grade}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="Generate PDF Report Card"
                            onClick={() => onOpenReportCard(student)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition"
                          >
                            Report Card
                          </button>
                          <button
                            title="Edit Student"
                            onClick={() => openEditStudent(student)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Delete Student"
                            onClick={() => setDeleteTarget(student)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Student Modal */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {editingStudent ? 'Edit Student Details' : `Enroll Student in ${selectedClass.name}`}
              </h3>
              <button
                onClick={() => setIsAddStudentOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Roll Number / Student ID
                </label>
                <input
                  type="text"
                  required
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. 101, A-01, 1"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Full Student Name
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <span>{editingStudent ? 'Update Student' : 'Enroll Student'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Add Modal */}
      {isBulkAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                <span>Bulk Import Students</span>
              </h3>
              <button
                onClick={() => setIsBulkAddOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkAdd} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Paste Student Roster (One per line)
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Format: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">RollNo, Full Name</code> or just <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">Full Name</code>.
                </p>
                <textarea
                  rows={8}
                  required
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={`101, Alice Smith\n102, Bob Johnson\n103, Clara Davis\n104, Daniel Lee`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBulkAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkSaving}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {bulkSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <span>Import All</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Student Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950 flex items-center justify-center text-red-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100">
                  Remove Student "{deleteTarget.name}"?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  This will remove the student (Roll #{deleteTarget.roll_number}) and delete all recorded subject marks from Supabase.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteStudent}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-500 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {deleting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <span>Remove Student</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
