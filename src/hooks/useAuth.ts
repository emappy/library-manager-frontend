import { useState, useEffect } from "react";
import { login } from "../api/auth";

type AuthUser = {
  id: number;
  username: string;
  email: string;
  role: string;
};

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role) {
      setUser({
        id: 0,
        username: "",
        email: "",
        role: role.toLowerCase(),
      });
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { access_token, user } = await login({ email, password });

      localStorage.setItem("token", access_token);
      localStorage.setItem("role", user.role.toLowerCase());

      setUser({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role.toLowerCase(),
      });
    } catch (err) {
      console.error("Login failed", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
  };

  return { user, loading, signIn, signOut };
};
