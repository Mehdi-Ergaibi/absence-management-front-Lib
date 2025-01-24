import { Absence } from "./types/Absence";
import { Semestre } from "./types/Semestre";

const lhost = "http://localhost:8080";

export async function getModulesByFiliereAndSemestre(
  filiereName: string,
  semestre: Semestre
): Promise<string[]> {
  try {
    const response = await fetch(
      `${lhost}/api/modules/filiere_and_semestre/${filiereName}/${semestre}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch modules");
    }

    const modules: string[] = await response.json();
    //console.log(modules);
    return modules;
  } catch (error) {
    console.error("Error fetching modules:", error);
    return [];
  }
}
export async function getFiliers(): Promise<string[]> {
  try {
    const response = await fetch(`${lhost}/api/filieres/names`);

    if (!response.ok) {
      throw new Error("Failed to get filieres");
    }

    const filieres: string[] = await response.json();
    //console.log(filieres);
    return filieres;
  } catch (error) {
    console.error("Error fetching filieres:", error);
    return [];
  }
}

export const getElementsByModule = async (moduleName: string) => {
  try {
    const response = await fetch(`${lhost}/api/elements/module/${moduleName}`);
    if (!response.ok) throw new Error("Failed to get elements");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getStudentsByFiliereAndModule = async (
  filiere: string | null,
  module: string | null
) => {
  try {
    const response = await fetch(
      `${lhost}/api/students/filiere_and_module/details/${filiere}/${module}`
    );
    if (!response.ok) throw new Error("Failed to get students");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getElementIdByName = async (name: string | null) => {
  try {
    const response = await fetch(`${lhost}/api/elements/${name}`);
    if (!response.ok) throw new Error("Failed to get element id");
    return await response.json();
  } catch (error) {
    console.error(error);
    return "";
  }
};
export const addAbsence = async (absences: Absence[]) => {
  try {
    const response = await fetch(
      "http://localhost:8080/api/absences/add-absences",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(absences),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to add absences");
    }
  } catch (error) {
    console.error("Error submitting absences:", error);
  }
};

export const getAbsenceByStudentCne = async (cne: string | null) => {
  try {
    const response = await fetch(`${lhost}/api/absences/student/${cne}`);
    if (!response.ok) throw new Error("Failed to get absencess");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

export async function uploadProof(
  absenceId: number,
  motif: string,
  file: File
): Promise<string> {
  const apiUrl = `${lhost}/api/absences/${absenceId}/${motif}/upload-proof`;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "File upload failed.");
    }

    return await response.text();
  } catch (error) {
    console.error("Error uploading proof:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unknown error occurred.");
  }
}
export const getAbsenceSummaryByFiliere = async (
  filierName: string| null,
  semestre: Semestre| null,
  type: string
) => {
  const apiUrl = `${lhost}/api/absences/filiere/${filierName}/bilan?semestre=${semestre}&type=${type}`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Absence Summary:", data);
    return data;
  } catch (error) {
    console.error("Error fetching absence summary:", error);
    return [];
  }
};