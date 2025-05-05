import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

// Create the context
const AuthContext = createContext(null);

// Default userData object with standardized keys
const defaultUserData = {
  serviceUrl: "http://103.168.19.35/iStWebPublic/iStreamsSmartPublic.asmx",
  organization: null,
  clientURL: null,
  doConnectionParameter: null,
  currentUserLogin: null,
  currentUserName: null,
  currentUserEmpNo: null,
  currentUserImageData: "null",
};

export const AuthProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Toggle theme function
  // const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  // auth only stores token and email for authentication
  const [auth, setAuth] = useState(() => {
    try {
      const stored = localStorage.getItem("auth") || sessionStorage.getItem("auth");
      return stored ? JSON.parse(stored) : { token: null, email: null };
    } catch (err) {
      console.error("Error parsing stored auth:", err);
      return { token: null, email: null };
    }
  });

  // userData stores extended user information
  const [userData, setUserData] = useState(() => {
    try {
      const stored = localStorage.getItem("userData");
      return stored ? JSON.parse(stored) : defaultUserData;
    } catch (err) {
      console.error("Error parsing stored userData:", err);
      return defaultUserData;
    }
  });

  // Memoized login function: expects data to have token, email, and other user details
  const login = useCallback((data, rememberMe = false) => {
    // Set minimal authentication data
    const authData = { token: data.token, email: data.email };
    setAuth(authData);
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("auth", JSON.stringify(authData));

    // Merge new user details with the default userData structure
    const newUserData = { ...defaultUserData, ...data };
    // Remove token and email if they exist in newUserData to avoid redundancy
    delete newUserData.token;
    delete newUserData.email;

    setUserData(newUserData);
    localStorage.setItem("userData", JSON.stringify(newUserData));
  }, []);

  // Memoized logout function: resets auth and userData
  const logout = useCallback(() => {
    setAuth({ token: null, email: null });
    setUserData(defaultUserData);
    localStorage.removeItem("auth");
    sessionStorage.removeItem("auth");
    localStorage.removeItem("userData");
  }, []);

  return (
    <AuthContext.Provider
      value={{ auth, login, logout, userData, setUserData }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
