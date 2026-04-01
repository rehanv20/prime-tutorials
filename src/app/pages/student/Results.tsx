import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Trophy, TrendingUp, Award } from 'lucide-react';

export default function StudentResults() {
  const { user } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [streak, setStreak] = useState({ currentStreak: 0, highestStreak: 0 });
  const [topThree, setTopThree] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.studentId) return;

    const marks = JSON.parse(localStorage.getItem('primetutorials_marks') || '[]');
    const tests = JSON.parse(localStorage.getItem('primetutorials_tests') || '[]');
    const streaks = JSON.parse(localStorage.getItem('primetutorials_streaks') || '[]');

    const studentMarks = marks.filter((m: any) => m.studentId === user.studentId);
    const resultsData = studentMarks.map((mark: any) => {
      const test = tests.find((t: any) => t.id === mark.testId);
      return {
        ...mark,
        testName: test?.name || 'Unknown',
        subject: test?.subject || 'Unknown',
        totalMarks: test?.totalMarks || 100,
        date: test?.date || '',
      };
    });

    resultsData.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const studentStreak = streaks.find((s: any) => s.studentId === user.studentId) || { currentStreak: 0, highestStreak: 0 };

    const latestTest = tests[tests.length - 1];
    if (latestTest) {
      const latestTestMarks = marks
        .filter((m: any) => m.testId === latestTest.id)
        .sort((a: any, b: any) => (a.rank || 999) - (b.rank || 999))
        .slice(0, 3);

      const students = JSON.parse(localStorage.getItem('primetutorials_students') || '[]');
      const top = latestTestMarks.map((m: any) => ({
        ...m,
        name: students.find((s: any) => s.id === m.studentId)?.name || 'Unknown',
      }));

      setTopThree(top);
    }

    setResults(resultsData);
    setStreak(studentStreak);
  }, [user]);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl mb-2 text-gray-800">Test Results & Rankings</h1>
        <p className="text-gray-600">View your performance and rankings</p>
      </div>

      {/* Streak Display */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-8 h-8" />
          <h2 className="text-2xl">Your Topper Streak</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/20 backdrop-blur rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5" />
              <p className="text-sm opacity-90">Current Streak</p>
            </div>
            <p className="text-3xl">{streak.currentStreak} {streak.currentStreak === 1 ? 'test' : 'tests'}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5" />
              <p className="text-sm opacity-90">Highest Streak</p>
            </div>
            <p className="text-3xl">{streak.highestStreak} {streak.highestStreak === 1 ? 'test' : 'tests'}</p>
          </div>
        </div>
      </div>

      {/* Latest Test Top 3 */}
      {topThree.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl mb-4 text-gray-800">Latest Test - Top 3 Rankings</h2>
          <div className="space-y-3">
            {topThree.map((student, index) => (
              <div
                key={student.id}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  student.studentId === user?.studentId ? 'bg-green-50 border-2 border-green-500' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-300 text-gray-800' :
                    'bg-orange-300 text-orange-900'
                  }`}>
                    {student.rank}
                  </div>
                  <span className="text-gray-800">
                    {student.studentId === user?.studentId ? 'You' : student.name}
                  </span>
                </div>
                <span className="text-gray-800">{student.marks} marks</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Results */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Test Name</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Subject</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Date</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Marks</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Rank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.map((result) => (
                <tr key={result.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800">{result.testName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{result.subject}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{result.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {result.marks}/{result.totalMarks}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                      result.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                      result.rank === 2 ? 'bg-gray-100 text-gray-800' :
                      result.rank === 3 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      #{result.rank}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {results.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No test results available yet</p>
        </div>
      )}
    </div>
  );
}
