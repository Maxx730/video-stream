import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { SettingsContext } from '@/provider/SettingsProvider';

const defaultSettings: Record<string, boolean> = { darkMode: false, holidayLights: false };

interface RenderWithChakraOptions extends RenderOptions {
    settings?: Record<string, boolean>
}

export function renderWithChakra(ui: React.ReactElement, { settings, ...options }: RenderWithChakraOptions = {}) {
    const merged = { ...defaultSettings, ...settings };
    return render(
        <ChakraProvider value={defaultSystem}>
            <SettingsContext.Provider value={{ settings: merged, setBoolValue: () => {}, getBoolValue: (name: string) => merged[name] ?? false }}>
                {ui}
            </SettingsContext.Provider>
        </ChakraProvider>,
        options
    );
}
