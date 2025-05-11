import React, { useState } from 'react';
import './EmissionsForm.css';

const EmissionsForm = ({ onUpdateEmissions, currentData }) => {
    const [formData, setFormData] = useState({
        transportation: currentData?.transportation || 0,
        food: currentData?.food || 0,
        energy: currentData?.energy || 0
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: parseFloat(value) || 0
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdateEmissions(formData);
    };

    return (
        <div className="emissions-form">
            <h3>Update Your Emissions Data</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="transportation">Transportation (kg CO2)</label>
                    <input
                        type="number"
                        id="transportation"
                        name="transportation"
                        step="0.1"
                        value={formData.transportation}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="food">Food Consumption (kg CO2)</label>
                    <input
                        type="number"
                        id="food"
                        name="food"
                        step="0.1"
                        value={formData.food}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="energy">Energy Usage (kg CO2)</label>
                    <input
                        type="number"
                        id="energy"
                        name="energy"
                        step="0.1"
                        value={formData.energy}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" className="submit-button">
                    Update Emissions
                </button>
            </form>
        </div>
    );
};

export default EmissionsForm;
