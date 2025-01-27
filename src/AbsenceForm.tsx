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
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Label } from "@radix-ui/react-label";
import { Input } from "./components/ui/input";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SelectSingleEventHandler } from "react-day-picker";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./components/ui/form";

const formSchema = z.object({
  date: z.coerce.date(),
  startTime: z.string(),
  endTime: z.string(),
  semestre: z.string(),
  filiere: z.string(),
  module: z.string(),
  element: z.string(),
});

function AbsenceForm() {
  const [semestres] = useState<Semestre[]>(
    Object.values(Semestre) as Semestre[]
  );
  const [filieres, setFilieres] = useState<string[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [elements, setElements] = useState<string[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [elementId, setElementId] = useState<number | null>(null);

  const [date, setDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  const [selectedSemestre, setSelectedSemestre] = useState<Semestre | null>(
    null
  );
  const [selectedFiliere, setSelectedFiliere] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");

  /* const [open, setOpen] = useState(false);
  const [openFilieres, setOpenFiliere] = useState(false);
  const [openModule, setOpenModule] = useState(false);
  const [openElement, setOpenElement] = useState(false); */

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
    },
  });

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

    console.log(date, startTime, endTime, selectedStudents);

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
      motif: null,
      proof: null,
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
    <div className=" mt-10 grid grid-cols-12 gap-1 ">
      <Card className="rounded-2xl shadow-lg col-span-6 max-w-md ml-10">
        <CardHeader className="-mb-6">
          <CardTitle>Ajouter abscence</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={handleSubmit}
              className="space-y-8 max-w-3xl mx-auto py-10"
            >
              <FormField
                control={form.control}
                name="date"
                render={() => (
                  <FormItem className="flex flex-col min-w-full">
                    <FormLabel>Jour</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !date && "text-muted-foreground"
                            )}
                          >
                            {date ? (
                              format(date, "PPP")
                            ) : (
                              <span>Choisir une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date as unknown as Date}
                          onSelect={
                            setDate as unknown as SelectSingleEventHandler
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={() => (
                      <FormItem>
                        <FormLabel>L'heure de debut</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Choisir l'heure de debut de la seance"
                            type="time"
                            id="startTime"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            step="1800"
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={() => (
                      <FormItem>
                        <FormLabel>L'heure de fin</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="choisir L'heure de fin"
                            type="time"
                            id="endTime"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            step="1800"
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="semestre"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Semestre</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-[200px] justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {selectedSemestre
                                  ? semestres.find(
                                      (semestre) =>
                                        semestre === selectedSemestre
                                    )
                                  : "Choisir semestre"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0">
                            <Command>
                              <CommandInput placeholder="Trouver semestre..." />
                              <CommandList>
                                <CommandEmpty>
                                  Pas de semestre trouves.
                                </CommandEmpty>
                                <CommandGroup>
                                  {semestres.map((semestre) => (
                                    <CommandItem
                                      value={semestre}
                                      onSelect={(currentValue) => {
                                        form.setValue("semestre", semestre);
                                        setSelectedSemestre(
                                          currentValue === selectedSemestre
                                            ? null
                                            : (currentValue as Semestre)
                                        );
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          selectedSemestre === semestre
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {semestre}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="filiere"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Filiere</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-[200px] justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {selectedFiliere
                                  ? filieres.find(
                                      (filiere) => filiere === selectedFiliere
                                    )
                                  : "Choisir une filiere"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0">
                            <Command>
                              <CommandInput placeholder="trouver une filiere..." />
                              <CommandList>
                                <CommandEmpty>
                                  Pas de filiee trouvee.
                                </CommandEmpty>
                                <CommandGroup>
                                  {filieres.map((filiere) => (
                                    <CommandItem
                                      value={filiere}
                                      onSelect={(currentValue) => {
                                        setSelectedFiliere(
                                          currentValue === selectedFiliere
                                            ? null
                                            : currentValue
                                        );
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          selectedFiliere === filiere
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {filiere}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="module"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Module</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-[200px] justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {selectedModule
                                  ? modules.find(
                                      (module) => module === selectedModule
                                    )
                                  : "Choisir un module"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0">
                            <Command>
                              <CommandInput placeholder="Trouver module..." />
                              <CommandList>
                                <CommandEmpty>
                                  Pas de modules trouvees.
                                </CommandEmpty>
                                <CommandGroup>
                                  {modules.map((module) => (
                                    <CommandItem
                                      value={module}
                                      onSelect={(currentValue) => {
                                        setSelectedModule(
                                          currentValue === selectedModule
                                            ? null
                                            : currentValue
                                        );
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          selectedModule === module
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {module}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="element"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Element</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-[200px] justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {selectedElement
                                  ? elements.find(
                                      (element) => element === selectedElement
                                    )
                                  : "Choisir un element"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0">
                            <Command>
                              <CommandInput placeholder="Search language..." />
                              <CommandList>
                                <CommandEmpty>
                                  Pas d'element trouvees.
                                </CommandEmpty>
                                <CommandGroup>
                                  {elements.map((element) => (
                                    <CommandItem
                                      value={element}
                                      onSelect={(currentValue) => {
                                        setSelectedElement(
                                          currentValue === selectedElement
                                            ? null
                                            : currentValue
                                        );
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          selectedElement === element
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {element}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="col-span-6 m-auto">
        {students.length != 0 && (
          <div>
            <div className="flex items-center space-x-4 mb-3">
              <Label htmlFor="studentSearch" className="text-sm font-medium">
                Rechercher un étudiant:
              </Label>
              <Input
                type="text"
                id="studentSearch"
                placeholder="Nom ou Prénom"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse border border-gray-300 rounded-lg">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-4 py-2 border">CNE</th>
                    <th className="px-4 py-2 border">Nom</th>
                    <th className="px-4 py-2 border">Prénom</th>
                    <th className="px-4 py-2 border">Absent</th>
                  </tr>
                </thead>
                <tbody>
                  {filterStudents().map((s) => (
                    <tr key={s.cne} className="hover:bg-gray-100">
                      <td className="px-4 py-2 border">{s.cne}</td>
                      <td className="px-4 py-2 border">{s.firstName}</td>
                      <td className="px-4 py-2 border">{s.lastName}</td>
                      <td className="px-4 py-2 border text-center">
                        <Input
                          type="checkbox"
                          onChange={() => handleCheckboxChange(s.cne)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button onClick={handleSubmit} className="mt-3">
              Soumettre
            </Button>
          </div>
        )}{" "}
      </div>
    </div>
  );
}

export default AbsenceForm;
