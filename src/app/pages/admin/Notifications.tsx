import { useEffect, useState } from 'react';
import { Plus, Bell, Info, AlertTriangle, CheckCircle, X } from 'lucide-react';
import type { Notification } from '../../utils/mockData';

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    message: '',
    type: 'info' as 'info' | 'warning' | 'success',
  });

  useEffect(() => {
    const notificationsData = JSON.parse(localStorage.getItem('primetutorials_notifications') || '[]');
    setNotifications(notificationsData);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newNotification: Notification = {
      id: `NOT${String(notifications.length + 1).padStart(3, '0')}`,
      ...formData,
      date: new Date().toISOString().split('T')[0],
    };
    const updated = [newNotification, ...notifications];
    localStorage.setItem('primetutorials_notifications', JSON.stringify(updated));
    setNotifications(updated);
    setShowModal(false);
    setFormData({ message: '', type: 'info' });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getColorClasses = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl mb-2 text-gray-800">Notifications</h1>
          <p className="text-gray-600">Send announcements to students</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Send Notification
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`border rounded-xl p-6 ${getColorClasses(notification.type)}`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <p className="text-gray-800 mb-2">{notification.message}</p>
                <p className="text-sm opacity-75">{notification.date}</p>
              </div>
              <Bell className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-gray-800">Send Notification</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="info">Information</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                </select>
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
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
