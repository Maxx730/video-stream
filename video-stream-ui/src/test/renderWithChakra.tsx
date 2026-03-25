import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { SettingsContext } from '@/provider/SettingsProvider';

const defaultSettings = { darkMode: false };

export function renderWithChakra(ui: React.ReactElement, options?: RenderOptions) {
    return render(
        <ChakraProvider value={defaultSystem}>
            <SettingsContext.Provider value={{ settings: defaultSettings, setBoolValue: () => {}, getBoolValue: () => false }}>
                {ui}
            </SettingsContext.Provider>
        </ChakraProvider>,
        options
    );
}
