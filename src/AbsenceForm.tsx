import { useEffect, useState } from "react";
import {
  addAbsence,
  getElementIdByName,
  getElementsByModule,
  getFiliers,
  getModulesByFiliereAndSemestre,
  getStudentsByFiliereAndModule,
} from "./api";
import { Semestre } from "./types/Semestre";
import { Student } from "./types/Student";
import { Absence } from "./types/Absence";

function AbsenceForm() {
  const [semestres] = useState<Semestre[]>(Object.values(Semestre) as Semestre[]);
  const [filieres, setFilieres] = useState<string[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [elements, setElements] = useState<string[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [elementId, setElementId] = useState<number | null>(null);

  const [date, setDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  const [selectedSemestre, setSelectedSemestre] = useState<Semestre | null>(null);
  const [selectedFiliere, setSelectedFiliere] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const loadFilieres = async () => {
      try {
        const fetchedFilieres = await getFiliers();
        setFilieres(fetchedFilieres);
      } catch (error) {
        console.error("Error fetching filieres:", error);
      }
    };

    loadFilieres();
  }, []);

  useEffect(() => {
    if (selectedModule) {
      console.log("loadElements: ", selectedModule);
      const loadElements = async () => {
        try {
          const fetchedElements = await getElementsByModule(selectedModule);
          setElements(fetchedElements);
        } catch (error) {
          console.error("Error fetching elements:", error);
        }
      };

      loadElements();
    }
  }, [selectedModule]);

  useEffect(() => {
    setStudents([]);
    const getStudents = async () => {
      /* console.log(
        "student:",
        selectedModule,
        selectedFiliere,
        selectedSemestre
      ); */
      if (selectedFiliere && selectedModule && selectedSemestre) {
        try {
          const fetchedStudents = await getStudentsByFiliereAndModule(
            selectedFiliere,
            selectedModule
          );
          console.log(fetchedStudents);
          setStudents(fetchedStudents);
        } catch (error) {
          console.error("Error fetching students:", error);
          setStudents([]);
        }
      } else {
        setStudents([]);
      }
    };

    getStudents();
  }, [selectedFiliere, selectedModule, selectedSemestre]);

  useEffect(() => {
    if (selectedSemestre && selectedFiliere) {
      const loadModules = async () => {
        try {
          const fetchedModules = await getModulesByFiliereAndSemestre(
            selectedFiliere,
            selectedSemestre
          );
          setModules(fetchedModules);
          setSelectedModule(""); // Reset module
        } catch (error) {
          console.error("Error fetching modules:", error);
          setModules([]);
        }
      };

      loadModules();
    } else {
      setModules([]);
      setSelectedModule(""); // Ensure reset
    }
  }, [selectedFiliere, selectedSemestre]);

  useEffect(() => {
    if (selectedElement) {
      const getElementId = async () => {
        try {
          const fetchedElementId = await getElementIdByName(selectedElement);
          setElementId(fetchedElementId);
        } catch (error) {
          console.error("Error fetching Element ID:", error);
          setElementId(null);
        }
      };

      getElementId();
    }
  }, [selectedElement]);

  const filterStudents = () => {
    return students.filter((student) => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    });
  };

  const handleCheckboxChange = (cne: string) => {
    setSelectedStudents((prev) =>
      prev.includes(cne) ? prev.filter((id) => id !== cne) : [...prev, cne]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !startTime || !endTime || selectedStudents.length === 0) {
      alert("Tous les champs doivent être remplis");
      return;
    }

    if (startTime >= endTime) {
      alert("L'heure de début doit être inférieure à l'heure de fin");
      return;
    }

    if (!elementId) {
      alert("Veuillez sélectionner un élément valide.");
      return;
    }

    const absences: Absence[] = selectedStudents.map((cne) => ({
      date,
      motif:  null,
      proof:  null,
      student: { cne },
      element: { elementId },
      startTime,
      endTime,
    }));

    try {
      await addAbsence(absences);
      alert("Absence(s) ajoutée(s) avec succès !");
      setDate("");
      setStartTime("");
      setEndTime("");
      setSelectedStudents([]);
      setSelectedElement(null);
    } catch (error) {
      console.error("Error submitting absences:", error);
      alert("Une erreur s'est produite lors de la soumission.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="date">Jour:</label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="startTime">De:</label>
        <input
          type="time"
          id="startTime"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="endTime">À:</label>
        <input
          type="time"
          id="endTime"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label>Semestre:</label>
        <select
          onChange={(e) => {
            const selectedValue = e.target.value as unknown as Semestre;
            setSelectedSemestre(selectedValue);
          }}
          value={selectedSemestre || ""}
        >
          <option value="" disabled>
            Sélectionner un Semestre
          </option>
          {semestres.map((sem) => (
            <option key={sem} value={sem}>
              {sem}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Filière:</label>
        <select
          onChange={(e) => setSelectedFiliere(e.target.value)}
          value={selectedFiliere || ""}
        >
          <option value="" disabled>
            Sélectionner une Filière
          </option>
          {filieres.map((fil, index) => (
            <option key={index} value={fil}>
              {fil}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Module:</label>
        <select
          onChange={(e) => setSelectedModule(e.target.value)}
          value={selectedModule || ""}
        >
          <option value="" disabled>
            Sélectionner un Module
          </option>
          {modules.map((mod) => (
            <option key={mod} value={mod}>
              {mod}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Élément:</label>
        <select
          onChange={(e) => setSelectedElement(e.target.value)}
          value={selectedElement || ""}
          required
        >
          <option value="" disabled>
            Sélectionner un Élément
          </option>
          {elements.map((el) => (
            <option key={el} value={el}>
              {el}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="studentSearch">Rechercher un étudiant:</label>
        <input
          type="text"
          id="studentSearch"
          placeholder="Nom ou Prénom"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div>
        <table border={1}>
          <thead>
            <th>CNE</th>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Absent</th>
          </thead>
          <tbody>
            {filterStudents().map((s) => (
              <tr key={s.cne}>
                <td>{s.cne}</td>
                <td>{s.firstName}</td>
                <td>{s.lastName}</td>
                <td>
                  <input
                    type="checkbox"
                    onChange={() => handleCheckboxChange(s.cne)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="submit">Soumettre</button>
    </form>
  );
}

export default AbsenceForm;