import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, X, Eye, CheckCircle, XCircle, Award, Calendar, DollarSign, BookOpen, TrendingUp } from 'lucide-react';
import type { Student, FeeRecord, AttendanceRecord, Mark, Test } from '../../utils/mockData';

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [studentDetails, setStudentDetails] = useState<{
    fees: FeeRecord[];
    attendance: AttendanceRecord[];
    marks: Mark[];
    tests: Test[];
  } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    joiningDate: '',
    subjects: [] as string[],
  });

  const availableSubjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology'];

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone.includes(searchTerm)
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const loadStudents = () => {
    const data = JSON.parse(localStorage.getItem('primetutorials_students') || '[]');
    setStudents(data);
    setFilteredStudents(data);
  };

  const handleAdd = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      joiningDate: new Date().toISOString().split('T')[0],
      subjects: [],
    });
    setShowModal(true);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone,
      joiningDate: student.joiningDate,
      subjects: student.subjects,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      const updated = students.filter(s => s.id !== id);
      localStorage.setItem('primetutorials_students', JSON.stringify(updated));
      loadStudents();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingStudent) {
      const updated = students.map(s =>
        s.id === editingStudent.id ? { ...editingStudent, ...formData, loginId: editingStudent.loginId } : s
      );
      localStorage.setItem('primetutorials_students', JSON.stringify(updated));
    } else {
      // Generate unique login ID for new student
      const nextNumber = students.length + 1;
      const loginId = `PT${String(nextNumber).padStart(3, '0')}`;
      
      const newStudent: Student = {
        id: `S${String(students.length + 1).padStart(3, '0')}`,
        ...formData,
        loginId,
        instructor: 'Asim Sir',
      };
      const updated = [...students, newStudent];
      localStorage.setItem('primetutorials_students', JSON.stringify(updated));
      
      // Show login credentials to admin
      alert(`Student added successfully!\n\nLogin ID: ${loginId}\nPassword: student@123\n\nPlease share these credentials with the student.`);
    }

    loadStudents();
    setShowModal(false);
  };

  const toggleSubject = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const viewStudentDetails = (student: Student) => {
    setViewingStudent(student);

    // Load all data for this student
    const fees = JSON.parse(localStorage.getItem('primetutorials_fees') || '[]').filter(
      (f: FeeRecord) => f.studentId === student.id
    );
    const attendance = JSON.parse(localStorage.getItem('primetutorials_attendance') || '[]').filter(
      (a: AttendanceRecord) => a.studentId === student.id
    );
    const marks = JSON.parse(localStorage.getItem('primetutorials_marks') || '[]').filter(
      (m: Mark) => m.studentId === student.id
    );
    const tests = JSON.parse(localStorage.getItem('primetutorials_tests') || '[]');

    setStudentDetails({ fees, attendance, marks, tests });
    setShowDetailsModal(true);
  };

  const calculateAttendancePercentage = (attendance: AttendanceRecord[]) => {
    if (attendance.length === 0) return 0;
    const present = attendance.filter(a => a.status === 'present').length;
    return Math.round((present / attendance.length) * 100);
  };

  const calculateAverageMarks = (marks: Mark[]) => {
    if (marks.length === 0) return 0;
    const total = marks.reduce((sum, m) => sum + m.marks, 0);
    return Math.round((total / marks.length) * 100) / 100;
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl mb-2 text-gray-800">Student Management</h1>
          <p className="text-gray-600">Add, edit, and manage student records</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Add Student
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm text-gray-600">ID</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Login ID</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Name</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Instructor</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Email</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Phone</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Joining Date</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Subjects</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800">{student.id}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-mono">
                      {student.loginId || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">{student.name}</td>
                  <td className="px-6 py-4 text-sm text-indigo-600">{student.instructor || 'Asim Sir'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.joiningDate}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-1">
                      {student.subjects.map(subject => (
                        <span key={subject} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">
                          {subject}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewStudentDetails(student)}
                        className="text-indigo-600 hover:text-indigo-800"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(student)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Details Modal */}
      {showDetailsModal && viewingStudent && studentDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-5xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-gray-800">Student Performance Overview</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setViewingStudent(null);
                  setStudentDetails(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Student Basic Info */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white bg-opacity-20 p-3 rounded-full">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl">{viewingStudent.name}</h3>
                  <p className="text-indigo-100">Student ID: {viewingStudent.id} | Login ID: {viewingStudent.loginId}</p>
                  <p className="text-indigo-100">Instructor: {viewingStudent.instructor || 'Asim Sir'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-indigo-200 text-sm">Email</p>
                  <p className="truncate">{viewingStudent.email}</p>
                </div>
                <div>
                  <p className="text-indigo-200 text-sm">Phone</p>
                  <p>{viewingStudent.phone}</p>
                </div>
                <div>
                  <p className="text-indigo-200 text-sm">Joining Date</p>
                  <p>{new Date(viewingStudent.joiningDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-indigo-200 text-sm">Subjects</p>
                  <p>{viewingStudent.subjects.length}</p>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-gray-600">Attendance</p>
                </div>
                <p className="text-2xl text-gray-800">{calculateAttendancePercentage(studentDetails.attendance)}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {calculateAttendancePercentage(studentDetails.attendance) >= 75 ? 'Regular' : 'Irregular'}
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-gray-600">Average Marks</p>
                </div>
                <p className="text-2xl text-gray-800">{calculateAverageMarks(studentDetails.marks)}%</p>
                <p className="text-xs text-gray-500 mt-1">{studentDetails.marks.length} tests taken</p>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <p className="text-sm text-gray-600">Fees Status</p>
                </div>
                <p className="text-2xl text-gray-800">
                  {studentDetails.fees.filter(f => f.status === 'paid').length}/{studentDetails.fees.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Months Paid</p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <p className="text-sm text-gray-600">Rank 1 Count</p>
                </div>
                <p className="text-2xl text-gray-800">
                  {studentDetails.marks.filter(m => m.rank === 1).length}
                </p>
                <p className="text-xs text-gray-500 mt-1">First positions</p>
              </div>
            </div>

            {/* Detailed Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Test Marks */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg mb-4 text-gray-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Test Performance
                </h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {studentDetails.marks.length > 0 ? (
                    studentDetails.marks.map((mark) => {
                      const test = studentDetails.tests.find(t => t.id === mark.testId);
                      return (
                        <div key={mark.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div>
                            <p className="text-sm text-gray-800">{test?.name || 'Unknown Test'}</p>
                            <p className="text-xs text-gray-500">{test?.subject}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg text-gray-800">{mark.marks}/{test?.totalMarks || 100}</p>
                            <div className="flex items-center gap-1">
                              {mark.rank === 1 && <Award className="w-4 h-4 text-yellow-500" />}
                              <p className="text-xs text-gray-500">Rank: {mark.rank}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 text-center py-4">No test records</p>
                  )}
                </div>
              </div>

              {/* Fees Details */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg mb-4 text-gray-800 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Fees Payment History
                </h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {studentDetails.fees.length > 0 ? (
                    studentDetails.fees.map((fee) => (
                      <div key={fee.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-800">
                            {new Date(fee.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </p>
                          <p className="text-xs text-gray-500">₹{fee.amount.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          {fee.status === 'paid' ? (
                            <div>
                              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                                <CheckCircle className="w-3 h-3" />
                                Paid
                              </span>
                              <p className="text-xs text-gray-500 mt-1">{fee.paidDate}</p>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">
                              <XCircle className="w-3 h-3" />
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No fee records</p>
                  )}
                </div>
              </div>
            </div>

            {/* Attendance Summary */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg mb-4 text-gray-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Attendance Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl text-gray-800">{studentDetails.attendance.length}</p>
                  <p className="text-sm text-gray-600">Total Days</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl text-green-600">
                    {studentDetails.attendance.filter(a => a.status === 'present').length}
                  </p>
                  <p className="text-sm text-gray-600">Present</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl text-red-600">
                    {studentDetails.attendance.filter(a => a.status === 'absent').length}
                  </p>
                  <p className="text-sm text-gray-600">Absent</p>
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <p className="text-2xl text-indigo-600">
                    {calculateAttendancePercentage(studentDetails.attendance) >= 75 ? 'Regular' : 'Irregular'}
                  </p>
                  <p className="text-sm text-gray-600">Status</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-gray-800">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Joining Date</label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Subjects</label>
                <div className="flex flex-wrap gap-2">
                  {availableSubjects.map(subject => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => toggleSubject(subject)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        formData.subjects.includes(subject)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                >
                  {editingStudent ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}