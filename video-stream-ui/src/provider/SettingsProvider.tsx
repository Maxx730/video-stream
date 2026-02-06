import { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

export interface Settings {
    darkMode: boolean
}

export interface SettingsContextInterface {
        settings: Settings,
        setBoolValue: (name: string, value: boolean) => void,
        getBoolValue: (name: string) => false
}

const DefaultSettings = {
    darkMode: false
}
const SETTINGS_COOKIE = 'ctSettings';

export const SettingsContext = createContext<any>(DefaultSettings);

export const SettingsProvider: React.FC<{
    children: React.ReactNode
}> = ({ children }) => {
    const [settings, setSettings] = useState<Settings>(DefaultSettings);

    const getBoolValue = (name: string) => {
        const clonedSettings: Settings = JSON.parse(JSON.stringify(settings));
        switch(name) {
            case 'darkMode':
                return clonedSettings.darkMode;
            default:
                return false;
        }
    }

    const setBoolValue = (name: string, value: boolean) => {
        const clonedSettings: Settings = JSON.parse(JSON.stringify(settings));
        switch(name) {
            case 'darkMode':
                clonedSettings.darkMode = value
                break;
        }
        setSettings(clonedSettings);
        writeSettings(clonedSettings);
    }

    const writeSettings = (settings: Settings) => {
        Cookies.set(SETTINGS_COOKIE, JSON.stringify(settings));
    }

    const readSettings = () => {
        return Cookies.get(SETTINGS_COOKIE);
    }

    useEffect(() => {
        const savedSettings = readSettings();
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings) as Settings;
                setSettings(parsed);
            } catch(err) {
                setSettings(DefaultSettings);
            }
        }
    }, []);

    return (
        <SettingsContext.Provider value={{
            settings,
            getBoolValue,
            setBoolValue
        }}>
            { children }
        </SettingsContext.Provider>
    );
}