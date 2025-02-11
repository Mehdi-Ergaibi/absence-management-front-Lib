import { useEffect, useState } from "react";
import { Semestre } from "./types/Semestre";
import { getAbsenceSummaryByFiliere, getFiliers } from "./api";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "./components/ui/button";

import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "@/hooks/use-toast";
import { MdCheckCircle } from "react-icons/md";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
interface StudentBilan {
  cne: string;
  name: string;
  totalDuration: number;
  elementOrModuleName: string;
  filiere: string;
}

const formSchema = z.object({
  semestre: z.string(),
  filiere: z.string(),
  afficherPar: z.string(),
});

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
    const loadStudents = async () => {
      try {
        const fetchedStudents = await getAbsenceSummaryByFiliere(
          selectedFiliere,
          selectedSemestre,
          type
        );
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
        console.error("Error fetching filieres:", error);
      }
    };

    loadStudents();
  }, [selectedFiliere, selectedSemestre, type]);

  /* const handleSubmit = () => {
    console.log();
  }; */

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      afficherPar: "element",
    },
  });

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      students.map((s) => ({
        CNE: s.cne,
        Nom: s.name,
        "Heures d'absence": `${s.totalDuration} H`,
        [type]: s.elementOrModuleName,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Absences");
    XLSX.writeFile(wb, "absences.xlsx");
  };

  return (
    <div>
      <Card className="rounded-2xl shadow-lg col-span-4 max-w-md ml-10">
        <CardHeader className="-mb-6">
          <CardTitle>
            Bilan des abscemces des etudiants qui n'ont pas le droit de passer
            le normal.
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-8 max-w-3xl mx-auto py-10">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <FormField
                    control={form.control}
                    name="semestre"
                    render={() => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Semestre</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                role="combobox"
                                className={cn(
                                  "w-[200px] justify-between",
                                  !selectedSemestre && "text-muted-foreground"
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
                                  Pas de semestre trouvees.
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
                                          semestre === selectedSemestre
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
              </div>
              <FormField
                control={form.control}
                name="filiere"
                render={() => (
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
                              !selectedFiliere && "text-muted-foreground"
                            )}
                          >
                            {selectedFiliere
                              ? filieres.find(
                                  (filiere) => filiere === selectedFiliere
                                )
                              : "Select filiere"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput placeholder="Search filiere..." />
                          <CommandList>
                            <CommandEmpty>No filiere found.</CommandEmpty>
                            <CommandGroup>
                              {filieres.map((filiere) => (
                                <CommandItem
                                  value={filiere}
                                  onSelect={(currentValue) => {
                                    form.setValue("filiere", filiere);
                                    setSelectedFiliere(
                                      currentValue === selectedSemestre
                                        ? null
                                        : (currentValue as Semestre)
                                    );
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      filiere === selectedFiliere
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

              <FormField
                control={form.control}
                name="afficherPar"
              
                render={() => (
                  <FormItem className="w-[200px]">
                    <FormLabel>Afficher par</FormLabel>
                    <Select
                      onValueChange={(value) => setType(value)}
                      defaultValue={type}
                      
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Element ou module" />
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
            </form>
          </Form>
        </CardContent>
      </Card>

      <Dialog open={students.length !== 0} onOpenChange={() => setStudents([])}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Liste des Étudiants</DialogTitle>
            <div className="flex justify-start">
              <Button onClick={exportToExcel} className="mt-4 ">
                Exporter vers Excel
              </Button>
            </div>
          </DialogHeader>
          <table className="w-full table-auto border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 border">CNE</th>
                <th className="px-4 py-2 border">Nom</th>
                <th className="px-4 py-2 border">Heures d'absence</th>
                <th className="px-4 py-2 border">{type}</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.cne} className="hover:bg-gray-100">
                  <td className="px-4 py-2 border">{s.cne}</td>
                  <td className="px-4 py-2 border">{s.name}</td>
                  <td className="px-4 py-2 border">{s.totalDuration} H</td>
                  <td className="px-4 py-2 border">{s.elementOrModuleName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default BilanForm;
