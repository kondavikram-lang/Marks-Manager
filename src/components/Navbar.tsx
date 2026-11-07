import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ClassItem, SettingItem } from '../types/database';
import {
  GraduationCap,
  Layers,
  Users,
  FileSpreadsheet,
  BarChart3,
  Settings,
  LogOut,
  Database,
  ChevronDown,
  School,
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'classes' | 'students' | 'marks';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  classes: ClassItem[];
  selectedClass: ClassItem | null;
  onSelectClass: (c: ClassItem) => void;
  settings: SettingItem | null;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  classes,
  selectedClass,
  onSelectClass,
  settings,
  onOpenSettings,
  onOpenGuide,
}) => {
  const { user, signOut } = useAuth();

  const schoolName = settings?.school_name || 'Marks Manager';
  const logoUrl = settings?.logo_url;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & School Branding */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 overflow-hidden">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={schoolName}
                  className="w-full h-full object-contain p-1"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <GraduationCap className="w-5 h-5" />
              )}
            </div>
            <div className="hidden sm:block">
              <h1 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-tight tracking-tight truncate max-w-[180px] md:max-w-xs">
                {schoolName}
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">Marks & Grading Portal</p>
            </div>
          </div>

          {/* Center: Class Switcher Dropdown */}
          <div className="flex items-center">
            {classes.length > 0 ? (
              <div className="relative">
                <select
                  value={selectedClass?.id || ''}
                  onChange={(e) => {
                    const found = classes.find((c) => c.id === e.target.value);
                    if (found) onSelectClass(found);
                  }}
                  className="appearance-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-1.5 pl-3 pr-8 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.academic_year})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            ) : (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                No classes created yet
              </span>
            )}
          </div>

          {/* Right Section: Settings, Guide, User profile, Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={onOpenGuide}
              title="Database & Env Setup Guide"
              className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Database className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenSettings}
              title="School & Brand Settings"
              className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Settings className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[130px]">
                {user?.email?.split('@')[0]}
              </span>
              <span className="text-[10px] text-slate-400">Teacher Account</span>
            </div>

            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold transition cursor-pointer shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onTabChange('marks')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold transition cursor-pointer shrink-0 ${
              activeTab === 'marks'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Marks Entry Grid</span>
          </button>

          <button
            onClick={() => onTabChange('students')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold transition cursor-pointer shrink-0 ${
              activeTab === 'students'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Students Roster</span>
          </button>

          <button
            onClick={() => onTabChange('classes')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold transition cursor-pointer shrink-0 ${
              activeTab === 'classes'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Classes & Subjects</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
