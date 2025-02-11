import { useEffect, useState } from "react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import {
  getAbsencesByStudent,
  getAbsenceSummaryByFiliere,
  getStudentByCne,
} from "./api";
import { toast } from "./hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { MdCheckCircle } from "react-icons/md";
import { Student } from "./types/Student";
import { Semestre } from "./types/Semestre";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
interface Absence {
  absenceId: string;
  date: string;
  startTime: string;
  endTime: string;
  elementId: string;
}

interface AbsenceDetails {
  totalDuration: number;
  elementOrModuleName: string;
  cne: string;
}

const formSchema = z.object({
  cne: z.string(),
  afficherPar: z.string(),
});

const SeeAbsence = () => {
  const [cne, setCNE] = useState<string>("");
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [type, setType] = useState<string>("element");

  const [absenceDetails, setAbsenceDetails] = useState<AbsenceDetails[]>([]);

  let student: Student | null = null;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cne: "",
      afficherPar: "element",
    },
  });

  useEffect(() => {
    setAbsenceDetails([]);
    if (cne) fetchAbsencesType();
  }, [type]);

  const fetchAbsencesType = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setAbsences([]);
    if (!cne) {
      return showToastError("Cne", "Etrer cne!!");
    }

    console.log("type", type);

    try {
      const fetchedStudent = await getStudentByCne(cne);
      student = fetchedStudent;
      const filiere = student?.filiere;
      const semestre = student?.semestre;

      const absencesDetails = await getAbsenceSummaryByFiliere(
        filiere as string,
        semestre as Semestre,
        type
      );
      const AbsenceDetailsStudent = absencesDetails.filter(
        (absD: AbsenceDetails) => absD.cne === student?.cne
      );
      setAbsenceDetails(AbsenceDetailsStudent);
      console.log("abs details", absenceDetails);
    } catch (error) {
      showToastError("Error fetching absences", error);
    }
  };

  const fetchAbsences = async (e: React.FormEvent) => {
    e.preventDefault();
    setAbsenceDetails([]);
    if (!cne) return showToastError("Error", "Enter CNE!");

    try {
      const fetchedStudent = await getStudentByCne(cne);
      student = fetchedStudent;

      // Fetch absences
      const data = await getAbsencesByStudent(cne);
      setAbsences(data);
    } catch (error) {
      showToastError("Error fetching absences", error);
    }
  };

  const showToastError = (title: string, error: any) => {
    toast({
      variant: "destructive",
      title,
      description: (
        <div className="flex items-center gap-2">
          <MdCheckCircle color="red" />
          {String(error)}
        </div>
      ),
      className: "bg-red-500 text-white",
    });
    console.error(title, error);
  };

  return (
    <div className="mt-10 flex justify-center">
      <Card className="rounded-2xl shadow-lg max-w-md w-full">
        <CardHeader>
          <CardTitle>Mes Absences</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-8 max-w-3xl mx-auto py-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="cne"
                  render={() => (
                    <FormItem className="flex flex-col">
                      <FormLabel>CNE: </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          value={cne}
                          onChange={(e) => setCNE(e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="afficherPar"
                  render={() => (
                    <FormItem>
                      <FormLabel>Afficher par</FormLabel>
                      <Select
                        onValueChange={(value) => setType(value)}
                        defaultValue={type}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={type} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="element">Par Élément</SelectItem>
                          <SelectItem value="module">Par Module</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={fetchAbsences}>Voir absence</Button>
                <Button onClick={fetchAbsencesType}>Durée Absence</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Absences Dialog */}
      <Dialog open={absences.length > 0} onOpenChange={() => setAbsences([])}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Liste des Absences</DialogTitle>
          </DialogHeader>
          <table className="w-full table-auto border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 border">Date</th>
                <th className="px-4 py-2 border">Début</th>
                <th className="px-4 py-2 border">Fin</th>
              </tr>
            </thead>
            <tbody>
              {absences.map((abs) => {
                return (
                  <tr key={abs.absenceId} className={`hover:bg-gray-100`}>
                    <td className="px-4 py-2 border">{abs.date}</td>
                    <td className="px-4 py-2 border">{abs.startTime}</td>
                    <td className="px-4 py-2 border">{abs.endTime}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </DialogContent>
      </Dialog>

      {/* Absence Details Dialog */}
      <Dialog
        open={absenceDetails.length > 0}
        onOpenChange={() => setAbsenceDetails([])}
      >
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails des Absences</DialogTitle>
          </DialogHeader>
          <table className="w-full table-auto border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 border">Type</th>
                <th className="px-4 py-2 border">Durée</th>
              </tr>
            </thead>
            <tbody>
              {absenceDetails.map((abs) => (
                <tr
                  key={abs.elementOrModuleName}
                  className={`hover:bg-gray-100 ${
                    (type === "element" && abs.totalDuration > 6) ||
                    (type === "module" && abs.totalDuration > 16)
                      ? "bg-red-100"
                      : ""
                  }`}
                >
                  <td className="px-4 py-2 border">
                    {abs.elementOrModuleName}
                  </td>
                  <td className="px-4 py-2 border">{abs.totalDuration}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SeeAbsence;
