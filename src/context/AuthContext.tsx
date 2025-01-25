import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode"; // Correct the import if needed
import { login, register } from "@/api";

interface User {
  username: string;
}

interface AuthContextType {
  user: User | null;
  loginHandler: (username: string, password: string) => Promise<void>;
  registerHandler: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const loginHandler = async (username: string, password: string) => {
    try {
      // Call login API
      const token = await login(username, password);

      // Save token to localStorage
      localStorage.setItem("jwt", token);

      // Decode token and set state directly
      const decoded: User = jwtDecode(token);
      setToken(token);
      setUser(decoded); // Immediate update, no need to wait for useEffect
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const registerHandler = async (username: string, password: string) => {
    try {
      await register(username, password);
      console.log("Registration successful");
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  const logout = () => {
    // Clear storage and state
    localStorage.removeItem("jwt");
    setToken(null);
    setUser(null);
  };

  // Fetch user on component mount (on page refresh)
  useEffect(() => {
    const fetchUser = () => {
      setLoading(true);
      const storedToken = localStorage.getItem("jwt");

      if (storedToken) {
        try {
          const decoded: User = jwtDecode(storedToken);
          setToken(storedToken);
          setUser(decoded); // Decode and set user
        } catch (error) {
          console.error("Invalid token on refresh:", error);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loginHandler, registerHandler, logout, loading, token }}
    >
      {!loading ? children : <p>Loading...</p>}{" "}
      {/* Optionally show loading state */}
    </AuthContext.Provider>
  );
};

export default AuthContext;

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
