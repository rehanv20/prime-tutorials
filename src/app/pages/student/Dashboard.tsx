import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, DollarSign, Bell, Calendar, Award } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    attendancePercentage: 0,
    feeStatus: '',
    upcomingClasses: [] as any[],
    notifications: [] as any[],
    recentRank: 0,
    currentStreak: 0,
  });

  useEffect(() => {
    if (!user?.studentId) return;

    const attendance = JSON.parse(localStorage.getItem('primetutorials_attendance') || '[]');
    const fees = JSON.parse(localStorage.getItem('primetutorials_fees') || '[]');
    const schedule = JSON.parse(localStorage.getItem('primetutorials_schedule') || '[]');
    const notifications = JSON.parse(localStorage.getItem('primetutorials_notifications') || '[]');
    const marks = JSON.parse(localStorage.getItem('primetutorials_marks') || '[]');
    const streaks = JSON.parse(localStorage.getItem('primetutorials_streaks') || '[]');

    const studentAttendance = attendance.filter((a: any) => a.studentId === user.studentId);
    const presentCount = studentAttendance.filter((a: any) => a.status === 'present').length;
    const attendancePercentage = studentAttendance.length > 0
      ? Math.round((presentCount / studentAttendance.length) * 100)
      : 0;

    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthFees = fees.filter((f: any) => f.studentId === user.studentId && f.month === currentMonth);
    const feeStatus = monthFees.length > 0 && monthFees[0].status === 'paid' ? 'Paid' : 'Pending';

    const studentMarks = marks.filter((m: any) => m.studentId === user.studentId);
    const recentMark = studentMarks.length > 0 ? studentMarks[studentMarks.length - 1] : null;
    const recentRank = recentMark?.rank || 0;

    const studentStreak = streaks.find((s: any) => s.studentId === user.studentId);
    const currentStreak = studentStreak?.currentStreak || 0;

    setStats({
      attendancePercentage,
      feeStatus,
      upcomingClasses: schedule.slice(0, 3),
      notifications: notifications.slice(0, 3),
      recentRank,
      currentStreak,
    });
  }, [user]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-gray-800">Welcome, {user?.name}!</h1>
        <p className="text-gray-600">Here's your dashboard overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
          <Clock className="w-8 h-8 mb-4" />
          <p className="text-sm opacity-90">Attendance</p>
          <p className="text-3xl">{stats.attendancePercentage}%</p>
        </div>

        <div className={`bg-gradient-to-br ${stats.feeStatus === 'Paid' ? 'from-green-500 to-green-600' : 'from-orange-500 to-orange-600'} text-white rounded-xl p-6`}>
          <DollarSign className="w-8 h-8 mb-4" />
          <p className="text-sm opacity-90">Fee Status</p>
          <p className="text-2xl">{stats.feeStatus}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
          <Award className="w-8 h-8 mb-4" />
          <p className="text-sm opacity-90">Recent Rank</p>
          <p className="text-3xl">{stats.recentRank > 0 ? `#${stats.recentRank}` : 'N/A'}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-6">
          <Award className="w-8 h-8 mb-4" />
          <p className="text-sm opacity-90">Current Streak</p>
          <p className="text-3xl">{stats.currentStreak}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-green-600" />
            <h2 className="text-xl text-gray-800">Upcoming Classes</h2>
          </div>
          <div className="space-y-3">
            {stats.upcomingClasses.map((item: any) => (
              <div key={item.id} className="bg-green-50 p-4 rounded-lg">
                <p className="text-gray-800">{item.subject}</p>
                <p className="text-sm text-gray-600">{item.day} • {item.time}</p>
              </div>
            ))}
            {stats.upcomingClasses.length === 0 && (
              <p className="text-gray-500 text-center py-4">No upcoming classes</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl text-gray-800">Notifications</h2>
          </div>
          <div className="space-y-3">
            {stats.notifications.map((notification: any) => (
              <div key={notification.id} className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
                <p className="text-gray-800 text-sm">{notification.message}</p>
                <p className="text-xs text-gray-600 mt-1">{notification.date}</p>
              </div>
            ))}
            {stats.notifications.length === 0 && (
              <p className="text-gray-500 text-center py-4">No new notifications</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
