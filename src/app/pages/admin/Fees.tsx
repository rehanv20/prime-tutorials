import { useEffect, useState } from 'react';
import { DollarSign, CheckCircle, Clock, TrendingUp, Undo2, X } from 'lucide-react';
import type { Student, FeeRecord } from '../../utils/mockData';

export default function Fees() {
  const [students, setStudents] = useState<Student[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);
  const [payment, setPayment] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const studentsData = JSON.parse(localStorage.getItem('primetutorials_students') || '[]');
    const feesData = JSON.parse(localStorage.getItem('primetutorials_fees') || '[]');
    setStudents(studentsData);
    setFees(feesData);
  };

  const openPaymentDialog = (fee: FeeRecord) => {
    setSelectedFee(fee);
    setPayment({
      amount: fee.amount.toString(),
      date: new Date().toISOString().split('T')[0],
    });
    setShowPaymentDialog(true);
  };

  const handleMarkAsPaid = () => {
    if (!payment.amount || !payment.date) {
      alert('Please enter both amount and date');
      return;
    }

    const amount = parseFloat(payment.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!selectedFee) return;

    const updated = fees.map(fee =>
      fee.id === selectedFee.id
        ? { ...fee, status: 'paid' as const, amount, paidDate: payment.date }
        : fee
    );
    localStorage.setItem('primetutorials_fees', JSON.stringify(updated));
    setFees(updated);
    setShowPaymentDialog(false);
    setSelectedFee(null);
    setPayment({ amount: '', date: new Date().toISOString().split('T')[0] });
  };

  const handleUndo = (feeId: string) => {
    if (confirm('Are you sure you want to mark this payment as pending again?')) {
      const updated = fees.map(fee =>
        fee.id === feeId
          ? { ...fee, status: 'pending' as const, paidDate: undefined }
          : fee
      );
      localStorage.setItem('primetutorials_fees', JSON.stringify(updated));
      setFees(updated);
    }
  };

  const getStudentName = (studentId: string) => {
    return students.find(s => s.id === studentId)?.name || 'Unknown';
  };

  const filteredFees = fees.filter(fee => {
    const monthMatch = selectedMonth === 'all' || fee.month === selectedMonth;
    const statusMatch = filterStatus === 'all' || fee.status === filterStatus;
    return monthMatch && statusMatch;
  });

  const calculateStats = () => {
    const currentMonthFees = fees.filter(f => f.month === selectedMonth);
    const totalRevenue = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
    const currentMonthRevenue = currentMonthFees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
    const pending = currentMonthFees.filter(f => f.status === 'pending').length;
    const collected = currentMonthFees.filter(f => f.status === 'paid').length;

    return { totalRevenue, currentMonthRevenue, pending, collected };
  };

  const stats = calculateStats();

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl mb-2 text-gray-800">Fees Management</h1>
        <p className="text-gray-600">Track and manage student fee payments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-sm opacity-90">Total Revenue</p>
          <p className="text-2xl">₹{stats.totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8" />
          </div>
          <p className="text-sm opacity-90">Current Month</p>
          <p className="text-2xl">₹{stats.currentMonthRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8" />
          </div>
          <p className="text-sm opacity-90">Collected</p>
          <p className="text-2xl">{stats.collected}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8" />
          </div>
          <p className="text-sm opacity-90">Pending</p>
          <p className="text-2xl">{stats.pending}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm mb-2 text-gray-700">Filter by Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Months</option>
              <option value="2026-01">January 2026</option>
              <option value="2026-02">February 2026</option>
              <option value="2026-03">March 2026</option>
              <option value="2026-04">April 2026</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm mb-2 text-gray-700">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'paid' | 'pending')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      {showPaymentDialog && selectedFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl text-gray-800">Mark as Paid</h2>
              <button
                onClick={() => {
                  setShowPaymentDialog(false);
                  setSelectedFee(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Recording payment for <span className="font-semibold">{getStudentName(selectedFee.studentId)}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">Student Name</label>
                <input
                  type="text"
                  value={getStudentName(selectedFee.studentId)}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Amount (₹)</label>
                <input
                  type="number"
                  value={payment.amount}
                  onChange={(e) => setPayment({ ...payment, amount: e.target.value })}
                  placeholder="Enter amount"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Payment Date</label>
                <input
                  type="date"
                  value={payment.date}
                  onChange={(e) => setPayment({ ...payment, date: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleMarkAsPaid}
                className="flex-1 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Confirm Payment
              </button>
              <button
                onClick={() => {
                  setShowPaymentDialog(false);
                  setSelectedFee(null);
                  setPayment({ amount: '', date: new Date().toISOString().split('T')[0] });
                }}
                className="flex-1 bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fees Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Student ID</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Student Name</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Month</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Amount</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Status</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Paid Date</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFees.map((fee) => (
                <tr key={fee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800">{fee.studentId}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{getStudentName(fee.studentId)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(fee.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">₹{fee.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    {fee.status === 'paid' ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                        <Clock className="w-4 h-4" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {fee.paidDate || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {fee.status === 'pending' ? (
                        <button
                          onClick={() => openPaymentDialog(fee)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                        >
                          Mark as Paid
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUndo(fee.id)}
                          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 text-sm flex items-center gap-2"
                        >
                          <Undo2 className="w-4 h-4" />
                          Undo
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}