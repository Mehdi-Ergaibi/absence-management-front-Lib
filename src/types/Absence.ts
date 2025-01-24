export interface Absence {
    date: string | null;
    startTime: string | null;
    endTime: string | null;
    motif?: string | null;
    proof?: string | null;
    student: {
      cne: string;
    };
    element: {
      elementId: number;
    };
  }
  