import { useEffect, useState } from 'react';
import { Plus, FileText, Download, Trash2, X, Upload } from 'lucide-react';
import type { Note } from '../../utils/mockData';

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
  });

  useEffect(() => {
    const notesData = JSON.parse(localStorage.getItem('primetutorials_notes') || '[]');
    setNotes(notesData);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const getFileType = (fileName: string): 'pdf' | 'image' | 'document' => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
    return 'document';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onload = () => {
      const fileData = reader.result as string;
      const newNote: Note = {
        id: `N${String(notes.length + 1).padStart(3, '0')}`,
        title: formData.title,
        subject: formData.subject,
        fileName: selectedFile.name,
        fileType: getFileType(selectedFile.name),
        fileData,
        date: new Date().toISOString().split('T')[0],
      };
      const updated = [...notes, newNote];
      localStorage.setItem('primetutorials_notes', JSON.stringify(updated));
      setNotes(updated);
      setShowModal(false);
      setFormData({ title: '', subject: '' });
      setSelectedFile(null);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      const updated = notes.filter(n => n.id !== id);
      localStorage.setItem('primetutorials_notes', JSON.stringify(updated));
      setNotes(updated);
    }
  };

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

  // Group notes by subject
  const notesBySubject = notes.reduce((acc, note) => {
    if (!acc[note.subject]) {
      acc[note.subject] = [];
    }
    acc[note.subject].push(note);
    return acc;
  }, {} as Record<string, Note[]>);

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl mb-2 text-gray-800">Study Notes & Materials</h1>
          <p className="text-gray-600">Upload and manage study materials for students</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Upload Note
        </button>
      </div>

      {/* Notes grouped by subject */}
      {Object.keys(notesBySubject).length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No study materials uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(notesBySubject).map(([subject, subjectNotes]) => (
            <div key={subject}>
              <h2 className="text-2xl text-gray-800 mb-4 border-b pb-2">{subject}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjectNotes.map(note => (
                  <div key={note.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-indigo-100 p-3 rounded-lg">
                        <FileText className="w-6 h-6 text-indigo-600" />
                      </div>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <h3 className="text-lg text-gray-800 mb-2 line-clamp-2">{note.title}</h3>
                    <p className="text-sm text-gray-600 mb-1">{note.fileName}</p>
                    <p className="text-xs text-gray-500 mb-3">{note.date}</p>
                    <div className="flex items-center justify-between">
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs">
                        {note.fileType.toUpperCase()}
                      </span>
                      <button
                        className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm"
                        onClick={() => handleDownload(note)}
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-gray-800">Upload Study Material</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
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
                <label className="block text-sm mb-2 text-gray-700">File</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                {selectedFile && (
                  <p className="text-sm text-gray-500 mt-1">
                    Selected file: {selectedFile.name}
                  </p>
                )}
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
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}