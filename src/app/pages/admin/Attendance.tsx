import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Calendar, TrendingUp, User } from 'lucide-react';
import type { Student, AttendanceRecord } from '../../utils/mockData';

export default function Attendance() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent'>>({});
  const [saved, setSaved] = useState(false);
  const [viewMode, setViewMode] = useState<'mark' | 'history'>('mark');
  const [selectedStudent, setSelectedStudent] = useState<string>('');

  useEffect(() => {
    const studentsData = JSON.parse(localStorage.getItem('primetutorials_students') || '[]');
    setStudents(studentsData);
    if (studentsData.length > 0) {
      setSelectedStudent(studentsData[0].id);
    }
    loadAttendance(selectedDate);
  }, [selectedDate]);

  const loadAttendance = (date: string) => {
    const allAttendance: AttendanceRecord[] = JSON.parse(
      localStorage.getItem('primetutorials_attendance') || '[]'
    );

    const dateAttendance = allAttendance.filter(a => a.date === date);
    const attendanceMap: Record<string, 'present' | 'absent'> = {};

    dateAttendance.forEach(record => {
      attendanceMap[record.studentId] = record.status;
    });

    setAttendance(attendanceMap);
  };

  const markAttendance = (studentId: string, status: 'present' | 'absent') => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status,
    }));
    setSaved(false);
  };

  const saveAttendance = () => {
    const allAttendance: AttendanceRecord[] = JSON.parse(
      localStorage.getItem('primetutorials_attendance') || '[]'
    );

    const filteredAttendance = allAttendance.filter(a => a.date !== selectedDate);

    const newRecords: AttendanceRecord[] = Object.entries(attendance).map(([studentId, status]) => ({
      id: `ATT-${studentId}-${selectedDate}`,
      studentId,
      date: selectedDate,
      status,
    }));

    const updated = [...filteredAttendance, ...newRecords];
    localStorage.setItem('primetutorials_attendance', JSON.stringify(updated));
    setSaved(true);

    setTimeout(() => setSaved(false), 3000);
  };

  const markAllPresent = () => {
    const allPresent: Record<string, 'present' | 'absent'> = {};
    students.forEach(student => {
      allPresent[student.id] = 'present';
    });
    setAttendance(allPresent);
    setSaved(false);
  };

  const calculateAttendanceStats = () => {
    const totalStudents = students.length;
    const present = Object.values(attendance).filter(s => s === 'present').length;
    const absent = Object.values(attendance).filter(s => s === 'absent').length;
    const notMarked = totalStudents - present - absent;

    return { present, absent, notMarked };
  };

  const getStudentAttendanceHistory = (studentId: string) => {
    const allAttendance: AttendanceRecord[] = JSON.parse(
      localStorage.getItem('primetutorials_attendance') || '[]'
    );

    const studentRecords = allAttendance
      .filter(a => a.studentId === studentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 30); // Last 30 records

    const totalDays = studentRecords.length;
    const presentDays = studentRecords.filter(r => r.status === 'present').length;
    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    return {
      records: studentRecords,
      totalDays,
      presentDays,
      absentDays: totalDays - presentDays,
      percentage,
    };
  };

  const stats = calculateAttendanceStats();
  const selectedStudentHistory = selectedStudent ? getStudentAttendanceHistory(selectedStudent) : null;
  const selectedStudentData = students.find(s => s.id === selectedStudent);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl mb-2 text-gray-800">Attendance Management</h1>
        <p className="text-gray-600">Mark daily attendance and view student attendance history</p>
      </div>

      {/* View Mode Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setViewMode('mark')}
          className={`px-6 py-2 rounded-lg transition-colors ${
            viewMode === 'mark'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Mark Attendance
        </button>
        <button
          onClick={() => setViewMode('history')}
          className={`px-6 py-2 rounded-lg transition-colors ${
            viewMode === 'history'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          View History
        </button>
      </div>

      {viewMode === 'mark' ? (
        <>
          {/* Date Selector & Stats */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="flex items-center gap-4">
                <Calendar className="w-6 h-6 text-indigo-600" />
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Present</p>
                  <p className="text-2xl text-green-600">{stats.present}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Absent</p>
                  <p className="text-2xl text-red-600">{stats.absent}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Not Marked</p>
                  <p className="text-2xl text-gray-600">{stats.notMarked}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={markAllPresent}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Mark All Present
            </button>
            <button
              onClick={saveAttendance}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Save Attendance
            </button>
            {saved && (
              <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Saved Successfully
              </span>
            )}
          </div>

          {/* Attendance List */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm text-gray-600">ID</th>
                    <th className="px-6 py-4 text-left text-sm text-gray-600">Student Name</th>
                    <th className="px-6 py-4 text-left text-sm text-gray-600">Subjects</th>
                    <th className="px-6 py-4 text-center text-sm text-gray-600">Status</th>
                    <th className="px-6 py-4 text-center text-sm text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student) => {
                    const status = attendance[student.id];
                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-800">{student.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{student.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {student.subjects.join(', ')}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {status === 'present' && (
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                              <CheckCircle className="w-4 h-4" />
                              Present
                            </span>
                          )}
                          {status === 'absent' && (
                            <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                              <XCircle className="w-4 h-4" />
                              Absent
                            </span>
                          )}
                          {!status && (
                            <span className="text-gray-400 text-sm">Not marked</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => markAttendance(student.id, 'present')}
                              className={`px-4 py-2 rounded-lg transition-colors ${
                                status === 'present'
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-green-100'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => markAttendance(student.id, 'absent')}
                              className={`px-4 py-2 rounded-lg transition-colors ${
                                status === 'absent'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-red-100'
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Student Selector */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <label className="block text-sm mb-2 text-gray-700">Select Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.id})
                </option>
              ))}
            </select>
          </div>

          {/* Student Stats */}
          {selectedStudentHistory && selectedStudentData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <User className="w-8 h-8" />
                  </div>
                  <p className="text-sm opacity-90">Total Days</p>
                  <p className="text-3xl">{selectedStudentHistory.totalDays}</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <p className="text-sm opacity-90">Days Present</p>
                  <p className="text-3xl">{selectedStudentHistory.presentDays}</p>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <XCircle className="w-8 h-8" />
                  </div>
                  <p className="text-sm opacity-90">Days Absent</p>
                  <p className="text-3xl">{selectedStudentHistory.absentDays}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <p className="text-sm opacity-90">Attendance %</p>
                  <p className="text-3xl">{selectedStudentHistory.percentage}%</p>
                </div>
              </div>

              {/* Attendance History Table */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 border-b">
                  <h2 className="text-xl text-gray-800">
                    Attendance History - {selectedStudentData.name} (Last 30 Days)
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm text-gray-600">Date</th>
                        <th className="px-6 py-4 text-left text-sm text-gray-600">Day</th>
                        <th className="px-6 py-4 text-center text-sm text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedStudentHistory.records.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-800">
                            {new Date(record.date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {record.status === 'present' ? (
                              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                                <CheckCircle className="w-4 h-4" />
                                Present
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                                <XCircle className="w-4 h-4" />
                                Absent
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}