import React, { createContext, useState, useContext, ReactNode } from 'react';

interface PreferencesContextType {
    mapStyle: string;
    lightPreset: 'day' | 'night' | 'dusk' | 'dawn';
    changeMapStyle: (style: 'standard' | 'satellite' | 'hybrid') => void;
    changeLightPreset: (preset: 'day' | 'night' | 'dusk' | 'dawn') => void;
    is3DEnabled: boolean;
    setIs3DEnabled: (enabled: boolean) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

interface PreferencesProviderProps {
    children: ReactNode;
}

export const PreferencesProvider = ({ children }: PreferencesProviderProps) => {
    const [mapStyle, setMapStyle] = useState<string>('mapbox://styles/mapbox/standard');
    const [lightPreset, setLightPreset] = useState<'day' | 'night' | 'dusk' | 'dawn'>('day');
    const [is3DEnabled, setIs3DEnabled] = useState<boolean>(false);

    const changeMapStyle = (type: 'standard' | 'satellite' | 'hybrid') => {
        switch (type) {
            case 'standard':
                setMapStyle('mapbox://styles/mapbox/standard');
                break;
            case 'satellite':
                setMapStyle('mapbox://styles/mapbox/satellite-v9');
                break;
            case 'hybrid':
                setMapStyle('mapbox://styles/mapbox/satellite-streets-v12');
                break;
        }
    };

    const changeLightPreset = (preset: 'day' | 'night' | 'dusk' | 'dawn') => {
        setLightPreset(preset);
    };

    return (
        <PreferencesContext.Provider
            value={{
                mapStyle,
                lightPreset,
                changeMapStyle,
                changeLightPreset,
                is3DEnabled,
                setIs3DEnabled,
            }}
        >
            {children}
        </PreferencesContext.Provider>
    );
};

export const usePreferences = (): PreferencesContextType => {
    const context = useContext(PreferencesContext);
    if (!context) {
        throw new Error('usePreferences must be used within a PreferencesProvider');
    }
    return context;
};