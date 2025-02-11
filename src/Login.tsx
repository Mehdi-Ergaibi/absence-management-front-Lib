import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "@/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MdCheckCircle } from "react-icons/md";
import { toast } from "./hooks/use-toast";
import { useAuth } from "./context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { setExToken } = useAuth();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await login(username, password);
      //console.log('JWT Token:', token);
      localStorage.setItem("jwt", token);
      setExToken(false);
      navigate("/add-absence");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (
          <div className="flex items-center gap-2">
            <MdCheckCircle color="red" />
            Authentification echouer.
          </div>
        ),
        className: "bg-red-500 text-white",
      });
      console.error("Login Error:", err);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="p-6 rounded-lg shadow-lg">
        <CardHeader>
          <CardTitle>Se connecter</CardTitle>
          <CardDescription>
            Taper votre utilisateur, et mot de passe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="username">Username:</Label>
            <Input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password:</Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit}>Login</Button>
          <p className="text-xl text-muted-foreground ml-2">
            pas de profile?{" "}
            <a href="/register" className="underline">
              Register
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
