export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  joiningDate: string;
  subjects: string[];
  loginId?: string; // Unique ID for student login
  instructor?: string; // Instructor name
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent';
}

export interface FeeRecord {
  id: string;
  studentId: string;
  amount: number;
  status: 'paid' | 'pending';
  month: string;
  paidDate?: string;
}

export interface Test {
  id: string;
  name: string;
  subject: string;
  date: string;
  totalMarks: number;
}

export interface Mark {
  id: string;
  studentId: string;
  testId: string;
  marks: number;
  rank?: number;
}

export interface Streak {
  studentId: string;
  currentStreak: number;
  highestStreak: number;
}

export interface Note {
  id: string;
  title: string;
  subject: string;
  date: string;
  fileType: 'pdf' | 'image' | 'document';
  fileName: string;
  fileData?: string; // Base64 encoded file data for uploads
}

export interface Schedule {
  id: string;
  day: string;
  subject: string;
  time: string;
}

export interface Notification {
  id: string;
  message: string;
  date: string;
  type: 'info' | 'warning' | 'success';
}

const mockStudents: Student[] = [
  {
    id: 'S001',
    name: 'Rahul Sharma',
    email: 'rahul@student.com',
    phone: '9876543210',
    joiningDate: '2025-01-15',
    subjects: ['Mathematics', 'Physics', 'Chemistry'],
    loginId: 'PT001',
    instructor: 'Asim Sir',
  },
  {
    id: 'S002',
    name: 'Priya Patel',
    email: 'priya@student.com',
    phone: '9876543211',
    joiningDate: '2025-01-20',
    subjects: ['Mathematics', 'Physics', 'Biology'],
    loginId: 'PT002',
    instructor: 'Asim Sir',
  },
  {
    id: 'S003',
    name: 'Amit Kumar',
    email: 'amit@student.com',
    phone: '9876543212',
    joiningDate: '2025-02-01',
    subjects: ['Mathematics', 'Chemistry'],
    loginId: 'PT003',
    instructor: 'Asim Sir',
  },
  {
    id: 'S004',
    name: 'Sneha Reddy',
    email: 'sneha@student.com',
    phone: '9876543213',
    joiningDate: '2025-02-05',
    subjects: ['Physics', 'Chemistry', 'Biology'],
    loginId: 'PT004',
    instructor: 'Asim Sir',
  },
  {
    id: 'S005',
    name: 'Vikram Singh',
    email: 'vikram@student.com',
    phone: '9876543214',
    joiningDate: '2025-01-10',
    subjects: ['Mathematics', 'Physics'],
    loginId: 'PT005',
    instructor: 'Asim Sir',
  },
];

const generateAttendance = (): AttendanceRecord[] => {
  const attendance: AttendanceRecord[] = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    mockStudents.forEach((student) => {
      attendance.push({
        id: `ATT-${student.id}-${dateStr}`,
        studentId: student.id,
        date: dateStr,
        status: Math.random() > 0.2 ? 'present' : 'absent',
      });
    });
  }

  return attendance;
};

const generateFees = (): FeeRecord[] => {
  const fees: FeeRecord[] = [];
  const months = ['2026-01', '2026-02', '2026-03', '2026-04'];

  mockStudents.forEach((student) => {
    months.forEach((month) => {
      const isPaid = Math.random() > 0.3;
      fees.push({
        id: `FEE-${student.id}-${month}`,
        studentId: student.id,
        amount: 5000,
        status: isPaid ? 'paid' : 'pending',
        month,
        paidDate: isPaid ? `${month}-${Math.floor(Math.random() * 28) + 1}` : undefined,
      });
    });
  });

  return fees;
};

const mockTests: Test[] = [
  {
    id: 'T001',
    name: 'Mathematics Weekly Test 1',
    subject: 'Mathematics',
    date: '2026-03-01',
    totalMarks: 100,
  },
  {
    id: 'T002',
    name: 'Physics Monthly Test',
    subject: 'Physics',
    date: '2026-03-10',
    totalMarks: 100,
  },
  {
    id: 'T003',
    name: 'Chemistry Weekly Test 1',
    subject: 'Chemistry',
    date: '2026-03-15',
    totalMarks: 100,
  },
  {
    id: 'T004',
    name: 'Mathematics Weekly Test 2',
    subject: 'Mathematics',
    date: '2026-03-22',
    totalMarks: 100,
  },
  {
    id: 'T005',
    name: 'Physics Weekly Test',
    subject: 'Physics',
    date: '2026-03-25',
    totalMarks: 100,
  },
];

const generateMarks = (): Mark[] => {
  const marks: Mark[] = [];

  mockTests.forEach((test) => {
    const studentsForSubject = mockStudents.filter(s => s.subjects.includes(test.subject));
    const testMarks: Mark[] = [];

    studentsForSubject.forEach((student) => {
      const markValue = Math.floor(Math.random() * 30) + 70; // 70-100 range
      testMarks.push({
        id: `M-${test.id}-${student.id}`,
        studentId: student.id,
        testId: test.id,
        marks: markValue,
      });
    });

    // Sort by marks and assign ranks
    testMarks.sort((a, b) => b.marks - a.marks);
    testMarks.forEach((mark, index) => {
      mark.rank = index + 1;
    });

    marks.push(...testMarks);
  });

  return marks;
};

const calculateStreaks = (marks: Mark[]): Streak[] => {
  const streaks: Streak[] = [];

  mockStudents.forEach((student) => {
    const studentMarks = marks.filter(m => m.studentId === student.id);
    const ranksInOrder = mockTests
      .map(test => studentMarks.find(m => m.testId === test.id)?.rank || 999)
      .reverse();

    let currentStreak = 0;
    let highestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < ranksInOrder.length; i++) {
      if (ranksInOrder[i] === 1) {
        tempStreak++;
        if (i === ranksInOrder.length - 1) {
          currentStreak = tempStreak;
        }
        highestStreak = Math.max(highestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    streaks.push({
      studentId: student.id,
      currentStreak,
      highestStreak,
    });
  });

  return streaks;
};

const mockNotes: Note[] = [
  {
    id: 'N001',
    title: 'Calculus Fundamentals',
    subject: 'Mathematics',
    date: '2026-03-01',
    fileType: 'pdf',
    fileName: 'calculus_notes.pdf',
  },
  {
    id: 'N002',
    title: 'Newton\'s Laws of Motion',
    subject: 'Physics',
    date: '2026-03-05',
    fileType: 'pdf',
    fileName: 'newtons_laws.pdf',
  },
  {
    id: 'N003',
    title: 'Organic Chemistry Basics',
    subject: 'Chemistry',
    date: '2026-03-10',
    fileType: 'document',
    fileName: 'organic_chem.docx',
  },
  {
    id: 'N004',
    title: 'Trigonometry Formulas',
    subject: 'Mathematics',
    date: '2026-03-15',
    fileType: 'image',
    fileName: 'trig_formulas.png',
  },
];

const mockSchedule: Schedule[] = [
  { id: 'SCH001', day: 'Monday', subject: 'Mathematics', time: '10:00 AM - 11:30 AM' },
  { id: 'SCH002', day: 'Monday', subject: 'Physics', time: '2:00 PM - 3:30 PM' },
  { id: 'SCH003', day: 'Tuesday', subject: 'Chemistry', time: '10:00 AM - 11:30 AM' },
  { id: 'SCH004', day: 'Wednesday', subject: 'Mathematics', time: '10:00 AM - 11:30 AM' },
  { id: 'SCH005', day: 'Wednesday', subject: 'Biology', time: '2:00 PM - 3:30 PM' },
  { id: 'SCH006', day: 'Thursday', subject: 'Physics', time: '10:00 AM - 11:30 AM' },
  { id: 'SCH007', day: 'Friday', subject: 'Chemistry', time: '10:00 AM - 11:30 AM' },
  { id: 'SCH008', day: 'Friday', subject: 'Mathematics', time: '2:00 PM - 3:30 PM' },
];

const mockNotifications: Notification[] = [
  {
    id: 'NOT001',
    message: 'Physics test scheduled for March 30th',
    date: '2026-03-28',
    type: 'info',
  },
  {
    id: 'NOT002',
    message: 'Class cancelled on April 2nd due to public holiday',
    date: '2026-03-30',
    type: 'warning',
  },
  {
    id: 'NOT003',
    message: 'New study material uploaded for Mathematics',
    date: '2026-04-01',
    type: 'success',
  },
];

export const initializeMockData = () => {
  if (!localStorage.getItem('primetutorials_initialized')) {
    const attendance = generateAttendance();
    const fees = generateFees();
    const marks = generateMarks();
    const streaks = calculateStreaks(marks);

    localStorage.setItem('primetutorials_students', JSON.stringify(mockStudents));
    localStorage.setItem('primetutorials_attendance', JSON.stringify(attendance));
    localStorage.setItem('primetutorials_fees', JSON.stringify(fees));
    localStorage.setItem('primetutorials_tests', JSON.stringify(mockTests));
    localStorage.setItem('primetutorials_marks', JSON.stringify(marks));
    localStorage.setItem('primetutorials_streaks', JSON.stringify(streaks));
    localStorage.setItem('primetutorials_notes', JSON.stringify(mockNotes));
    localStorage.setItem('primetutorials_schedule', JSON.stringify(mockSchedule));
    localStorage.setItem('primetutorials_notifications', JSON.stringify(mockNotifications));
    localStorage.setItem('primetutorials_initialized', 'true');
  }
};

export const getStudents = (): Student[] => {
  return JSON.parse(localStorage.getItem('primetutorials_students') || '[]');
};

export const getAttendance = (): AttendanceRecord[] => {
  return JSON.parse(localStorage.getItem('primetutorials_attendance') || '[]');
};

export const getFees = (): FeeRecord[] => {
  return JSON.parse(localStorage.getItem('primetutorials_fees') || '[]');
};

export const getTests = (): Test[] => {
  return JSON.parse(localStorage.getItem('primetutorials_tests') || '[]');
};

export const getMarks = (): Mark[] => {
  return JSON.parse(localStorage.getItem('primetutorials_marks') || '[]');
};

export const getStreaks = (): Streak[] => {
  return JSON.parse(localStorage.getItem('primetutorials_streaks') || '[]');
};

export const getNotes = (): Note[] => {
  return JSON.parse(localStorage.getItem('primetutorials_notes') || '[]');
};

export const getSchedule = (): Schedule[] => {
  return JSON.parse(localStorage.getItem('primetutorials_schedule') || '[]');
};

export const getNotifications = (): Notification[] => {
  return JSON.parse(localStorage.getItem('primetutorials_notifications') || '[]');
};