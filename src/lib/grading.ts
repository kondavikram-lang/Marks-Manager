import { StudentItem, SubjectItem, MarkItem, StudentCalculated, GradeType, SubjectStats } from '../types/database';

/**
 * Calculates grade according to requirements:
 * 90+ A
 * 75+ B
 * 60+ C
 * 40+ D
 * below 40 F
 */
export function calculateGrade(percentage: number): GradeType {
  const rounded = Math.round(percentage * 100) / 100;
  if (rounded >= 90) return 'A';
  if (rounded >= 75) return 'B';
  if (rounded >= 60) return 'C';
  if (rounded >= 40) return 'D';
  return 'F';
}

export function getGradeBadgeClasses(grade: GradeType): string {
  switch (grade) {
    case 'A':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
    case 'B':
      return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
    case 'C':
      return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
    case 'D':
      return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800';
    case 'F':
      return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

export function getGradeRemarks(grade: GradeType): string {
  switch (grade) {
    case 'A':
      return 'Outstanding Performance';
    case 'B':
      return 'Very Good Performance';
    case 'C':
      return 'Good - Keep Progressing';
    case 'D':
      return 'Satisfactory - Needs Practice';
    case 'F':
      return 'Needs Attention & Improvement';
  }
}

/**
 * Calculates student total, percentage, grade, and ranking for a list of students
 */
export function calculateClassStats(
  students: StudentItem[],
  subjects: SubjectItem[],
  marks: MarkItem[]
): StudentCalculated[] {
  // Map of student_id -> { subject_id -> marks_obtained }
  const marksMap = new Map<string, Map<string, number>>();
  for (const m of marks) {
    if (!marksMap.has(m.student_id)) {
      marksMap.set(m.student_id, new Map());
    }
    marksMap.get(m.student_id)!.set(m.subject_id, Number(m.marks_obtained));
  }

  const subjectMaxMap = new Map<string, number>();
  let totalClassMaxMarks = 0;
  for (const sub of subjects) {
    const maxM = Number(sub.max_marks) || 100;
    subjectMaxMap.set(sub.id, maxM);
    totalClassMaxMarks += maxM;
  }

  // Pre-calculate raw numbers for each student
  const rawCalculated = students.map((student) => {
    const studentMarksObj: Record<string, number | null> = {};
    let totalObtained = 0;
    const studentSubMarks = marksMap.get(student.id);

    subjects.forEach((sub) => {
      if (studentSubMarks && studentSubMarks.has(sub.id)) {
        const val = studentSubMarks.get(sub.id)!;
        studentMarksObj[sub.id] = val;
        totalObtained += val;
      } else {
        studentMarksObj[sub.id] = null;
      }
    });

    const percentage = totalClassMaxMarks > 0 ? (totalObtained / totalClassMaxMarks) * 100 : 0;
    const grade = calculateGrade(percentage);
    const passed = grade !== 'F';

    return {
      student,
      subjectMarks: studentMarksObj,
      totalObtained: Math.round(totalObtained * 100) / 100,
      totalMax: totalClassMaxMarks,
      percentage: Math.round(percentage * 100) / 100,
      grade,
      rank: 1, // Will assign next
      passed,
    };
  });

  // Assign standard competition ranking based on totalObtained descending
  // Ties receive identical ranks, subsequent rank is offset by count of preceding items
  const sorted = [...rawCalculated].sort((a, b) => b.totalObtained - a.totalObtained);

  let currentRank = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].totalObtained < sorted[i - 1].totalObtained) {
      currentRank = i + 1;
    }
    sorted[i].rank = currentRank;
  }

  // Return mapped back in original or sorted order
  return rawCalculated;
}

/**
 * Calculates per-subject analytics
 */
export function calculateSubjectAnalytics(
  subjects: SubjectItem[],
  students: StudentItem[],
  marks: MarkItem[]
): SubjectStats[] {
  const marksBySubject = new Map<string, number[]>();
  for (const m of marks) {
    if (!marksBySubject.has(m.subject_id)) {
      marksBySubject.set(m.subject_id, []);
    }
    marksBySubject.get(m.subject_id)!.push(Number(m.marks_obtained));
  }

  return subjects.map((sub) => {
    const scores = marksBySubject.get(sub.id) || [];
    const maxMarks = Number(sub.max_marks) || 100;
    const totalCount = scores.length;

    if (totalCount === 0) {
      return {
        subject: sub,
        averageMarks: 0,
        averagePercentage: 0,
        highestMarks: 0,
        lowestMarks: 0,
        passCount: 0,
        totalStudents: students.length,
        passRate: 0,
      };
    }

    const sum = scores.reduce((acc, curr) => acc + curr, 0);
    const avg = sum / totalCount;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const passThreshold = maxMarks * 0.4; // 40% is passing
    const passCount = scores.filter((score) => score >= passThreshold).length;
    const passRate = (passCount / totalCount) * 100;
    const avgPercentage = (avg / maxMarks) * 100;

    return {
      subject: sub,
      averageMarks: Math.round(avg * 10) / 10,
      averagePercentage: Math.round(avgPercentage * 10) / 10,
      highestMarks: highest,
      lowestMarks: lowest,
      passCount,
      totalStudents: totalCount,
      passRate: Math.round(passRate * 10) / 10,
    };
  });
}
