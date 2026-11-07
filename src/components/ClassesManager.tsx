import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from './Toast';
import { ClassItem, SubjectItem } from '../types/database';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  X,
  Save,
  CheckCircle2,
} from 'lucide-react';

interface ClassesManagerProps {
  classes: ClassItem[];
  selectedClass: ClassItem | null;
  subjects: SubjectItem[];
  onSelectClass: (c: ClassItem) => void;
  onRefreshData: () => void;
}

export const ClassesManager: React.FC<ClassesManagerProps> = ({
  classes,
  selectedClass,
  subjects,
  onSelectClass,
  onRefreshData,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Class modals
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [className, setClassName] = useState('');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [classSaving, setClassSaving] = useState(false);

  // Subject modals
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);
  const [subjectName, setSubjectName] = useState('');
  const [subjectMaxMarks, setSubjectMaxMarks] = useState<number>(100);
  const [subjectSaving, setSubjectSaving] = useState(false);

  // Delete confirmations
  const [deleteClassTarget, setDeleteClassTarget] = useState<ClassItem | null>(null);
  const [deleteSubjectTarget, setDeleteSubjectTarget] = useState<SubjectItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Handlers for Classes
  const openAddClass = () => {
    setClassName('');
    setAcademicYear(
      new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)
    );
    setIsAddClassOpen(true);
  };

  const openEditClass = (cls: ClassItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingClass(cls);
    setClassName(cls.name);
    setAcademicYear(cls.academic_year);
    setIsAddClassOpen(true);
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) return;
    if (!className.trim() || !academicYear.trim()) {
      showToast('error', 'Validation error', 'Please provide class name and academic year.');
      return;
    }

    setClassSaving(true);
    try {
      if (editingClass) {
        const { error } = await supabase
          .from('classes')
          .update({
            name: className.trim(),
            academic_year: academicYear.trim(),
          })
          .eq('id', editingClass.id);

        if (error) {
          showToast('error', 'Failed to update class', error.message);
        } else {
          showToast('success', `Class "${className.trim()}" updated`);
          setIsAddClassOpen(false);
          setEditingClass(null);
          onRefreshData();
        }
      } else {
        const { data, error } = await supabase
          .from('classes')
          .insert({
            teacher_id: user.id,
            name: className.trim(),
            academic_year: academicYear.trim(),
          })
          .select()
          .single();

        if (error) {
          showToast('error', 'Failed to create class', error.message);
        } else {
          showToast('success', `Class "${className.trim()}" created successfully`);
          setIsAddClassOpen(false);
          onRefreshData();
          if (data) onSelectClass(data);
        }
      }
    } catch (err: any) {
      showToast('error', 'Database call failed', err?.message || 'Error saving class');
    } finally {
      setClassSaving(false);
    }
  };

  const handleDeleteClass = async () => {
    if (!deleteClassTarget || !supabase) return;
    setDeleting(true);

    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', deleteClassTarget.id);

      if (error) {
        showToast('error', 'Failed to delete class', error.message);
      } else {
        showToast('success', `Class "${deleteClassTarget.name}" deleted`);
        setDeleteClassTarget(null);
        onRefreshData();
      }
    } catch (err: any) {
      showToast('error', 'Delete error', err?.message || 'Failed to delete class');
    } finally {
      setDeleting(false);
    }
  };

  // Handlers for Subjects
  const openAddSubject = () => {
    if (!selectedClass) {
      showToast('info', 'Select a class', 'Please select or create a class first.');
      return;
    }
    setSubjectName('');
    setSubjectMaxMarks(100);
    setEditingSubject(null);
    setIsAddSubjectOpen(true);
  };

  const openEditSubject = (sub: SubjectItem) => {
    setEditingSubject(sub);
    setSubjectName(sub.name);
    setSubjectMaxMarks(sub.max_marks || 100);
    setIsAddSubjectOpen(true);
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !supabase) return;

    if (!subjectName.trim()) {
      showToast('error', 'Validation error', 'Subject name is required.');
      return;
    }

    if (subjectMaxMarks <= 0) {
      showToast('error', 'Validation error', 'Max marks must be greater than zero.');
      return;
    }

    setSubjectSaving(true);
    try {
      if (editingSubject) {
        const { error } = await supabase
          .from('subjects')
          .update({
            name: subjectName.trim(),
            max_marks: Number(subjectMaxMarks),
          })
          .eq('id', editingSubject.id);

        if (error) {
          showToast('error', 'Failed to update subject', error.message);
        } else {
          showToast('success', `Subject "${subjectName.trim()}" updated`);
          setIsAddSubjectOpen(false);
          setEditingSubject(null);
          onRefreshData();
        }
      } else {
        const { error } = await supabase.from('subjects').insert({
          class_id: selectedClass.id,
          name: subjectName.trim(),
          max_marks: Number(subjectMaxMarks),
        });

        if (error) {
          showToast('error', 'Failed to add subject', error.message);
        } else {
          showToast('success', `Subject "${subjectName.trim()}" added to ${selectedClass.name}`);
          setIsAddSubjectOpen(false);
          onRefreshData();
        }
      }
    } catch (err: any) {
      showToast('error', 'Database call failed', err?.message || 'Error saving subject');
    } finally {
      setSubjectSaving(false);
    }
  };

  const handleDeleteSubject = async () => {
    if (!deleteSubjectTarget || !supabase) return;
    setDeleting(true);

    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', deleteSubjectTarget.id);

      if (error) {
        showToast('error', 'Failed to delete subject', error.message);
      } else {
        showToast('success', `Subject "${deleteSubjectTarget.name}" deleted`);
        setDeleteSubjectTarget(null);
        onRefreshData();
      }
    } catch (err: any) {
      showToast('error', 'Delete error', err?.message || 'Failed to delete subject');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Class & Subject Management</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize academic grades, classrooms, and curriculum subjects with designated maximum marks.
          </p>
        </div>

        <button
          onClick={openAddClass}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-sm shadow-indigo-600/30 transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Class</span>
        </button>
      </div>

      {/* Grid: Left side classes list, Right side subjects for selected class */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Classes Column */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Your Classes ({classes.length})
            </span>
            <span className="text-xs text-slate-400">Click to inspect</span>
          </div>

          {classes.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                No classes created yet
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Get started by creating your first grade or class section.
              </p>
              <button
                onClick={openAddClass}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span>Create Class</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {classes.map((cls) => {
                const isSelected = selectedClass?.id === cls.id;
                return (
                  <div
                    key={cls.id}
                    onClick={() => onSelectClass(cls)}
                    className={`group p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 shadow-sm ring-1 ring-indigo-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-950 group-hover:text-indigo-600'
                        }`}
                      >
                        {cls.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                            {cls.name}
                          </h4>
                          {isSelected && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-md">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Academic Year: {cls.academic_year}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        title="Edit Class"
                        onClick={(e) => openEditClass(cls, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        title="Delete Class"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteClassTarget(cls);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className={`w-4 h-4 ml-1 text-slate-400 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Subjects Column */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            {selectedClass ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span>Subjects for {selectedClass.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                        {subjects.length} subjects
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Marks obtained are calculated against each subject's max marks.
                    </p>
                  </div>

                  <button
                    onClick={openAddSubject}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white dark:text-slate-900 dark:hover:text-white text-xs font-semibold transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Subject</span>
                  </button>
                </div>

                {subjects.length === 0 ? (
                  <div className="py-12 text-center">
                    <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      No subjects defined for this class
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Add curriculum subjects (e.g. Mathematics, Science, English) with their respective maximum marks (e.g. 100).
                    </p>
                    <button
                      onClick={openAddSubject}
                      className="mt-4 px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold text-xs border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition"
                    >
                      + Add Subject Now
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {subjects.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-indigo-200 dark:hover:border-indigo-800/60 transition flex items-center justify-between"
                      >
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {sub.name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                            <span className="font-medium text-indigo-600 dark:text-indigo-400">
                              Max Marks: {sub.max_marks}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            title="Edit Subject"
                            onClick={() => openEditSubject(sub)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Delete Subject"
                            onClick={() => setDeleteSubjectTarget(sub)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-700 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400">
                <Layers className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a class on the left to view and configure its subjects.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Class Modal */}
      {isAddClassOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {editingClass ? 'Edit Class Details' : 'Create New Class'}
              </h3>
              <button
                onClick={() => setIsAddClassOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Class / Section Name
                </label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. Grade 10 - Section A"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Academic Year
                </label>
                <input
                  type="text"
                  required
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="e.g. 2024-2025"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddClassOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={classSaving}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {classSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <span>{editingClass ? 'Update Class' : 'Create Class'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Subject Modal */}
      {isAddSubjectOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {editingSubject ? 'Edit Subject' : `Add Subject to ${selectedClass?.name}`}
              </h3>
              <button
                onClick={() => setIsAddSubjectOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g. Mathematics, Physics, English"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Maximum Marks (Total)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={1000}
                  value={subjectMaxMarks}
                  onChange={(e) => setSubjectMaxMarks(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex gap-2 mt-2">
                  {[50, 75, 100].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setSubjectMaxMarks(preset)}
                      className={`px-2.5 py-1 text-xs rounded-lg border ${
                        subjectMaxMarks === preset
                          ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-400 text-indigo-600 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {preset} Marks
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddSubjectOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={subjectSaving}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {subjectSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <span>{editingSubject ? 'Update Subject' : 'Add Subject'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Class Confirmation Modal */}
      {deleteClassTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950 flex items-center justify-center text-red-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100">
                  Delete "{deleteClassTarget.name}"?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  This will permanently delete this class and all associated subjects, enrolled students, and recorded marks from Supabase.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteClassTarget(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteClass}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-500 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {deleting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <span>Delete Class</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Subject Confirmation Modal */}
      {deleteSubjectTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950 flex items-center justify-center text-red-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100">
                  Delete Subject "{deleteSubjectTarget.name}"?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  This will remove the subject and any marks scored in this subject across all students.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteSubjectTarget(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteSubject}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-500 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {deleting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <span>Delete Subject</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
