import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Award, AlertTriangle, Calendar, UserCheck, UserX } from 'lucide-react';
import type { Student, Test, Mark, AttendanceRecord } from '../../utils/mockData';

export default function Analytics() {
  const [students, setStudents] = useState<Student[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [analytics, setAnalytics] = useState({
    topStudents: [] as { name: string; avg: number }[],
    weakStudents: [] as { name: string; avg: number }[],
    classAverage: 0,
    subjectPerformance: [] as { subject: string; average: number }[],
    monthlyTrends: [] as { month: string; average: number }[],
    attendanceAnalytics: {
      regularStudents: [] as { id: string; name: string; percentage: number; status: string }[],
      irregularStudents: [] as { id: string; name: string; percentage: number; status: string }[],
      attendanceRanking: [] as { rank: number; name: string; percentage: number; daysPresent: number; totalDays: number }[],
      studentProgress: [] as { name: string; data: { date: string; status: number }[] }[],
      overallAttendance: 0,
    },
  });

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  const loadData = () => {
    const studentsData = JSON.parse(localStorage.getItem('primetutorials_students') || '[]');
    const testsData = JSON.parse(localStorage.getItem('primetutorials_tests') || '[]');
    const marksData = JSON.parse(localStorage.getItem('primetutorials_marks') || '[]');
    const attendanceData = JSON.parse(localStorage.getItem('primetutorials_attendance') || '[]');

    setStudents(studentsData);
    setTests(testsData);
    setMarks(marksData);
    setAttendance(attendanceData);

    calculateAnalytics(studentsData, testsData, marksData, attendanceData);
  };

  const calculateAnalytics = (studentsData: Student[], testsData: Test[], marksData: Mark[], attendanceData: AttendanceRecord[]) => {
    const studentAvgMarks = studentsData.map(student => {
      const studentMarks = marksData.filter(m => m.studentId === student.id);
      const avg = studentMarks.length > 0
        ? studentMarks.reduce((sum, m) => sum + m.marks, 0) / studentMarks.length
        : 0;
      return { name: student.name, avg: Math.round(avg * 100) / 100 };
    });

    studentAvgMarks.sort((a, b) => b.avg - a.avg);
    const topStudents = studentAvgMarks.slice(0, 5);
    const weakStudents = studentAvgMarks.filter(s => s.avg < 70).slice(0, 5);

    const classAverage = studentAvgMarks.length > 0
      ? studentAvgMarks.reduce((sum, s) => sum + s.avg, 0) / studentAvgMarks.length
      : 0;

    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology'];
    const subjectPerformance = subjects.map(subject => {
      const subjectTests = testsData.filter(t => t.subject === subject);
      const subjectMarks = marksData.filter(m =>
        subjectTests.some(t => t.id === m.testId)
      );
      const avg = subjectMarks.length > 0
        ? subjectMarks.reduce((sum, m) => sum + m.marks, 0) / subjectMarks.length
        : 0;
      return { subject, average: Math.round(avg * 100) / 100 };
    });

    const monthlyTrends = calculateMonthlyTrends(testsData, marksData);

    // Calculate attendance analytics
    const attendanceAnalytics = calculateAttendanceAnalytics(studentsData, attendanceData, selectedMonth);

    setAnalytics({
      topStudents,
      weakStudents,
      classAverage: Math.round(classAverage * 100) / 100,
      subjectPerformance,
      monthlyTrends,
      attendanceAnalytics,
    });
  };

  const calculateAttendanceAnalytics = (studentsData: Student[], attendanceData: AttendanceRecord[], month: string) => {
    // Filter attendance for selected month
    const monthAttendance = attendanceData.filter(a => a.date.startsWith(month));
    
    // Get unique dates in the month
    const uniqueDates = [...new Set(monthAttendance.map(a => a.date))];
    const totalDays = uniqueDates.length;

    // Calculate attendance for each student
    const studentAttendance = studentsData.map(student => {
      const studentRecords = monthAttendance.filter(a => a.studentId === student.id);
      const presentDays = studentRecords.filter(a => a.status === 'present').length;
      const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
      
      return {
        id: student.id,
        name: student.name,
        percentage,
        daysPresent: presentDays,
        totalDays,
        status: percentage >= 90 ? 'Excellent' : percentage >= 75 ? 'Good' : percentage >= 60 ? 'Average' : 'Poor',
      };
    });

    // Separate regular and irregular students
    const regularStudents = studentAttendance.filter(s => s.percentage >= 75);
    const irregularStudents = studentAttendance.filter(s => s.percentage < 75);

    // Rank students by attendance
    const attendanceRanking = [...studentAttendance]
      .sort((a, b) => b.percentage - a.percentage)
      .map((student, index) => ({
        rank: index + 1,
        name: student.name,
        percentage: student.percentage,
        daysPresent: student.daysPresent,
        totalDays: student.totalDays,
      }));

    // Calculate student progress (last 30 days)
    const studentProgress = studentsData.slice(0, 5).map(student => {
      const last30Days = attendanceData
        .filter(a => a.studentId === student.id)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-30);

      const data = last30Days.map(a => ({
        date: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        status: a.status === 'present' ? 1 : 0,
      }));

      return {
        name: student.name,
        data,
      };
    });

    // Calculate overall attendance
    const overallAttendance = studentAttendance.length > 0
      ? Math.round(studentAttendance.reduce((sum, s) => sum + s.percentage, 0) / studentAttendance.length)
      : 0;

    return {
      regularStudents,
      irregularStudents,
      attendanceRanking,
      studentProgress,
      overallAttendance,
    };
  };

  const calculateMonthlyTrends = (testsData: Test[], marksData: Mark[]) => {
    const monthMap: Record<string, { total: number; count: number }> = {};

    testsData.forEach(test => {
      const month = test.date.slice(0, 7);
      const testMarks = marksData.filter(m => m.testId === test.id);

      if (!monthMap[month]) {
        monthMap[month] = { total: 0, count: 0 };
      }

      testMarks.forEach(mark => {
        monthMap[month].total += mark.marks;
        monthMap[month].count += 1;
      });
    });

    return Object.entries(monthMap)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        average: Math.round((data.total / data.count) * 100) / 100,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl mb-2 text-gray-800">Analytics & Performance Tracking</h1>
        <p className="text-gray-600">Comprehensive insights into student performance and attendance</p>
      </div>

      {/* Month Selector for Attendance */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <label className="block text-sm mb-2 text-gray-700">Select Month for Attendance Analysis</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="2026-01">January 2026</option>
          <option value="2026-02">February 2026</option>
          <option value="2026-03">March 2026</option>
          <option value="2026-04">April 2026</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8" />
          </div>
          <p className="text-sm opacity-90">Class Average (Marks)</p>
          <p className="text-3xl">{analytics.classAverage}%</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <UserCheck className="w-8 h-8" />
          </div>
          <p className="text-sm opacity-90">Overall Attendance</p>
          <p className="text-3xl">{analytics.attendanceAnalytics.overallAttendance}%</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8" />
          </div>
          <p className="text-sm opacity-90">Regular Students</p>
          <p className="text-3xl">{analytics.attendanceAnalytics.regularStudents.length}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <UserX className="w-8 h-8" />
          </div>
          <p className="text-sm opacity-90">Needs Attention</p>
          <p className="text-3xl">{analytics.attendanceAnalytics.irregularStudents.length}</p>
        </div>
      </div>

      {/* Attendance Ranking */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl text-gray-800">Monthly Attendance Ranking - {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Rank</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Student Name</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Days Present</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Total Days</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Percentage</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analytics.attendanceAnalytics.attendanceRanking.map((student) => (
                <tr key={student.rank} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      student.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                      student.rank === 2 ? 'bg-gray-300 text-gray-800' :
                      student.rank === 3 ? 'bg-orange-300 text-orange-900' :
                      'bg-indigo-100 text-indigo-800'
                    }`}>
                      {student.rank}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">{student.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.daysPresent}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.totalDays}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            student.percentage >= 90 ? 'bg-green-600' :
                            student.percentage >= 75 ? 'bg-blue-600' :
                            student.percentage >= 60 ? 'bg-yellow-600' :
                            'bg-red-600'
                          }`}
                          style={{ width: `${student.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-800">{student.percentage}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                      student.percentage >= 90 ? 'bg-green-100 text-green-700' :
                      student.percentage >= 75 ? 'bg-blue-100 text-blue-700' :
                      student.percentage >= 60 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {student.percentage >= 90 ? 'Excellent' :
                       student.percentage >= 75 ? 'Good' :
                       student.percentage >= 60 ? 'Average' : 'Poor'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Analysis - Regular vs Irregular */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Regular Students (75%+) */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <UserCheck className="w-6 h-6 text-green-600" />
            <h2 className="text-xl text-gray-800">Regular Students (≥75%)</h2>
          </div>
          <div className="space-y-3">
            {analytics.attendanceAnalytics.regularStudents.map((student, index) => (
              <div key={index} className="flex items-center justify-between bg-green-50 p-4 rounded-lg">
                <span className="text-gray-800">{student.name}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${student.percentage}%` }}
                    />
                  </div>
                  <span className="text-green-600 w-12 text-right">{student.percentage}%</span>
                </div>
              </div>
            ))}
            {analytics.attendanceAnalytics.regularStudents.length === 0 && (
              <p className="text-gray-500 text-center py-4">No regular students this month</p>
            )}
          </div>
        </div>

        {/* Irregular Students (<75%) */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <UserX className="w-6 h-6 text-red-600" />
            <h2 className="text-xl text-gray-800">Irregular Students (&lt;75%)</h2>
          </div>
          <div className="space-y-3">
            {analytics.attendanceAnalytics.irregularStudents.map((student, index) => (
              <div key={index} className="flex items-center justify-between bg-red-50 p-4 rounded-lg">
                <span className="text-gray-800">{student.name}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{ width: `${student.percentage}%` }}
                    />
                  </div>
                  <span className="text-red-600 w-12 text-right">{student.percentage}%</span>
                </div>
              </div>
            ))}
            {analytics.attendanceAnalytics.irregularStudents.length === 0 && (
              <p className="text-gray-500 text-center py-4">All students are regular!</p>
            )}
          </div>
        </div>
      </div>

      {/* Individual Student Attendance Progress Chart */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl mb-4 text-gray-800">Individual Student Attendance Progress (Last 30 Days)</h2>

        <div className="mb-4">
          <label className="block text-sm mb-2 text-gray-700">Select Student</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">-- Select a Student --</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        </div>

        {selectedStudentId ? (
          <div>
            {(() => {
              const student = students.find(s => s.id === selectedStudentId);
              if (!student) return null;

              const last30Days = attendance
                .filter(a => a.studentId === student.id)
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(-30);

              const data = last30Days.map(a => ({
                date: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                status: a.status === 'present' ? 1 : 0,
              }));

              return (
                <div>
                  <h3 className="text-lg mb-3 text-gray-700">{student.name}'s Attendance</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 1]} ticks={[0, 1]} tickFormatter={(value) => value === 1 ? 'Present' : 'Absent'} />
                      <Tooltip formatter={(value) => value === 1 ? 'Present' : 'Absent'} />
                      <Line type="stepAfter" dataKey="status" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              );
            })()}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Please select a student to view their attendance chart</p>
        )}
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Subject-wise Performance */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl mb-4 text-gray-800">Subject-wise Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.subjectPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="average" fill="#6366f1" name="Average Marks" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl mb-4 text-gray-800">Monthly Performance Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="average" stroke="#10b981" strokeWidth={2} name="Class Average" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Student Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Students */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6 text-green-600" />
            <h2 className="text-xl text-gray-800">Top 5 Students (Marks)</h2>
          </div>
          <div className="space-y-3">
            {analytics.topStudents.map((student, index) => (
              <div key={index} className="flex items-center justify-between bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-300 text-gray-800' :
                    index === 2 ? 'bg-orange-300 text-orange-900' :
                    'bg-green-200 text-green-800'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-gray-800">{student.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">{student.avg}%</span>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
            ))}
            {analytics.topStudents.length === 0 && (
              <p className="text-gray-500 text-center py-4">No data available yet</p>
            )}
          </div>
        </div>

        {/* Students Needing Attention */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl text-gray-800">Students Needing Attention (Marks)</h2>
          </div>
          <div className="space-y-3">
            {analytics.weakStudents.map((student, index) => (
              <div key={index} className="flex items-center justify-between bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-200 text-orange-800 flex items-center justify-center">
                    !
                  </div>
                  <span className="text-gray-800">{student.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-600">{student.avg}%</span>
                  <TrendingDown className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            ))}
            {analytics.weakStudents.length === 0 && (
              <p className="text-gray-500 text-center py-4">All students performing well!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}