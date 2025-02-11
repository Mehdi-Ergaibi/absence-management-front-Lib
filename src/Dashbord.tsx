import { Check, ChevronsUpDown } from "lucide-react";
import BilanForm from "./BilanForm";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./components/ui/popover";
import { cn } from "./lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandItem,
} from "./components/ui/command";
import { useEffect, useState } from "react";
import {
  getElementsByModule,
  getFiliers,
  getModulesByFiliereAndSemestre,
  getTotalAbsences,
} from "./api";
import { Semestre } from "./types/Semestre";

function Dashbord() {
  const [selectedFiliere, setSelectedFiliere] = useState<string | null>(null);
  const [filieres, setFilieres] = useState<string[]>([]);
  const [semestres] = useState<Semestre[]>(
    Object.values(Semestre) as Semestre[]
  );
  const [selectedSemestre, setSelectedSemestre] = useState<Semestre | null>(
    null
  );
  const [modules, setModules] = useState<string[]>([]);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [elements, setElements] = useState<string[]>([]);
  const [totalH, setTotalH] = useState<number>();

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
    if (selectedSemestre && selectedFiliere) {
      const loadModules = async () => {
        try {
          const fetchedModules = await getModulesByFiliereAndSemestre(
            selectedFiliere,
            selectedSemestre
          );
          setModules(fetchedModules);
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
  //getTotalAbsences

  useEffect(() => {
    if (selectedSemestre && selectedFiliere) {
      const getTotalH = async () => {
        try {
          console.log(selectedSemestre);
          const totalH = await getTotalAbsences(
            selectedFiliere,
            selectedSemestre,
            selectedModule as string,
            selectedElement as string
          );
          setTotalH(totalH); // Reset module
        } catch (error) {
          console.error("Error fetching total:", error);
        }
      };

      getTotalH();
    } else {
      setModules([]);
      setSelectedModule(""); // Ensure reset
    }
  }, [selectedElement]);

  return (
    <div className="m-5 grid grid-cols-3 gap-1">
      <div>
        <BilanForm />
      </div>
      <div className="grid grid-cols-2 col-span-2">
        <div>
          <Card>
            <CardContent>
              <div className="grid grid-cols-2 gap-1 my-2">
                <div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn("justify-between w-[200px]")}
                      >
                        {selectedFiliere
                          ? filieres.find(
                              (filiere) => filiere === selectedFiliere
                            )
                          : "Choisir une filiere"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="trouver une filiere..." />
                        <CommandList>
                          <CommandEmpty>Pas de filiee trouvee.</CommandEmpty>
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
                </div>
                <div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn("justify-between w-[200px]")}
                      >
                        {selectedSemestre
                          ? semestres.find(
                              (semestre) => semestre === selectedSemestre
                            )
                          : "Choisir semestre"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Trouver semestre..." />
                        <CommandList>
                          <CommandEmpty>Pas de semestre trouves.</CommandEmpty>
                          <CommandGroup>
                            {semestres.map((semestre) => (
                              <CommandItem
                                value={semestre}
                                onSelect={(currentValue) => {
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
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1 my-2">
                <div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        disabled={!selectedFiliere || !selectedSemestre}
                        className={cn("justify-between w-[200px]")}
                      >
                        {selectedModule
                          ? modules.find((module) => module === selectedModule)
                          : "Choisir un module"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Trouver module..." />
                        <CommandList>
                          <CommandEmpty>Pas de modules trouvees.</CommandEmpty>
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
                </div>
                <div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        disabled={!selectedModule}
                        className={cn("justify-between w-[200px]")}
                      >
                        {selectedElement
                          ? elements.find(
                              (element) => element === selectedElement
                            )
                          : "Choisir un element"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search language..." />
                        <CommandList>
                          <CommandEmpty>Pas d'element trouvees.</CommandEmpty>
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
                </div>
              </div>
              {selectedElement ? (
                <p>
                  Le total d'absence de la filiere {selectedFiliere} en{" "}
                  {selectedElement} est {totalH}
                </p>
              ) : (
                <p>le total d'absence d'une filiere en un element</p>
              )}
            </CardContent>
          </Card>
        </div>
        <div>2</div>
      </div>
    </div>
  );
}

export default Dashbord;
