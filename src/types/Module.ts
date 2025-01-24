import { Semestre } from "./Semestre";

export interface Module {
  moduleId: number;
  name: string;
  semestre: Semestre;
  students: string[];
  filiereId: number;
}
