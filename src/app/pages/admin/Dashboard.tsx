import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  Users,
  ClipboardCheck,
  DollarSign,
  TrendingUp,
  Award,
  AlertCircle,
} from 'lucide-react';
import { getStudents, getAttendance, getFees, getMarks, getTests, getStreaks } from '../../utils/mockData';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    pendingFees: 0,
    totalRevenue: 0,
    topStudent: '',
    lowAttendanceCount: 0,
  });

  useEffect(() => {
    const students = getStudents();
    const attendance = getAttendance();
    const fees = getFees();
    const marks = getMarks();
    const tests = getTests();
    const streaks = getStreaks();

    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.filter(a => a.date === today);
    const presentToday = todayAttendance.filter(a => a.status === 'present').length;

    const pendingFees = fees.filter(f => f.status === 'pending').length;
    const totalRevenue = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);

    // Calculate attendance percentage for each student
    const studentAttendance = students.map(student => {
      const studentRecords = attendance.filter(a => a.studentId === student.id);
      const present = studentRecords.filter(a => a.status === 'present').length;
      const percentage = (present / studentRecords.length) * 100;
      return { ...student, attendancePercentage: percentage };
    });

    const lowAttendance = studentAttendance.filter(s => s.attendancePercentage < 75).length;

    // Find top student by average marks
    const studentAvgMarks = students.map(student => {
      const studentMarks = marks.filter(m => m.studentId === student.id);
      const avg = studentMarks.length > 0
        ? studentMarks.reduce((sum, m) => sum + m.marks, 0) / studentMarks.length
        : 0;
      return { name: student.name, avg };
    });

    studentAvgMarks.sort((a, b) => b.avg - a.avg);
    const topStudent = studentAvgMarks[0]?.name || 'N/A';

    setStats({
      totalStudents: students.length,
      presentToday,
      pendingFees,
      totalRevenue,
      topStudent,
      lowAttendanceCount: lowAttendance,
    });
  }, []);

  const statCards = [
    {
      icon: Users,
      label: 'Total Students',
      value: stats.totalStudents,
      color: 'bg-blue-500',
      link: '/admin/students',
    },
    {
      icon: ClipboardCheck,
      label: 'Present Today',
      value: stats.presentToday,
      color: 'bg-green-500',
      link: '/admin/attendance',
    },
    {
      icon: DollarSign,
      label: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      color: 'bg-purple-500',
      link: '/admin/fees',
    },
    {
      icon: Award,
      label: 'Top Student',
      value: stats.topStudent,
      color: 'bg-yellow-500',
      link: '/admin/analytics',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              to={card.link}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-gray-600 text-sm mb-1">{card.label}</p>
              <p className="text-2xl text-gray-800">{card.value}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl mb-4 text-gray-800">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/admin/attendance"
              className="block bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-3 rounded-lg transition-colors"
            >
              Mark Today's Attendance
            </Link>
            <Link
              to="/admin/students"
              className="block bg-green-50 hover:bg-green-100 text-green-700 px-4 py-3 rounded-lg transition-colors"
            >
              Add New Student
            </Link>
            <Link
              to="/admin/tests"
              className="block bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-3 rounded-lg transition-colors"
            >
              Create New Test
            </Link>
            <Link
              to="/admin/notifications"
              className="block bg-yellow-50 hover:bg-yellow-100 text-yellow-700 px-4 py-3 rounded-lg transition-colors"
            >
              Send Notification
            </Link>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl mb-4 text-gray-800">Alerts & Warnings</h2>
          <div className="space-y-3">
            {stats.pendingFees > 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-red-800">{stats.pendingFees} Pending Fee Payments</p>
                    <p className="text-sm text-red-600">Review and follow up</p>
                  </div>
                </div>
              </div>
            )}

            {stats.lowAttendanceCount > 0 && (
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-orange-800">{stats.lowAttendanceCount} Students with Low Attendance</p>
                    <p className="text-sm text-orange-600">Below 75% attendance</p>
                  </div>
                </div>
              </div>
            )}

            {stats.pendingFees === 0 && stats.lowAttendanceCount === 0 && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-green-800">All Systems Normal</p>
                    <p className="text-sm text-green-600">No alerts at this time</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
