export interface ClassItem {
  id: string;
  teacher_id: string;
  name: string;
  academic_year: string;
  created_at?: string;
}

export interface SubjectItem {
  id: string;
  class_id: string;
  name: string;
  max_marks: number;
}

export interface StudentItem {
  id: string;
  class_id: string;
  roll_number: string;
  name: string;
}

export interface MarkItem {
  id?: string;
  student_id: string;
  subject_id: string;
  marks_obtained: number;
}

export interface SettingItem {
  teacher_id: string;
  school_name: string;
  logo_url: string | null;
}

export type GradeType = 'A' | 'B' | 'C' | 'D' | 'F';

export interface StudentCalculated {
  student: StudentItem;
  subjectMarks: Record<string, number | null>; // subject_id -> marks_obtained
  totalObtained: number;
  totalMax: number;
  percentage: number;
  grade: GradeType;
  rank: number;
  passed: boolean;
}

export interface SubjectStats {
  subject: SubjectItem;
  averageMarks: number;
  averagePercentage: number;
  highestMarks: number;
  lowestMarks: number;
  passCount: number;
  totalStudents: number;
  passRate: number;
}
