import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
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
  exToken: boolean;
  setExToken: (exToken: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [exToken, setExToken] = useState<boolean>(true);

  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded: any = jwtDecode(token);
      if (!decoded.exp) {
        setExToken(true);
        return true;
      } // No expiration claim
      return decoded.exp * 1000 < Date.now(); // Convert `exp` to milliseconds
    } catch (error) {
      setExToken(true);
      return true; // If decoding fails, assume it's expired
    }
  };

  const loginHandler = async (username: string, password: string) => {
    try {
      const token = await login(username, password);

      if (isTokenExpired(token)) {
        console.warn("Received expired token. Login failed.");
        return;
      }

      localStorage.setItem("jwt", token);
      const decoded: User = jwtDecode(token);
      setToken(token);
      setUser(decoded);
      setExToken(false);
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
    window.location.href = "/";
  };

  useEffect(() => {
    const fetchUser = () => {
      setLoading(true);
      const storedToken = localStorage.getItem("jwt");

      if (storedToken) {
        if (isTokenExpired(storedToken)) {
          console.warn("Token expired, logging out...");
          logout();
        } else {
          try {
            const decoded: User = jwtDecode(storedToken);
            setToken(storedToken);
            setUser(decoded); // Decode and set user
          } catch (error) {
            console.error("Invalid token on refresh:", error);
            logout();
          }
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);
  useEffect(() => {
    if (token) {
      setExToken(isTokenExpired(token));
    } else {
      setExToken(true);
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loginHandler,
        registerHandler,
        logout,
        loading,
        token,
        exToken,
        setExToken,
      }}
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
