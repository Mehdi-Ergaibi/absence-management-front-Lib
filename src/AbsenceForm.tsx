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
import { Input } from "./components/ui/input";
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

import { useToast } from "@/hooks/use-toast";
import { MdCheckCircle } from "react-icons/md";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

  const { toast } = useToast();

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
        toast({
          variant: "destructive",
          title: "Error",
          description: (
            <div className="flex items-center gap-2">
              <MdCheckCircle color="red" />
              {String(error)}
            </div>
          ),
          className: "bg-red-500 text-white",
        });
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
          toast({
            variant: "destructive",
            title: "Error",
            description: (
              <div className="flex items-center gap-2">
                <MdCheckCircle color="red" />
                {String(error)}
              </div>
            ),
            className: "bg-red-500 text-white",
          });
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
          toast({
            variant: "destructive",
            title: "Error",
            description: (
              <div className="flex items-center gap-2">
                <MdCheckCircle color="red" />
                {String(error)}
              </div>
            ),
            className: "bg-red-500 text-white",
          });
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
          toast({
            variant: "destructive",
            title: "Error",
            description: (
              <div className="flex items-center gap-2">
                <MdCheckCircle color="red" />
                {String(error)}
              </div>
            ),
            className: "bg-red-500 text-white",
          });
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
          toast({
            variant: "destructive",
            title: "Error",
            description: (
              <div className="flex items-center gap-2">
                <MdCheckCircle color="red" />
                {String(error)}
              </div>
            ),
            className: "bg-red-500 text-white",
          });
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
  const formatTimeToLocalTime = (timeString: string) => {
    if (!timeString) return null;

    const [time, period] = timeString.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    // Convert 12-hour format to 24-hour format
    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }

    // Ensure 2-digit format for hours and minutes (HH:mm)
    const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;

    return formattedTime; // Correct format for LocalTime
  };
  const generateTimeSlots = () => {
    const times = [];
    for (let hour = 9; hour <= 19; hour++) {
      for (let minute of [0, 30]) {
        const period = hour < 12 ? "AM" : "PM";
        const displayHour = hour <= 12 ? hour : hour - 12;
        const timeString = `${displayHour}:${
          minute === 0 ? "00" : "30"
        } ${period}`;
        times.push(timeString);
      }
    }
    return times;
  };

  const timeSlots = generateTimeSlots();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    //console.log(date, startTime, endTime, selectedStudents);

    const formattedStartTime = formatTimeToLocalTime(startTime);
    const formattedEndTime = formatTimeToLocalTime(endTime);

    if (
      !date ||
      !formattedStartTime ||
      !formattedEndTime ||
      selectedStudents.length === 0
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (
          <div className="flex items-center gap-2">
            <MdCheckCircle color="red" />
            Tous les champs doivent être remplis
          </div>
        ),
        className: "bg-red-500 text-white",
      });
      return;
    }

    if (formattedStartTime >= formattedEndTime) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (
          <div className="flex items-center gap-2">
            <MdCheckCircle color="red" />
            L'heure de début doit être inférieure à l'heure de fin
          </div>
        ),
        className: "bg-red-500 text-white",
      });
      return;
    }

    if (!elementId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (
          <div className="flex items-center gap-2">
            <MdCheckCircle color="red" />
            Veuillez sélectionner un élément valide.
          </div>
        ),
        className: "bg-red-500 text-white",
      });
      return;
    }

    const absences: Absence[] = selectedStudents.map((cne) => ({
      date,
      motif: null,
      proof: null,
      student: { cne },
      element: { elementId },
      startTime: formattedStartTime,
      endTime: formattedEndTime,
    }));

    try {
      await addAbsence(absences);
      toast({
        variant: "default",
        title: "Succès",
        description: (
          <div className="flex items-center gap-2">
            <MdCheckCircle color="green" />
            Absence(s) ajoutée(s) avec succès !
          </div>
        ),
        className: "bg-green-500 text-white",
      });
      //alert("Absence(s) ajoutée(s) avec succès !");
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
    <div className="mt-10 flex justify-center">
      <Card className="rounded-2xl shadow-lg w-full max-w-2xl mx-4">
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
                              "w-full pl-3 text-left font-normal",
                              !date && "text-muted-foreground"
                            )}
                          >
                            {date ? (
                              format(date, "PPP", { locale: fr })
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
                {/* Start Time */}
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>L'heure de début</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {startTime || "Choisir l'heure de début"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Rechercher une heure..." />
                              <CommandList>
                                <CommandEmpty>
                                  Aucune heure trouvée.
                                </CommandEmpty>
                                <CommandGroup>
                                  {timeSlots.map((time) => (
                                    <CommandItem
                                      key={time}
                                      value={time}
                                      onSelect={(selectedTime) => {
                                        setStartTime(selectedTime);
                                        form.setValue(
                                          "startTime",
                                          selectedTime
                                        );
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          startTime === time
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {time}
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

                {/* End Time */}
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>L'heure de fin</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {endTime || "Choisir l'heure de fin"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Rechercher une heure..." />
                              <CommandList>
                                <CommandEmpty>
                                  Aucune heure trouvée.
                                </CommandEmpty>
                                <CommandGroup>
                                  {timeSlots.map((time) => (
                                    <CommandItem
                                      key={time}
                                      value={time}
                                      onSelect={(selectedTime) => {
                                        setEndTime(selectedTime);
                                        form.setValue("endTime", selectedTime);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          endTime === time
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {time}
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
                                  "justify-between",
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
                                  "justify-between",
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
                                disabled={!selectedFiliere || !selectedSemestre}
                                className={cn(
                                  "justify-between",
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
                                disabled={!selectedModule}
                                className={cn(
                                  "justify-between",
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
                <div className="flex">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        disabled={!selectedElement}
                        className="mt-4"
                      >
                        Afficher les étudiants
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                      <DialogHeader>
                        <DialogTitle>
                          Sélectionner les étudiants absents
                        </DialogTitle>
                      </DialogHeader>

                      <div className="flex-1 overflow-hidden flex flex-col">
                        <div className="flex items-center space-x-4 mb-3">
                          <Input
                            type="text"
                            placeholder="Rechercher un étudiant..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full"
                          />
                        </div>

                        <div className="flex-1 overflow-auto">
                          <table className="w-full table-auto border-collapse">
                            <thead className="sticky top-0 bg-background">
                              <tr className="bg-muted">
                                <th className="px-4 py-2 border">CNE</th>
                                <th className="px-4 py-2 border">Nom</th>
                                <th className="px-4 py-2 border">Prénom</th>
                                <th className="px-4 py-2 border">Absent</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filterStudents().map((s) => (
                                <tr key={s.cne} className="hover:bg-muted/50">
                                  <td className="px-4 py-2 border">{s.cne}</td>
                                  <td className="px-4 py-2 border">
                                    {s.firstName}
                                  </td>
                                  <td className="px-4 py-2 border">
                                    {s.lastName}
                                  </td>
                                  <td className="px-4 py-2 border text-center">
                                    <Input
                                      type="checkbox"
                                      checked={selectedStudents.includes(s.cne)}
                                      onChange={() =>
                                        handleCheckboxChange(s.cne)
                                      }
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="pt-4 flex justify-end gap-2">
                          <Button type="button" onClick={handleSubmit}>
                            Confirmer les absences
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
    </div>
  );
}

export default AbsenceForm;
