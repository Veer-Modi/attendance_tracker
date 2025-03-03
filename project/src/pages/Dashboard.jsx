import { useState, useEffect } from 'react';
import { useStudents } from '../context/StudentContext';
import { useAttendance } from '../context/AttendanceContext';
import { format } from 'date-fns';
import { FaCheck, FaTimes } from 'react-icons/fa';

function Dashboard() {
  const { students, loading: studentsLoading, error: studentsError } = useStudents();
  const { markAttendance, bulkMarkAttendance, getAttendanceForDate, getTotalHoursForDate, fetchAttendance, loading: attendanceLoading, error: attendanceError } = useAttendance();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedPeriod, setSelectedPeriod] = useState('1');
  const [timeRange, setTimeRange] = useState({ startTime: '09:00', endTime: '11:00' });
  const [seatView, setSeatView] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('present');
  const [hoveredStudent, setHoveredStudent] = useState(null);

  const periods = ['1', '2', '3', '4', '5', '6'];

  useEffect(() => {
    if (!studentsLoading && students.length > 0) {
      fetchAttendance(selectedDate, selectedPeriod);
    }
  }, [selectedDate, selectedPeriod, studentsLoading, students]);

  const attendanceData = getAttendanceForDate(selectedDate, selectedPeriod);

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setTimeRange(prev => ({ ...prev, [name]: value }));
  };

  const handleAttendanceChange = (studentId, status) => {
    markAttendance(selectedDate, studentId, status, selectedPeriod, status === 'present' ? timeRange : null);
    setSaveStatus('Attendance saved!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const getAttendanceStatus = (studentId) => {
    return attendanceData[studentId]?.status || '';
  };

  const calculateStats = () => {
    if (!students.length) return { present: 0, absent: 0, total: 0, presentPercentage: 0, partialPresent: 0 };
    const present = Object.values(attendanceData).filter(record => record?.status === 'present').length;
    const absent = Object.values(attendanceData).filter(record => record?.status === 'absent').length;
    const partialPresent = students.filter(student => {
      const totalHours = getTotalHoursForDate(selectedDate, student.id);
      return totalHours > 0 && totalHours < 8;
    }).length;
    const total = students.length;
    const presentPercentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, absent, total, presentPercentage, partialPresent };
  };

  const stats = calculateStats();

  const getStudentRows = () => {
    const rows = [];
    const studentsPerRow = 8; // 56 seats = 7 rows x 8 columns
    const paddedStudents = [...students];
    while (paddedStudents.length < 56) paddedStudents.push(null); // Pad to 56 seats
    for (let i = 0; i < paddedStudents.length; i += studentsPerRow) {
      rows.push(paddedStudents.slice(i, i + studentsPerRow));
    }
    return rows;
  };

  const handleBulkAttendance = () => {
    const studentsStatus = {};
    filteredStudents.forEach(student => {
      studentsStatus[student.id] = selectedStatus;
    });
    bulkMarkAttendance(selectedDate, studentsStatus, selectedPeriod, selectedStatus === 'present' ? timeRange : null);
    setSaveStatus('Bulk attendance saved!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const filteredStudents = students.filter(student =>
    (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.rollNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStudentHours = (studentId) => {
    return attendanceData[studentId]?.hours || 0;
  };

  const handleSeatClick = (studentId) => {
    if (!studentId) return; // Ignore empty seats
    const currentStatus = getAttendanceStatus(studentId);
    const newStatus = currentStatus === 'present' ? 'absent' : 'present';
    handleAttendanceChange(studentId, newStatus);
  };

  if (studentsLoading || attendanceLoading) return <div className="text-center py-4">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Attendance Dashboard (56 Seats)</h1>
        <div className="flex space-x-2">
          <button className={`btn ${seatView ? 'btn-secondary' : 'btn-primary'}`} onClick={() => setSeatView(false)}>
            List View
          </button>
          <button className={`btn ${seatView ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSeatView(true)}>
            Seat View
          </button>
        </div>
      </div>

      {(studentsError || attendanceError) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {studentsError || attendanceError}
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="stats grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="stat bg-blue-50 p-4 rounded-lg"><div className="stat-title text-blue-600">Total Students</div><div className="stat-value text-2xl">{stats.total}</div></div>
          <div className="stat bg-green-50 p-4 rounded-lg"><div className="stat-title text-green-600">Present</div><div className="stat-value text-2xl">{stats.present}</div></div>
          <div className="stat bg-yellow-50 p-4 rounded-lg"><div className="stat-title text-yellow-600">Partial</div><div className="stat-value text-2xl">{stats.partialPresent}</div></div>
          <div className="stat bg-red-50 p-4 rounded-lg"><div className="stat-title text-red-600">Absent</div><div className="stat-value text-2xl">{stats.absent}</div></div>
          <div className="stat bg-purple-50 p-4 rounded-lg"><div className="stat-title text-purple-600">Attendance Rate</div><div className="stat-value text-2xl">{stats.presentPercentage}%</div></div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1"><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded" /></div>
          <div className="flex-1"><label className="block text-sm font-medium text-gray-700 mb-1">Period</label><select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="w-full p-2 border border-gray-300 rounded">{periods.map(period => (<option key={period} value={period}>Period {period}</option>))}</select></div>
          <div className="flex-1"><label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label><input type="time" name="startTime" value={timeRange.startTime} onChange={handleTimeChange} className="w-full p-2 border border-gray-300 rounded" /></div>
          <div className="flex-1"><label className="block text-sm font-medium text-gray-700 mb-1">End Time</label><input type="time" name="endTime" value={timeRange.endTime} onChange={handleTimeChange} className="w-full p-2 border border-gray-300 rounded" /></div>
          <div className="flex-1"><label className="block text-sm font-medium text-gray-700 mb-1">Search Students</label><input type="text" placeholder="Search by name, roll no, email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 border border-gray-300 rounded" /></div>
        </div>

        {saveStatus && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {saveStatus}
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="p-2 border border-gray-300 rounded">
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
            <button onClick={handleBulkAttendance} className="btn btn-primary">
              Mark All {searchTerm ? 'Filtered' : ''} Students
            </button>
          </div>
        </div>

        {seatView ? (
          <div className="seat-view">
            <h2 className="text-xl font-semibold mb-4">Classroom Seat View (7x8 Grid)</h2>
            <div className="mb-6 p-2 bg-gray-100 text-center font-bold">TEACHER'S DESK</div>
            <div className="space-y-4">
              {getStudentRows().map((row, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-8 gap-2">
                  {row.map((student, colIndex) => (
                    <div key={student ? student.id : `empty-${rowIndex}-${colIndex}`} className="relative">
                      <div
                        className={`
                          p-2 rounded-lg shadow-sm border-2 text-center cursor-pointer
                          ${student ? (getAttendanceStatus(student.id) === 'present' ? 'bg-green-100 border-green-400' :
                            getAttendanceStatus(student.id) === 'absent' ? 'bg-red-100 border-red-400' :
                              'bg-gray-100 border-gray-300') : 'bg-gray-200 border-gray-400 opacity-50'}
                        `}
                        onClick={() => student && handleSeatClick(student.id)}
                        onMouseEnter={() => student && setHoveredStudent(student.id)}
                        onMouseLeave={() => setHoveredStudent(null)}
                      >
                        <div className="font-medium">{student ? student.rollNumber : 'Empty'}</div>
                      </div>
                      {hoveredStudent === student?.id && (
                        <div className="absolute z-10 w-48 bg-white border border-gray-300 rounded-lg shadow-lg p-3 -mt-1 left-full ml-2">
                          <div className="font-medium text-lg">{student.name}</div>
                          <div className="text-sm text-gray-500">Roll: {student.rollNumber}</div>
                          <div className="text-sm text-gray-500">{student.email || 'No email'}</div>
                          <div className="mt-1 text-sm">
                            Status: {getAttendanceStatus(student.id) === 'present' ?
                              <span className="text-green-600">Present ({getStudentHours(student.id)} hours)</span> :
                              getAttendanceStatus(student.id) === 'absent' ?
                                <span className="text-red-600">Absent</span> :
                                <span className="text-gray-600">Not marked</span>}
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            Click to mark {getAttendanceStatus(student.id) === 'present' ? 'absent' : 'present'}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th>Roll No.</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Time Period</th>
                  <th>Hours</th>
                  <th>Attendance</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td>{student.rollNumber}</td>
                      <td>{student.name}</td>
                      <td>{student.email || '-'}</td>
                      <td>{timeRange.startTime} - {timeRange.endTime}</td>
                      <td>{getAttendanceStatus(student.id) === 'present' ? getStudentHours(student.id) : '-'}</td>
                      <td>
                        <select
                          value={getAttendanceStatus(student.id)}
                          onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded"
                        >
                          <option value="">Select</option>
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      {searchTerm ? 'No matching students found.' : 'No students found. Please add students in the Student Management page.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;