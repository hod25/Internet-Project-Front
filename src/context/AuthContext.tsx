import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

interface User {
    id: string;
    username: string;
}

interface AuthContextType {
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded: any = jwtDecode(token);
            setUser({ id: decoded.id, username: decoded.username });
        }
    }, []);

    const login = (token: string) => {
        localStorage.setItem("token", token);
        const decoded: any = jwtDecode(token);
        setUser({ id: decoded.id, username: decoded.username });
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
