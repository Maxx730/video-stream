import { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { buildRequestURL } from '@/util/utils';

export interface AuthError {
    err: number,
    message: string
}

export interface AuthUser {
    id: number,
    expires: number
}

export interface AuthInfo {
    token: string | null
}

export interface AuthContextInterface {
    auth: AuthInfo,
    user: AuthUser,
    checkToken: () => Promise<{
        token: string
    } | AuthError>
    setToken: (token: string) => void,
    login: (email: string, password: string) => any,
    logout: () => void
}

const TOKEN = 'ctAuth';
const AuthContextDefault = {
    auth: {
        token: null
    },
    user: {
        id: -1,
        expires: -1
    }
}

export const AuthContext = createContext<any>(AuthContextDefault);
export const AuthProvider: React.FC<{
    children: React.ReactNode
}> = ({ children }) => {
    const [auth, setAuth] = useState<AuthInfo | null>(null);
    const checkToken = () => {
        return new Promise(async (resolve, reject) => {
            const authToken = Cookies.get(TOKEN);
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (authToken) {
                resolve({
                    token: authToken
                });
            } else {
                resolve({
                    err: 403,
                    message: 'user not authorized'
                });
            }
        });
    }

    const setToken = (token: string) => {
        Cookies.set(TOKEN, token);
        setAuth({
            token
        });
    }

    const login = async (email: string, password: string) => {
        const authHostUrl = buildRequestURL('2278');
        const loginResponse = await fetch(`${authHostUrl}/login`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password
            })
        });
        const data = await loginResponse.json();
        return {
            status: loginResponse.status,
            ...data
        };
    }

    const logout = async () => {
        await Cookies.remove(TOKEN);
        window.location.reload();
    }

    return (
        <AuthContext.Provider value={{
            auth,
            login,
            logout,
            checkToken,
            setToken
        }}>
            {children}
        </AuthContext.Provider>
    )
}
