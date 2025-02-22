import { Absence } from "./types/Absence";
import { FiliereSemestreStats } from "./types/FiliereSemestreStats";
import { Semestre } from "./types/Semestre";

const lhost = "http://localhost:8080";

let authToken: string | null = localStorage.getItem("jwt");

// Set the token (after login or retrieving it from storage)
export function setAuthToken(token: string) {
  authToken = token;
}

async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
    //"Content-Type": "application/json",
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  } else {
    headers["Content-Type"] = "application/json";
  }
  return fetch(url, { ...options, headers });
}

export async function getModulesByFiliereAndSemestre(
  filiereName: string,
  semestre: Semestre
): Promise<string[]> {
  try {
    const response = await fetchWithAuth(
      `${lhost}/api/modules/filiere_and_semestre/${filiereName}/${semestre}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch modules");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching modules:", error);
    return [];
  }
}

export async function getFiliers(): Promise<string[]> {
  try {
    const response = await fetchWithAuth(`${lhost}/api/filieres/names`);
    if (!response.ok) {
      throw new Error("Failed to get filieres");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching filieres:", error);
    return [];
  }
}

export const getElementsByModule = async (moduleName: string) => {
  try {
    const response = await fetchWithAuth(
      `${lhost}/api/elements/module/${moduleName}`
    );
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
    const response = await fetchWithAuth(
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
    const response = await fetchWithAuth(`${lhost}/api/elements/${name}`);
    if (!response.ok) throw new Error("Failed to get element id");
    return await response.json();
  } catch (error) {
    console.error(error);
    return "";
  }
};

export const addAbsence = async (absences: Absence[]) => {
  try {
    const response = await fetchWithAuth(
      "http://localhost:8080/api/absences/add-absences",
      {
        method: "POST",
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
    const response = await fetchWithAuth(
      `${lhost}/api/absences/student/${cne}`
    );
    if (!response.ok) throw new Error("Failed to get absences");
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
    const response = await fetchWithAuth(apiUrl, {
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
    if (error instanceof Error) throw error;
    throw new Error("An unknown error occurred.");
  }
}

export const getAbsenceSummaryByFiliere = async (
  filiereName: string | null,
  semestre: Semestre | null,
  type: string
) => {
  try {
    const response = await fetchWithAuth(
      `${lhost}/api/absences/filiere/${filiereName}/bilan?semestre=${semestre}&type=${type}`
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching absence summary:", error);
    return [];
  }
};

export const register = async (
  username: string,
  password: string
): Promise<any> => {
  const response = await fetch(`${lhost}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Registration failed");
  }
  return response.json();
};

export const login = async (
  username: string,
  password: string
): Promise<string> => {
  const response = await fetch(`${lhost}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  const token = await response.text();
  setAuthToken(token); // Store token after login
  return token;
};

export async function getAbsencesByStudent(cne: string) {
  const response = await fetchWithAuth(`${lhost}/api/absences/student/${cne}`);
  if (!response.ok) throw new Error("Failed to fetch absences");
  return response.json();
}

export async function getTotalDurationByElement(
  cne: string,
  elementId: string
) {
  const response = await fetchWithAuth(
    `${lhost}/api/absences/element/${cne}/${elementId}`
  );
  if (!response.ok) throw new Error("Failed to fetch element duration");
  return response.json();
}

export async function getTotalDurationByModule(cne: string, moduleId: string) {
  const response = await fetchWithAuth(
    `${lhost}/api/absences/module/${cne}/${moduleId}`
  );
  if (!response.ok) throw new Error("Failed to fetch module duration");
  return response.json();
}

export async function getExamStatusByElement(cne: string, elementId: string) {
  const response = await fetchWithAuth(
    `${lhost}/api/absences/element-exam-status/${cne}/${elementId}`
  );
  if (!response.ok) throw new Error("Failed to fetch exam status");
  return response.text();
}

export async function getExamStatusByModule(cne: string, moduleId: string) {
  const response = await fetchWithAuth(
    `${lhost}/api/absences/module-exam-status/${cne}/${moduleId}`
  );
  if (!response.ok) throw new Error("Failed to fetch exam status");
  return response.text();
}
export async function getStudentByCne(cne: string) {
  const response = await fetchWithAuth(`${lhost}/api/students/one/${cne}`);
  if (!response.ok) throw new Error("Failed to fetch student");
  return response.json();
}
export async function getFiliereName(id: number | undefined) {
  if (id === undefined) throw new Error("Filiere ID is required");
  console.log("filiere iid", id);

  const response = await fetchWithAuth(`${lhost}/api/filieres/one/${id}`);
  if (!response.ok) throw new Error("Failed to fetch fileire name");
  return response.json();
}


/// stats

export async function getTotalAbsences(
  filiere: string,
  semestre: string,
  module: string,
  element: string
): Promise<number> {
  try {
    const url = `${lhost}/api/statistics/total-absences?` +
      `filiere=${encodeURIComponent(filiere)}&` +
      `semestre=${encodeURIComponent(semestre)}&` +
      `module=${encodeURIComponent(module)}&` +
      `element=${encodeURIComponent(element)}`;
    const response = await fetchWithAuth(url);
    if (!response.ok) {
      throw new Error("Failed to fetch total absences");
    }
    // Assuming the response is a plain number (double) in JSON format.
    return await response.json();
  } catch (error) {
    console.error("Error fetching total absences:", error);
    throw error;
  }
}


export async function getTop3Absences(): Promise<FiliereSemestreStats[]> {
  try {
    const url = `${lhost}/api/statistics/top-3-absences`;
    const response = await fetchWithAuth(url);
    if (!response.ok) {
      throw new Error("Failed to fetch top 3 absences");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching top 3 absences:", error);
    throw error;
  }
}


export async function getStudentsWithoutRights(
  semestre: string
): Promise<Record<string, number>> {
  try {
    const url = `${lhost}/api/statistics/students-without-rights?semestre=${encodeURIComponent(semestre)}`;
    const response = await fetchWithAuth(url);
    if (!response.ok) {
      throw new Error("Failed to fetch students without rights");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching students without rights:", error);
    throw error;
  }
}


export async function getAbsencesByWeek(
  filiere: string,
  semestre: string
): Promise<Record<number, number>> {
  try {
    const url = `${lhost}/api/statistics/absences-by-week?` +
      `filiere=${encodeURIComponent(filiere)}&` +
      `semestre=${encodeURIComponent(semestre)}`;
    const response = await fetchWithAuth(url);
    if (!response.ok) {
      throw new Error("Failed to fetch absences by week");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching absences by week:", error);
    throw error;
  }
}