import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import StudentManagement from './pages/StudentManagement';
import AttendanceView from './pages/AttendanceView';
import { StudentProvider } from './context/StudentContext';
import { AttendanceProvider } from './context/AttendanceContext';

function App() {
  return (
    <StudentProvider>
      <AttendanceProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/students" element={<StudentManagement />} />
              <Route path="/attendance" element={<AttendanceView />} />
            </Routes>
          </div>
        </div>
      </AttendanceProvider>
    </StudentProvider>
  );
}

export default App;