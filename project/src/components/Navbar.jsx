import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-[#5d21d1] p-4">
      <div className="container mx-auto flex justify-between items-center">
        <img src="https://codinggita.com/assets/logo-DqYDd8j5.svg" alt="" className='h-10' />
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