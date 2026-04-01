import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target, Award } from 'lucide-react';

export default function StudentAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    averageMarks: 0,
    highestScore: 0,
    lowestScore: 0,
    subjectPerformance: [] as any[],
    performanceTrend: [] as any[],
  });

  useEffect(() => {
    if (!user?.studentId) return;

    const marks = JSON.parse(localStorage.getItem('primetutorials_marks') || '[]');
    const tests = JSON.parse(localStorage.getItem('primetutorials_tests') || '[]');

    const studentMarks = marks.filter((m: any) => m.studentId === user.studentId);

    if (studentMarks.length === 0) {
      return;
    }

    const marksValues = studentMarks.map((m: any) => m.marks);
    const averageMarks = Math.round(marksValues.reduce((sum: number, m: number) => sum + m, 0) / marksValues.length);
    const highestScore = Math.max(...marksValues);
    const lowestScore = Math.min(...marksValues);

    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology'];
    const subjectPerformance = subjects.map(subject => {
      const subjectTests = tests.filter((t: any) => t.subject === subject);
      const subjectMarks = studentMarks.filter((m: any) =>
        subjectTests.some((t: any) => t.id === m.testId)
      );
      const avg = subjectMarks.length > 0
        ? Math.round(subjectMarks.reduce((sum: number, m: any) => sum + m.marks, 0) / subjectMarks.length)
        : 0;
      return { subject, average: avg };
    }).filter(s => s.average > 0);

    const performanceTrend = studentMarks.map((mark: any) => {
      const test = tests.find((t: any) => t.id === mark.testId);
      return {
        testName: test?.name.slice(0, 15) || 'Test',
        marks: mark.marks,
        date: test?.date || '',
      };
    }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setAnalytics({
      averageMarks,
      highestScore,
      lowestScore,
      subjectPerformance,
      performanceTrend,
    });
  }, [user]);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl mb-2 text-gray-800">My Analytics</h1>
        <p className="text-gray-600">Track your performance and progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
          <Target className="w-8 h-8 mb-4" />
          <p className="text-sm opacity-90">Average Marks</p>
          <p className="text-3xl">{analytics.averageMarks}%</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
          <TrendingUp className="w-8 h-8 mb-4" />
          <p className="text-sm opacity-90">Highest Score</p>
          <p className="text-3xl">{analytics.highestScore}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
          <Award className="w-8 h-8 mb-4" />
          <p className="text-sm opacity-90">Lowest Score</p>
          <p className="text-3xl">{analytics.lowestScore}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl mb-4 text-gray-800">Subject-wise Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.subjectPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="average" fill="#10b981" name="Average Marks" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl mb-4 text-gray-800">Performance Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.performanceTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="testName" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="marks" stroke="#6366f1" strokeWidth={2} name="Marks" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {analytics.performanceTrend.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center mt-6">
          <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No performance data available yet</p>
        </div>
      )}
    </div>
  );
}
