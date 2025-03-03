import { useState } from 'react';
import { useStudents } from '../context/StudentContext';
import { exportToCSV, importFromCSV } from '../utils/csvUtils';
import { FaTrash } from 'react-icons/fa';

function StudentManagement() {
  const { students, addStudent, updateStudent, deleteStudent, bulkAddStudents, loading, error } = useStudents();
  const [formData, setFormData] = useState({ name: '', rollNumber: '', email: '' });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateStudent({ ...formData, id: editingId });
      setEditingId(null);
    } else {
      addStudent(formData);
    }
    setFormData({ name: '', rollNumber: '', email: '' });
  };

  const handleCancel = () => {
    setFormData({ name: '', rollNumber: '', email: '' });
    setEditingId(null);
  };

  const handleExport = () => {
    exportToCSV(students, 'students.csv');
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImporting(true);
    setImportError('');
    setImportSuccess('');

    try {
      const importedData = await importFromCSV(file);
      if (!importedData || importedData.length === 0) {
        setImportError('No valid data found in the CSV file.');
        return;
      }

      const validStudents = importedData.filter(student => student.name && student.rollNumber);
      if (validStudents.length === 0) {
        setImportError('No valid student records found.');
        return;
      }

      if (validStudents.length > 56) {
        setImportError('Cannot import more than 56 students.');
        return;
      }

      await bulkAddStudents(validStudents);
      setImportSuccess(`Successfully imported ${validStudents.length} student records.`);
      e.target.value = null;
    } catch (err) {
      setImportError(`Error importing CSV: ${err.message || 'Unknown error'}`);
    } finally {
      setIsImporting(false);
    }
  };

  const generateCsvTemplate = () => {
    const template = Array.from({ length: 56 }, (_, i) => ({
      name: `Student ${i + 1}`,
      rollNumber: `${100 + i + 1}`,
      email: `student${i + 1}@example.com`
    }));
    exportToCSV(template, 'student_template_56.csv');
  };

  const filteredStudents = students.filter(student =>
    (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.rollNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center py-4">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Student Management (Max 56 Students)</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Student' : 'Add New Student'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Roll Number *</label><input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" /></div>
          </div>
          <div className="flex space-x-2">
            <button type="submit" className="btn btn-primary" disabled={students.length >= 56}>
              {editingId ? 'Update Student' : 'Add Student'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel} className="btn btn-secondary">
                Cancel
              </button>
            )}
          </div>
          {students.length >= 56 && (
            <p className="text-red-600 text-sm">Classroom capacity (56 students) reached.</p>
          )}
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
          <h2 className="text-xl font-semibold">Student List ({students.length}/56)</h2>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <div><input type="text" placeholder="Search students..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="p-2 border border-gray-300 rounded w-full md:w-auto" /></div>
            <div className="flex space-x-2">
              <button onClick={handleExport} className="btn btn-secondary">Export CSV</button>
              <label className="btn btn-secondary cursor-pointer">
                {isImporting ? 'Importing...' : 'Import CSV'}
                <input type="file" accept=".csv" onChange={handleImport} className="hidden" disabled={isImporting} />
              </label>
              <button onClick={generateCsvTemplate} className="btn btn-secondary">Get Template (56 Seats)</button>
            </div>
          </div>
        </div>

        {importError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {importError}
          </div>
        )}

        {importSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {importSuccess}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
          <h3 className="font-bold">CSV Import Instructions:</h3>
          <p>1. CSV should have headers: name, rollNumber, email (optional).</p>
          <p>2. Max 56 students allowed.</p>
          <p>3. Use "Get Template" for a 56-seat example.</p>
        </div>

        <div className="table-container">
          <table className="min-w-full">
            <thead>
              <tr>
                <th>Roll No.</th>
                <th>Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => (
                  <tr key={student.id}>
                    <td>{student.rollNumber}</td>
                    <td>{student.name}</td>
                    <td>{student.email || '-'}</td>
                    <td>
                      <button onClick={() => deleteStudent(student.id)} className="text-red-600 hover:text-red-800 p-1" title="Delete student">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    {searchTerm ? 'No matching students found.' : 'No students added yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudentManagement;