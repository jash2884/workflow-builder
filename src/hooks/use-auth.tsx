import React, { createContext, useContext, useEffect, useState } from "react";

type User = { email: string } | null;

type AuthContextType = {
  user: User;
  signIn: (email: string, password?: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(() => {
    try {
      const raw = localStorage.getItem("auth_user");
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem("auth_user", JSON.stringify(user));
    else localStorage.removeItem("auth_user");
  }, [user]);

  const signIn = async (email: string) => {
    // Lightweight local auth for development. Replace with real provider.
    setUser({ email });
  };

  const signOut = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
