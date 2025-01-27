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

interface StudentBilan {
  cne: string;
  name: string;
  totalDuration: number;
  elementOrModuleName: string;
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
  });

  return (
    <div className=" mt-10 grid grid-cols-12">
      <Card className="rounded-2xl shadow-lg col-span-6 max-w-md ml-10">
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
                  <FormItem>
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

      {/* <form>
        <div>
          <label>Semestre:</label>
          <select
            onChange={(e) => {
              const selectedValue = e.target.value as unknown as Semestre;
              setSelectedSemestre(selectedValue);
            }}
            value={selectedSemestre || ""}
          >
            <option value="" disabled>
              Sélectionner un Semestre
            </option>
            {semestres.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Filière:</label>
          <select
            onChange={(e) => setSelectedFiliere(e.target.value)}
            value={selectedFiliere || ""}
          >
            <option value="" disabled>
              Sélectionner une Filière
            </option>
            {filieres.map((fil, index) => (
              <option key={index} value={fil}>
                {fil}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="type">Afficher par : </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="element">Par Élément</option>
            <option value="module">Par Module</option>
          </select>
        </div>
      </form> */}
      {students.length != 0 && (
        <div className="overflow-x-auto col-span-6 m-auto">
          <table className="w-full table-auto border-collapse border border-gray-300 rounded-lg">
            {/*         CNE, nom, heures d'abscence, elemet/module
             */}{" "}
            <thead className="bg-gray-200">
              <th className="px-4 py-2 border">Cne</th>
              <th className="px-4 py-2 border">nom</th>
              <th className="px-4 py-2 border">heure abscence</th>
              <th className="px-4 py-2 border">{type}</th>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr className="hover:bg-gray-100">
                  <td className="px-4 py-2 border">{s.cne}</td>
                  <td className="px-4 py-2 border">{s.name}</td>
                  <td className="px-4 py-2 border">{s.totalDuration} H</td>
                  <td className="px-4 py-2 border">{s.elementOrModuleName}</td>
                </tr>
              ))}
            </tbody>
          </table>{" "}
        </div>
      )}
    </div>
  );
}

export default BilanForm;
