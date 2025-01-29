// src/components/Navbar.js
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-yellow-400 to-yellow-300 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-blue-900 text-2xl font-bold">
          AbsenceManager
        </Link>

        <div className="hidden md:flex space-x-6">
          <Link to="/" className="text-blue-900 hover:text-blue-700">
            Home
          </Link>
          <Link to="/add-absence" className="text-blue-900 hover:text-blue-700">
            Ajouter absence
          </Link>
          <Link to="/add-proof" className="text-blue-900 hover:text-blue-700">
            Ajouter Justificatif
          </Link>
          <Link to="/bilan" className="text-blue-900 hover:text-blue-700">
            Bilan
          </Link>
          <Link to="/login" className="text-blue-900 hover:text-blue-700">
            Connexion
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-blue-900"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 space-y-4">
          <Link to="/" className="block text-blue-900 hover:text-blue-700">
            Home
          </Link>
          <Link to="/add-absence" className="block text-blue-900 hover:text-blue-700">
            Ajouter absence
          </Link>
          <Link to="/add-proof" className="block text-blue-900 hover:text-blue-700">
            Ajouter Justificatif
          </Link>
          <Link to="/bilan" className="block text-blue-900 hover:text-blue-700">
            Bilan
          </Link>
          <Link to="/login" className="block text-blue-900 hover:text-blue-700">
            Connexion
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;