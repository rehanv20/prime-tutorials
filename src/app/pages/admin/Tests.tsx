import { useEffect, useState } from 'react';
import { Plus, Trophy, TrendingUp, X } from 'lucide-react';
import type { Student, Test, Mark, Streak } from '../../utils/mockData';

export default function Tests() {
  const [students, setStudents] = useState<Student[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [selectedTest, setSelectedTest] = useState<string>('');
  const [showTestModal, setShowTestModal] = useState(false);
  const [showMarksModal, setShowMarksModal] = useState(false);
  const [testForm, setTestForm] = useState({
    name: '',
    subject: '',
    date: new Date().toISOString().split('T')[0],
    totalMarks: 100,
  });
  const [marksInput, setMarksInput] = useState<Record<string, number>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const studentsData = JSON.parse(localStorage.getItem('primetutorials_students') || '[]');
    const testsData = JSON.parse(localStorage.getItem('primetutorials_tests') || '[]');
    const marksData = JSON.parse(localStorage.getItem('primetutorials_marks') || '[]');
    const streaksData = JSON.parse(localStorage.getItem('primetutorials_streaks') || '[]');

    setStudents(studentsData);
    setTests(testsData);
    setMarks(marksData);
    setStreaks(streaksData);
  };

  const createTest = (e: React.FormEvent) => {
    e.preventDefault();
    const newTest: Test = {
      id: `T${String(tests.length + 1).padStart(3, '0')}`,
      ...testForm,
    };
    const updated = [...tests, newTest];
    localStorage.setItem('primetutorials_tests', JSON.stringify(updated));
    loadData();
    setShowTestModal(false);
    setTestForm({
      name: '',
      subject: '',
      date: new Date().toISOString().split('T')[0],
      totalMarks: 100,
    });
  };

  const openMarksEntry = (testId: string) => {
    setSelectedTest(testId);
    const test = tests.find(t => t.id === testId);
    if (!test) return;

    const eligibleStudents = students.filter(s => s.subjects.includes(test.subject));
    const input: Record<string, number> = {};

    eligibleStudents.forEach(student => {
      const existingMark = marks.find(m => m.testId === testId && m.studentId === student.id);
      input[student.id] = existingMark?.marks || 0;
    });

    setMarksInput(input);
    setShowMarksModal(true);
  };

  const saveMarks = () => {
    const test = tests.find(t => t.id === selectedTest);
    if (!test) return;

    const allMarks = marks.filter(m => m.testId !== selectedTest);
    const newMarks: Mark[] = Object.entries(marksInput).map(([studentId, markValue]) => ({
      id: `M-${selectedTest}-${studentId}`,
      studentId,
      testId: selectedTest,
      marks: markValue,
    }));

    newMarks.sort((a, b) => b.marks - a.marks);
    newMarks.forEach((mark, index) => {
      mark.rank = index + 1;
    });

    const updated = [...allMarks, ...newMarks];
    localStorage.setItem('primetutorials_marks', JSON.stringify(updated));

    calculateAndUpdateStreaks(updated);
    loadData();
    setShowMarksModal(false);
  };

  const calculateAndUpdateStreaks = (allMarks: Mark[]) => {
    const updatedStreaks: Streak[] = students.map(student => {
      const studentMarks = allMarks.filter(m => m.studentId === student.id);
      const testsByDate = tests
        .filter(t => studentMarks.some(m => m.testId === t.id))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const ranksInOrder = testsByDate.map(test => {
        const mark = studentMarks.find(m => m.testId === test.id);
        return mark?.rank || 999;
      });

      let currentStreak = 0;
      let highestStreak = 0;
      let tempStreak = 0;

      for (let i = ranksInOrder.length - 1; i >= 0; i--) {
        if (ranksInOrder[i] === 1) {
          tempStreak++;
          if (i === ranksInOrder.length - 1) {
            currentStreak = tempStreak;
          }
        } else {
          if (tempStreak > highestStreak) {
            highestStreak = tempStreak;
          }
          tempStreak = 0;
        }
      }

      if (tempStreak > highestStreak) {
        highestStreak = tempStreak;
      }

      return {
        studentId: student.id,
        currentStreak,
        highestStreak,
      };
    });

    localStorage.setItem('primetutorials_streaks', JSON.stringify(updatedStreaks));
  };

  const getTestRankings = (testId: string) => {
    const testMarks = marks.filter(m => m.testId === testId);
    return testMarks.sort((a, b) => (a.rank || 999) - (b.rank || 999)).slice(0, 3);
  };

  const getStudentName = (studentId: string) => {
    return students.find(s => s.id === studentId)?.name || 'Unknown';
  };

  const getTopStudents = () => {
    return streaks
      .filter(s => s.currentStreak > 0)
      .sort((a, b) => b.currentStreak - a.currentStreak)
      .slice(0, 3);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl mb-2 text-gray-800">Tests & Marks Management</h1>
          <p className="text-gray-600">Create tests, enter marks, and track rankings</p>
        </div>
        <button
          onClick={() => setShowTestModal(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New Test
        </button>
      </div>

      {/* Topper Streaks */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-8 h-8" />
          <h2 className="text-2xl">Topper Streaks</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {getTopStudents().map((streak, index) => (
            <div key={streak.studentId} className="bg-white/20 backdrop-blur rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white text-orange-600 w-10 h-10 rounded-full flex items-center justify-center">
                  {index + 1}
                </div>
                <div>
                  <p className="text-lg">{getStudentName(streak.studentId)}</p>
                  <p className="text-sm opacity-90">Current: {streak.currentStreak} | Best: {streak.highestStreak}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                <p className="text-sm">{streak.currentStreak} consecutive Rank 1</p>
              </div>
            </div>
          ))}
          {getTopStudents().length === 0 && (
            <div className="col-span-3 text-center py-4">
              <p>No active streaks yet. Start entering test marks!</p>
            </div>
          )}
        </div>
      </div>

      {/* Tests List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tests.map(test => {
          const rankings = getTestRankings(test.id);
          const hasMarks = marks.some(m => m.testId === test.id);

          return (
            <div key={test.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl text-gray-800 mb-1">{test.name}</h3>
                  <p className="text-sm text-gray-600">{test.subject} • {test.date}</p>
                  <p className="text-sm text-gray-600">Total Marks: {test.totalMarks}</p>
                </div>
                <button
                  onClick={() => openMarksEntry(test.id)}
                  className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 text-sm"
                >
                  {hasMarks ? 'Edit Marks' : 'Enter Marks'}
                </button>
              </div>

              {rankings.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-3">Top 3 Rankings:</p>
                  <div className="space-y-2">
                    {rankings.map((mark, index) => (
                      <div key={mark.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            index === 0 ? 'bg-yellow-400 text-yellow-900' :
                            index === 1 ? 'bg-gray-300 text-gray-800' :
                            'bg-orange-300 text-orange-900'
                          }`}>
                            {mark.rank}
                          </div>
                          <span className="text-sm text-gray-800">{getStudentName(mark.studentId)}</span>
                        </div>
                        <span className="text-sm text-gray-800">{mark.marks}/{test.totalMarks}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Test Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-gray-800">Create New Test</h2>
              <button onClick={() => setShowTestModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={createTest} className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">Test Name</label>
                <input
                  type="text"
                  value={testForm.name}
                  onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Subject</label>
                <select
                  value={testForm.subject}
                  onChange={(e) => setTestForm({ ...testForm, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select Subject</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Date</label>
                <input
                  type="date"
                  value={testForm.date}
                  onChange={(e) => setTestForm({ ...testForm, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Total Marks</label>
                <input
                  type="number"
                  value={testForm.totalMarks}
                  onChange={(e) => setTestForm({ ...testForm, totalMarks: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  min="1"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                >
                  Create Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enter Marks Modal */}
      {showMarksModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-gray-800">
                Enter Marks: {tests.find(t => t.id === selectedTest)?.name}
              </h2>
              <button onClick={() => setShowMarksModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {Object.keys(marksInput).map(studentId => (
                <div key={studentId} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <span className="text-gray-800">{getStudentName(studentId)}</span>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={marksInput[studentId]}
                      onChange={(e) => setMarksInput({ ...marksInput, [studentId]: Number(e.target.value) })}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="0"
                      max={tests.find(t => t.id === selectedTest)?.totalMarks}
                    />
                    <span className="text-gray-600">/ {tests.find(t => t.id === selectedTest)?.totalMarks}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-6">
              <button
                onClick={() => setShowMarksModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={saveMarks}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700"
              >
                Save Marks & Calculate Ranks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
