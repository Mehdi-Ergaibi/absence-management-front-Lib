import { useEffect, useState } from "react";
import { Semestre } from "./types/Semestre";
import { getAbsenceSummaryByFiliere, getFiliers } from "./api";

interface StudentBilan {
  cne: string;
  name: string;
  totalDuration: number;
  elementOrModuleName: string;
}

function BilanForm() {
  const [selectedSemestre, setSelectedSemestre] = useState<Semestre | null>(
    null
  );
  const [selectedFiliere, setSelectedFiliere] = useState<string | null>(null);
  const [type, setType] = useState<string>("element");

  const [semestres] = useState<Semestre[]>(
    Object.values(Semestre) as Semestre[]
  );
  const [filieres, setFilieres] = useState<string[]>([]);
  const [students, setStudents] = useState<StudentBilan[]>([]);

  useEffect(() => {
    const loadFilieres = async () => {
      try {
        const fetchedFilieres = await getFiliers();
        console.log(fetchedFilieres);
        setFilieres(fetchedFilieres);
      } catch (error) {
        console.error("Error fetching filieres:", error);
      }
    };

    loadFilieres();
  }, []);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const fetchedStudents = await getAbsenceSummaryByFiliere(
          selectedFiliere,
          selectedSemestre,
          type
        );
        setStudents(fetchedStudents);
      } catch (error) {
        console.error("Error fetching filieres:", error);
      }
    };

    loadStudents();
  }, [selectedFiliere, selectedSemestre, type]);

  /* const handleSubmit = () => {
    console.log();
  }; */

  return (
    <div>
      <h3>
        Bilan des abscemces des etudiants qui n'ont pas le droit de passer le
        normal.
      </h3>
      <form>
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
          <label htmlFor="type">Afficher par : </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="element">Par Élément</option>
            <option value="module">Par Module</option>
          </select>
        </div>
      </form>
      <table border={1}>
        {/*         CNE, nom, heures d'abscence, elemet/module
         */}{" "}
        <thead>
          <th>Cne</th>
          <th>nom</th>
          <th>heure abscence</th>
          <th>{type}</th>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr>
              <td>{s.cne}</td>
              <td>{s.name}</td>
              <td>{s.totalDuration} h</td>
              <td>{s.elementOrModuleName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BilanForm;