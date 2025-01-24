import { useState, useEffect } from "react";
import { getAbsenceByStudentCne, uploadProof } from "./api";

interface FetchedAbsencs {
  elementName: string;
  startTime: string;
  endTime: string;
  date: string;
  abscenceId: number;
}

function AddProof() {
  const [cne, setCne] = useState<string | null>(null);
  const [fetchedAbsences, setFetchedAbsences] = useState<FetchedAbsencs[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredAbsences, setFilteredAbsences] = useState<FetchedAbsencs[]>(
    []
  );
  const [selectedAbsence, setSelectedAbsence] = useState<FetchedAbsencs | null>(
    null
  );
  const [motif, setMotif] = useState<string>("");
  const [justificatif, setJustificatif] = useState<File | null>(null);
  const [showPopup, setShowPopup] = useState<boolean>(false);

  useEffect(() => {
    const filtered = fetchedAbsences.filter((abs) =>
      abs.elementName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAbsences(filtered);
  }, [searchTerm, fetchedAbsences]);

  const getAbsences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cne) {
      alert("Cne is required");
      return;
    }
    try {
      const absences = await getAbsenceByStudentCne(cne);
      setFetchedAbsences(absences);
    } catch (error) {
      console.error("Error while fetching absences: ", error);
    }
  };

  const handleRowClick = (absence: FetchedAbsencs) => {
    setSelectedAbsence(absence);
    setShowPopup(true);
  };

  const handleSubmitProof = async () => {
    if (!selectedAbsence || !motif || !justificatif) {
      alert("Motif and justificatif are required.");
      return;
    }

    try {
      const result = await uploadProof(
        selectedAbsence.abscenceId,
        motif,
        justificatif
      );
      alert(result); // Show success message
      setShowPopup(false); // Close popup after successful upload
      setMotif("");
      setJustificatif(null);
    } catch (error) {
      if (error instanceof Error) {
        alert("Error uploading proof: " + error.message);
      } else {
        alert("An unknown error occurred.");
      }
    }
  };

  return (
    <div>
      <h2>Ajouter justificatif</h2>

      <div>
        <label>Cne</label>
        <input
          type="text"
          placeholder="Entrer CNE"
          onChange={(e) => setCne(e.target.value)}
        />
        <button onClick={getAbsences}>Rechercher</button>
      </div>

      <div>
        <input
          type="text"
          placeholder="Rechercher par élément"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <table border={1}>
          <thead>
            <tr>
              <th>Element</th>
              <th>De</th>
              <th>A</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredAbsences.map((abs) => (
              <tr
                key={abs.abscenceId}
                onClick={() => handleRowClick(abs)}
                style={{ cursor: "pointer" }}
              >
                <td>{abs.elementName}</td>
                <td>{abs.startTime}</td>
                <td>{abs.endTime}</td>
                <td>{abs.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "20px",
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "8px",
            zIndex: 1000,
          }}
        >
          <h3>Submit Proof</h3>
          <p>Absence:{selectedAbsence?.elementName}</p>
          <p>jour:{selectedAbsence?.date}</p>
          <p>de:{selectedAbsence?.startTime}</p>
          <p>a:{selectedAbsence?.endTime}</p>

          <label>
            Motif:
            <input
              type="text"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
            />
          </label>
          <label>
            Justificatif:
            <input
              type="file"
              onChange={(e) =>
                setJustificatif(e.target.files ? e.target.files[0] : null)
              }
            />
          </label>
          <br />
          <button onClick={handleSubmitProof}>Submit</button>
          <button onClick={() => setShowPopup(false)}>Close</button>
        </div>
      )}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
          onClick={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}

export default AddProof;