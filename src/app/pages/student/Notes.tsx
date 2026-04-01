import { useEffect, useState } from 'react';
import { FileText, Download } from 'lucide-react';
import type { Note } from '../../utils/mockData';

export default function StudentNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filterSubject, setFilterSubject] = useState('all');

  useEffect(() => {
    const notesData = JSON.parse(localStorage.getItem('primetutorials_notes') || '[]');
    setNotes(notesData);
  }, []);

  const filteredNotes = filterSubject === 'all'
    ? notes
    : notes.filter(note => note.subject === filterSubject);

  const subjects = ['all', ...Array.from(new Set(notes.map(n => n.subject)))];

  const handleDownload = (note: Note) => {
    if (note.fileData) {
      const link = document.createElement('a');
      link.href = note.fileData;
      link.download = note.fileName;
      link.click();
    } else {
      alert('File not available for download');
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl mb-2 text-gray-800">Study Notes & Materials</h1>
        <p className="text-gray-600">Access and download study materials</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <label className="block text-sm mb-2 text-gray-700">Filter by Subject</label>
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {subjects.map(subject => (
            <option key={subject} value={subject}>
              {subject === 'all' ? 'All Subjects' : subject}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map(note => (
          <div key={note.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="bg-green-100 p-3 rounded-lg mb-4 w-fit">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg text-gray-800 mb-2 line-clamp-2">{note.title}</h3>
            <p className="text-sm text-gray-600 mb-1">{note.subject}</p>
            <p className="text-xs text-gray-500 mb-4">{note.date}</p>
            <div className="flex items-center justify-between">
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs">
                {note.fileType.toUpperCase()}
              </span>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
                onClick={() => handleDownload(note)}
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No study materials available yet</p>
        </div>
      )}
    </div>
  );
}