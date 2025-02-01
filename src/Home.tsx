// src/pages/Home.js
import { FaUserClock, FaChartLine } from "react-icons/fa";
import { MdSick } from "react-icons/md";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-screen-80 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
            alt="Office background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r " />
        </div>

        <div className="relative z-10 container mx-auto px-4 h-full flex items-center p-5">
          <div className="max-w-2xl text-white animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Gestion intelligente des absences<span> </span>
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
                simplifiée
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-black font-bold">
              Rationalisez les absences, les bilans et le suivi des étudiants
              avec notre plateforme intuitive
            </p>
            <div className="flex gap-4">
              <button className="bg-gradient-to-r from-yellow-400 to-yellow-300 text-blue-900 px-8 py-4 rounded-lg font-semibold hover:scale-105 transition-transform duration-300">
                <Link to="/add-absence">Commencer</Link>
              </button>
              <button className="bg-gradient-to-r from-yellow-400 to-yellow-300 text-blue-900 px-8 py-4 rounded-lg font-semibold hover:scale-105 transition-transform duration-300">
                <Link to="/voir-absence">Voir mes abscences</Link>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Fonctionnalités puissantes
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tout ce dont vous avez besoin pour gérer efficacement les absences
            des étudiants
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature Card 1 */}
          <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 group">
            <div className="bg-blue-100 w-fit p-4 rounded-xl mb-6">
              <FaUserClock className="text-blue-600 text-3xl" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">
              Ajouter des absences
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Ajouter les absences des étudiants d'une facon facile et efficace.
            </p>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 group">
            <div className="bg-blue-100 w-fit p-4 rounded-xl mb-6">
              <MdSick className="text-blue-600 text-3xl" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">
              Ajouter des justificatifs
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Ajouter des histificatifs si un etudiant a une raison d'absence.
            </p>
          </div>

          {/* Feature Card 3 */}
          <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 group">
            <div className="bg-blue-100 w-fit p-4 rounded-xl mb-6">
              <FaChartLine className="text-blue-600 text-3xl" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">
              Analytiques & Rapports
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Générez des rapports détaillés et obtenez des insights sur les
              tendances d'absences et les indicateurs de productivité.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
