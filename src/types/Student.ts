import { Semestre } from "./Semestre";

export interface Student {
    cne: string;
    firstName: string;
    lastName: string;
    semestre: Semestre;
    filiere: string;
}