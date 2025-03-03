import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">Attendance Tracker</Link>
        <div className="space-x-4">
          <Link to="/" className="text-white hover:text-gray-200">Dashboard</Link>
          <Link to="/students" className="text-white hover:text-gray-200">Students</Link>
          <Link to="/attendance" className="text-white hover:text-gray-200">Attendance View</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;