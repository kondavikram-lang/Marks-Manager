import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './components/Toast';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import {
  ClassItem,
  SubjectItem,
  StudentItem,
  MarkItem,
  SettingItem,
  StudentCalculated,
} from './types/database';
import { calculateClassStats } from './lib/grading';
import { AuthView } from './components/AuthView';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { MarksEntryGrid } from './components/MarksEntryGrid';
import { StudentsManager } from './components/StudentsManager';
import { ClassesManager } from './components/ClassesManager';
import { ReportCardModal } from './components/ReportCardModal';
import { SettingsModal } from './components/SettingsModal';
import { SetupGuideModal } from './components/SetupGuideModal';
import { GraduationCap, AlertCircle, RefreshCw } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, loading: authLoading, isConfigured } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Supabase Data State
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [marks, setMarks] = useState<MarkItem[]>([]);
  const [settings, setSettings] = useState<SettingItem | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Modals state
  const [reportCardStudent, setReportCardStudent] = useState<StudentItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Fetch Settings for current teacher
  const fetchSettings = useCallback(async () => {
    if (!user || !supabase) return;
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('teacher_id', user.id)
        .maybeSingle();

      if (error) {
        showToast('error', 'Failed to load school settings', error.message);
      } else if (data) {
        setSettings(data);
      }
    } catch (err: any) {
      showToast('error', 'Settings fetch error', err?.message || 'Error querying settings');
    }
  }, [user, showToast]);

  // Fetch Classes for current teacher
  const fetchClasses = useCallback(
    async (preferredClassId?: string) => {
      if (!user || !supabase) return;
      setIsLoadingData(true);
      try {
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .eq('teacher_id', user.id)
          .order('name');

        if (error) {
          showToast('error', 'Failed to load classes', error.message);
          setClasses([]);
          setSelectedClass(null);
        } else {
          const list = data || [];
          setClasses(list);

          // Select preferred, keep current, or default to first
          if (preferredClassId) {
            const found = list.find((c) => c.id === preferredClassId);
            setSelectedClass(found || list[0] || null);
          } else {
            setSelectedClass((prev) => {
              if (prev && list.some((c) => c.id === prev.id)) {
                return list.find((c) => c.id === prev.id) || null;
              }
              return list[0] || null;
            });
          }
        }
      } catch (err: any) {
        showToast('error', 'Classes fetch error', err?.message || 'Error querying classes');
      } finally {
        setIsLoadingData(false);
      }
    },
    [user, showToast]
  );

  // Fetch Subjects, Students, and Marks for selected class
  const fetchClassDetails = useCallback(async () => {
    if (!selectedClass || !supabase) {
      setSubjects([]);
      setStudents([]);
      setMarks([]);
      return;
    }

    try {
      // 1. Fetch Subjects for class
      const { data: subData, error: subError } = await supabase
        .from('subjects')
        .select('*')
        .eq('class_id', selectedClass.id)
        .order('name');

      if (subError) {
        showToast('error', `Failed to load subjects for ${selectedClass.name}`, subError.message);
      } else {
        setSubjects(subData || []);
      }

      // 2. Fetch Students for class
      const { data: stuData, error: stuError } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', selectedClass.id)
        .order('roll_number');

      if (stuError) {
        showToast('error', `Failed to load students for ${selectedClass.name}`, stuError.message);
        setStudents([]);
        setMarks([]);
        return;
      }

      const studentsList = stuData || [];
      setStudents(studentsList);

      // 3. Fetch Marks for students in this class
      if (studentsList.length > 0) {
        const studentIds = studentsList.map((s) => s.id);
        const { data: marksData, error: marksError } = await supabase
          .from('marks')
          .select('*')
          .in('student_id', studentIds);

        if (marksError) {
          showToast('error', 'Failed to load marks from Supabase', marksError.message);
          setMarks([]);
        } else {
          setMarks(marksData || []);
        }
      } else {
        setMarks([]);
      }
    } catch (err: any) {
      showToast('error', 'Data sync error', err?.message || 'Failed to retrieve class details');
    }
  }, [selectedClass, showToast]);

  // Initial load when user signs in
  useEffect(() => {
    if (user) {
      fetchSettings();
      fetchClasses();
    }
  }, [user, fetchSettings, fetchClasses]);

  // When selected class changes, load its subjects, students, marks
  useEffect(() => {
    if (selectedClass) {
      fetchClassDetails();
    }
  }, [selectedClass, fetchClassDetails]);

  // Auto calculate total / percentage / grade / rank
  const calculatedStudents: StudentCalculated[] = React.useMemo(() => {
    return calculateClassStats(students, subjects, marks);
  }, [students, subjects, marks]);

  // Auth Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-slate-100">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mb-4 shadow-xl shadow-indigo-600/30 animate-pulse">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <h3 className="font-bold text-lg font-serif">Loading Marks Manager...</h3>
        <p className="text-xs text-slate-400 mt-1">Connecting to Supabase...</p>
      </div>
    );
  }

  // Not signed in: render teacher auth portal
  if (!user) {
    return (
      <>
        <AuthView />
        <SetupGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        classes={classes}
        selectedClass={selectedClass}
        onSelectClass={setSelectedClass}
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 no-print">
        {activeTab === 'dashboard' && (
          <DashboardView
            selectedClass={selectedClass}
            classes={classes}
            subjects={subjects}
            students={students}
            calculatedStudents={calculatedStudents}
            onNavigateToMarks={() => setActiveTab('marks')}
            onNavigateToStudents={() => setActiveTab('students')}
            onOpenReportCard={(st) => setReportCardStudent(st)}
          />
        )}

        {activeTab === 'marks' && (
          <MarksEntryGrid
            selectedClass={selectedClass}
            subjects={subjects}
            students={students}
            marks={marks}
            onRefreshData={fetchClassDetails}
          />
        )}

        {activeTab === 'students' && (
          <StudentsManager
            selectedClass={selectedClass}
            students={students}
            calculatedStudents={calculatedStudents}
            onRefreshData={fetchClassDetails}
            onOpenReportCard={(st) => setReportCardStudent(st)}
          />
        )}

        {activeTab === 'classes' && (
          <ClassesManager
            classes={classes}
            selectedClass={selectedClass}
            subjects={subjects}
            onSelectClass={setSelectedClass}
            onRefreshData={() => fetchClasses(selectedClass?.id)}
          />
        )}
      </main>

      {/* Printable Report Card Modal */}
      {reportCardStudent && selectedClass && (
        <ReportCardModal
          isOpen={Boolean(reportCardStudent)}
          onClose={() => setReportCardStudent(null)}
          student={reportCardStudent}
          selectedClass={selectedClass}
          subjects={subjects}
          students={students}
          calculatedStudents={calculatedStudents}
          settings={settings}
          onSelectStudent={(st) => setReportCardStudent(st)}
        />
      )}

      {/* School Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsUpdated={(up) => setSettings(up)}
      />

      {/* Schema & Connection Guide Modal */}
      <SetupGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </AuthProvider>
  );
}
