import React, { useState } from 'react';
import EmissionsDashboard from './components/EmissionsDashboard';
import EmissionsForm from './components/EmissionsForm';
import initialEmissionsData from './data/emissionsData';
import './App.css';

function App() {
    const [emissionsData, setEmissionsData] = useState(initialEmissionsData);
    const [activeView, setActiveView] = useState('daily');

    // Function to update the emissions data
    const updateEmissions = (newData) => {
        const updatedData = {
            ...emissionsData,
            [activeView]: {
                ...emissionsData[activeView],
                ...newData,
                // Compare with previous data to determine trend
                trend: calculateTrend(emissionsData[activeView], newData)
            }
        };

        setEmissionsData(updatedData);

        // For a real application, you might want to save this data
        // to localStorage or a backend database
        saveDataLocally(updatedData);
    };

    // Helper function to calculate trend
    const calculateTrend = (oldData, newData) => {
        const oldTotal = Object.values(oldData)
            .filter(val => typeof val === 'number')
            .reduce((sum, val) => sum + val, 0);

        const newTotal = Object.values(newData)
            .reduce((sum, val) => sum + val, 0);

        return newTotal > oldTotal ? "Increased" : "Decreased";
    };

    // Save data to localStorage (optional)
    const saveDataLocally = (data) => {
        try {
            localStorage.setItem('emissionsData', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save data locally:', error);
        }
    };

    return (
        <div className="app">
            <header className="app-header">
                <h1>Carbon Emissions Tracker</h1>
                <p>Monitor your household carbon footprint</p>
            </header>

            <main className="app-content">
                <EmissionsDashboard
                    userEmissionsData={emissionsData}
                />

                <EmissionsForm
                    onUpdateEmissions={updateEmissions}
                    currentData={emissionsData[activeView]}
                />
            </main>
        </div>
    );
}

// Load data from localStorage on initial load (optional)
function loadSavedData() {
    try {
        const savedData = localStorage.getItem('emissionsData');
        return savedData ? JSON.parse(savedData) : null;
    } catch (error) {
        console.error('Failed to load saved data:', error);
        return null;
    }
}

export default App;
