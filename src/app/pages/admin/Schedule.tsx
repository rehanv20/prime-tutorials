import { useEffect, useState } from 'react';
import { Plus, Clock, X } from 'lucide-react';
import type { Schedule } from '../../utils/mockData';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    day: '',
    subject: '',
    time: '',
  });

  useEffect(() => {
    const scheduleData = JSON.parse(localStorage.getItem('primetutorials_schedule') || '[]');
    setSchedule(scheduleData);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSchedule: Schedule = {
      id: `SCH${String(schedule.length + 1).padStart(3, '0')}`,
      ...formData,
    };
    const updated = [...schedule, newSchedule];
    localStorage.setItem('primetutorials_schedule', JSON.stringify(updated));
    setSchedule(updated);
    setShowModal(false);
    setFormData({ day: '', subject: '', time: '' });
  };

  const getScheduleByDay = (day: string) => {
    return schedule.filter(s => s.day === day);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl mb-2 text-gray-800">Class Schedule</h1>
          <p className="text-gray-600">Manage weekly class timings</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Class
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {days.map(day => (
          <div key={day} className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg text-gray-800 mb-4">{day}</h3>
            <div className="space-y-3">
              {getScheduleByDay(day).map(item => (
                <div key={item.id} className="bg-indigo-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm text-indigo-800">{item.time}</span>
                  </div>
                  <p className="text-gray-800">{item.subject}</p>
                </div>
              ))}
              {getScheduleByDay(day).length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">No classes scheduled</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-gray-800">Add Class to Schedule</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">Day</label>
                <select
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select Day</option>
                  {days.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
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
                <label className="block text-sm mb-2 text-gray-700">Time</label>
                <input
                  type="text"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 10:00 AM - 11:30 AM"
                  required
                />
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
                  Add Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
