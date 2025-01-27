import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "@/api";
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

const Register = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    try {
      await register(username, password);
      navigate("/login");
    } catch (err) {
      setError("Registration failed try again.");
      console.error("Registration Error:", err);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="p-6 rounded-lg shadow-lg">
        <CardHeader>
          <CardTitle>Creer un profile</CardTitle>
          <CardDescription>
            choisir votre utilisateur, et mot de passe.
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
          <div>
            <Label htmlFor="confirm-password">Confirm Password:</Label>
            <Input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit}>Register</Button>
          <p className="text-xl text-muted-foreground ml-2">
            Deja avoir un compte?{" "}
            <a href="/login" className="underline">
              Connextion
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
