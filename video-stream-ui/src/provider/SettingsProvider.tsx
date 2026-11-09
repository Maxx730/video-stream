import { createContext, useState, useEffect } from "react";

export interface Settings {
    darkMode: boolean,
    holidayLights: boolean
}

export interface SettingsContextInterface {
        settings: Settings,
        setBoolValue: (name: string, value: boolean) => void,
        getBoolValue: (name: string) => false
}

const DefaultSettings = {
    darkMode: false,
    holidayLights: false
}
const SETTINGS_KEY = 'ctSettings';

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
            case 'holidayLights':
                return clonedSettings.holidayLights;
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
            case 'holidayLights':
                clonedSettings.holidayLights = value
                break;
        }
        setSettings(clonedSettings);
        writeSettings(clonedSettings);
    }

    const writeSettings = (settings: Settings) => {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch {
            // storage is blocked or full, so settings only last for this visit
        }
    }

    const readSettings = () => {
        try {
            return localStorage.getItem(SETTINGS_KEY);
        } catch {
            return null;
        }
    }

    useEffect(() => {
        const savedSettings = readSettings();
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings) as Partial<Settings>;
                setSettings({ ...DefaultSettings, ...parsed });
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