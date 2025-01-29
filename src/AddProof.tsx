import { useState, useEffect } from "react";
import { getAbsenceByStudentCne, uploadProof } from "./api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./components/ui/form";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { MdCheckCircle } from "react-icons/md";
import { toast } from "./hooks/use-toast";

export interface FetchedAbsencs {
  elementName: string;
  startTime: string;
  endTime: string;
  date: string;
  abscenceId: number;
}

const formSchema = z.object({
  cne: z.string(),
});

const formSchema2 = z.object({
  motif: z.string(),
  justificatif: z.string(),
});

function AddProof() {
  const [cne, setCne] = useState<string | null>(null);
  const [fetchedAbsences, setFetchedAbsences] = useState<FetchedAbsencs[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredAbsences, setFilteredAbsences] = useState<FetchedAbsencs[]>(
    []
  );
  const [selectedAbsence, setSelectedAbsence] = useState<FetchedAbsencs | null>(
    null
  );
  const [motif, setMotif] = useState<string>("");
  const [justificatif, setJustificatif] = useState<File | null>(null);
  const [showPopup, setShowPopup] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const form2 = useForm<z.infer<typeof formSchema2>>({
    resolver: zodResolver(formSchema2),
  });

  useEffect(() => {
    const filtered = fetchedAbsences.filter((abs) =>
      abs.elementName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAbsences(filtered);
  }, [searchTerm, fetchedAbsences]);

  const getAbsences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cne) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (
          <div className="flex items-center gap-2">
            <MdCheckCircle color="red" />
            Cne est obligatoire
          </div>
        ),
        className: "bg-red-500 text-white",
      });
      return;
    }
    try {
      const absences = await getAbsenceByStudentCne(cne);
      setFetchedAbsences(absences);
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
      console.error("Error while fetching absences: ", error);
    }
  };

  const handleRowClick = (absence: FetchedAbsencs) => {
    setSelectedAbsence(absence);
    setShowPopup(true);
  };

  const handleSubmitProof = async () => {
    if (!selectedAbsence || !motif || !justificatif) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (
          <div className="flex items-center gap-2">
            <MdCheckCircle color="red" />
            Motif et justificatif sont obligatoires.                                       
          </div>
        ),
        className: "bg-red-500 text-white",
      });
      return;
    }

    try {
      await uploadProof(selectedAbsence.abscenceId, motif, justificatif);
      toast({
        variant: "default", // Default variant for non-destructive toasts
        title: "Success",
        description: (
          <div className="flex items-center gap-2">
            <MdCheckCircle color="green" />
            Justificatif bien enrigistre
          </div>
        ),
        className: "bg-green-500 text-white", // Custom styles
      });
      setShowPopup(false); // Close popup after successful upload
      setMotif("");
      setJustificatif(null);
    } catch (error) {
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: (
            <div className="flex items-center gap-2">
              <MdCheckCircle color="red" />
              {error.message}
            </div>
          ),
          className: "bg-red-500 text-white",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: (
            <div className="flex items-center gap-2">
              <MdCheckCircle color="red" />
              Error inconnue
            </div>
          ),
          className: "bg-red-500 text-white",
        });
      }
    }
  };

  return (
    <div className=" mt-10 grid grid-cols-12">
      <Card className="rounded-2xl shadow-lg col-span-6 max-w-md ml-10">
        <CardHeader className="-mb-6">
          <CardTitle>Ajouter justificatif</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-8 max-w-3xl mx-auto py-10">
              <FormField
                control={form.control}
                name="cne"
                render={() => (
                  <FormItem>
                    <FormLabel>Cne</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="B13212121"
                        type="text"
                        onChange={(e) => setCne(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button onClick={getAbsences}>Rechercher</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="overflow-x-auto col-span-6 m-auto">
        {fetchedAbsences.length != 0 && (
          <div>
            <Input
              type="text"
              placeholder="Rechercher par élément"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-2"
            />
            <table className="w-full table-auto border-collapse border border-gray-300 rounded-lg">
              <thead className="bg-gray-200">
                <th className="px-4 py-2 border">Element</th>
                <th className="px-4 py-2 border">De</th>
                <th className="px-4 py-2 border">A</th>
                <th className="px-4 py-2 border">Date</th>
              </thead>
              <tbody>
                {filteredAbsences.map((abs) => (
                  <tr
                    key={abs.abscenceId}
                    onClick={() => handleRowClick(abs)}
                    className="hover:bg-gray-100 cursor-pointer"
                  >
                    <td className="px-4 py-2 border">{abs.elementName}</td>
                    <td className="px-4 py-2 border">{abs.startTime}</td>
                    <td className="px-4 py-2 border">{abs.endTime}</td>
                    <td className="px-4 py-2 border">{abs.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>{" "}
          </div>
        )}
      </div>

      {showPopup && (
        <Card
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "20px",
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "8px",
            zIndex: 1000,
          }}
        >
          <CardHeader>
            <CardTitle>Ajouter justificatif</CardTitle>
            <CardDescription>
              Absence: {selectedAbsence?.elementName} <br />
              Jour: {selectedAbsence?.date} <br />
              De: {selectedAbsence?.startTime} <br />
              A: {selectedAbsence?.endTime}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form2}>
              <form className="space-y-8 max-w-3xl mx-auto py-10">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-6">
                    <FormField
                      control={form2.control}
                      name="motif"
                      render={() => (
                        <FormItem>
                          <FormLabel>Motif</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Maladie"
                              type="text"
                              value={motif}
                              onChange={(e) => setMotif(e.target.value)}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-6">
                    <FormField
                      control={form2.control}
                      name="justificatif"
                      render={() => (
                        <FormItem>
                          <FormLabel>fichier</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              onChange={(e) =>
                                setJustificatif(
                                  e.target.files ? e.target.files[0] : null
                                )
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            choisir une image ou Pdf
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>

          {/* <label>
            Justificatif:
            <input
              type="file"
              onChange={(e) =>
                setJustificatif(e.target.files ? e.target.files[0] : null)
              }
            />
          </label>
          <br /> */}
          <CardFooter>
            <Button onClick={handleSubmitProof} className="mr-2">
              Ajouter
            </Button>
            <Button onClick={() => setShowPopup(false)}>Fermer</Button>
          </CardFooter>
        </Card>
      )}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
          onClick={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}

export default AddProof;
