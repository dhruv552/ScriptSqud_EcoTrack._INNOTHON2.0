import React, { useState, useEffect } from 'react';
import './EmissionsDashboard.css';
import {
    getWeeklyEmissions,
    getMonthlyEmissions,
    calculateWeeklyTotal,
    calculateMonthlyTotal,
    getTodayEmissions,
    initializeEmissionsData
} from '../services/emissionsService';

const EmissionsDashboard = ({ userEmissionsData }) => {
    const [activeView, setActiveView] = useState('Daily');
    const [emissionsData, setEmissionsData] = useState({
        daily: null,
        weekly: [],
        monthly: [],
        weeklyTotal: 0,
        monthlyTotal: 0
    });

    useEffect(() => {
        // Initialize emissions data when component mounts
        loadEmissionsData();
    }, [userEmissionsData]);

    // Load emissions data from localStorage
    const loadEmissionsData = () => {
        // Initialize/refresh emissions data
        const data = initializeEmissionsData() || {
            today: getTodayEmissions(),
            weekly: getWeeklyEmissions(),
            monthly: getMonthlyEmissions(),
            weeklyTotal: calculateWeeklyTotal(),
            monthlyTotal: calculateMonthlyTotal()
        };

        // If we have userEmissionsData passed as prop, use that for daily view
        const dailyData = userEmissionsData?.daily || data.today || {
            totalCO2: 0,
            foodCO2: 0,
            vehicleCO2: 0,
            energyCO2: 0,
            date: new Date().toISOString().split('T')[0]
        };

        setEmissionsData({
            daily: dailyData,
            weekly: data.weekly,
            monthly: data.monthly,
            weeklyTotal: data.weeklyTotal,
            monthlyTotal: data.monthlyTotal
        });
    };

    // Determine which data to show based on the active view
    const getCurrentViewData = () => {
        switch (activeView) {
            case 'Weekly':
                return {
                    data: emissionsData.weekly,
                    total: emissionsData.weeklyTotal,
                    dateRange: getWeekDateRange()
                };
            case 'Monthly':
                return {
                    data: emissionsData.monthly,
                    total: emissionsData.monthlyTotal,
                    dateRange: getMonthDateRange()
                };
            case 'Daily':
            default:
                return {
                    data: [emissionsData.daily],
                    total: emissionsData.daily?.totalCO2 || 0,
                    dateRange: emissionsData.daily?.date || new Date().toISOString().split('T')[0]
                };
        }
    };

    // Helper function to get current week date range
    const getWeekDateRange = () => {
        if (emissionsData.weekly.length === 0) return "Current Week";

        const startDate = emissionsData.weekly[0].date;
        const endDate = emissionsData.weekly[emissionsData.weekly.length - 1].date;

        return `${formatDateShort(startDate)} - ${formatDateShort(endDate)}`;
    };

    // Helper function to get current month date range
    const getMonthDateRange = () => {
        const now = new Date();
        return now.toLocaleString('default', { month: 'long', year: 'numeric' });
    };

    // Format date in a short readable format
    const formatDateShort = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Get data for current view
    const currentViewData = getCurrentViewData();
    const totalEmissions = currentViewData.total;

    return (
        <div className="emissions-dashboard">
            <div className="dashboard-header">
                <div className="date-display">
                    <h2>{currentViewData.dateRange} <span className="calendar-icon">📅</span></h2>
                    <p className="total-emissions">
                        Total Emissions: {totalEmissions} kg CO<sub>2</sub>
                        {emissionsData.daily?.trend && activeView === 'Daily' && (
                            <span className={`trend-badge ${emissionsData.daily.trend.toLowerCase()}`}>
                                {emissionsData.daily.trend}
                            </span>
                        )}
                    </p>
                </div>
            </div>

            <div className="view-tabs">
                <button
                    className={activeView === 'Daily' ? 'active' : ''}
                    onClick={() => setActiveView('Daily')}
                >
                    Daily
                </button>
                <button
                    className={activeView === 'Weekly' ? 'active' : ''}
                    onClick={() => setActiveView('Weekly')}
                >
                    Weekly
                </button>
                <button
                    className={activeView === 'Monthly' ? 'active' : ''}
                    onClick={() => setActiveView('Monthly')}
                >
                    Monthly
                </button>
            </div>

            {activeView === 'Daily' && (
                <div className="emission-categories">
                    <div className="category-item">
                        <span className="category-name">Transportation</span>
                        <span className="category-value">
                            {emissionsData.daily?.vehicleCO2 || 0} kg CO<sub>2</sub>
                        </span>
                    </div>

                    <div className="category-item">
                        <span className="category-name">Food Consumption</span>
                        <span className="category-value">
                            {emissionsData.daily?.foodCO2 || 0} kg CO<sub>2</sub>
                        </span>
                    </div>

                    <div className="category-item">
                        <span className="category-name">Energy Usage</span>
                        <span className="category-value">
                            {emissionsData.daily?.energyCO2 || 0} kg CO<sub>2</sub>
                        </span>
                    </div>
                </div>
            )}

            {activeView === 'Weekly' && (
                <div className="weekly-view">
                    <div className="weekly-chart">
                        {emissionsData.weekly.map((day, index) => (
                            <div key={index} className="chart-bar-container">
                                <div className="chart-label">{day.day}</div>
                                <div className="chart-bar-wrapper">
                                    <div
                                        className="chart-bar"
                                        style={{
                                            height: `${Math.max(5, (day.value / (Math.max(...emissionsData.weekly.map(d => d.value)) || 1)) * 100)}%`
                                        }}
                                    >
                                        <span className="chart-value">{day.value}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="emission-categories weekly-categories">
                        <div className="category-item">
                            <span className="category-name">Transportation</span>
                            <span className="category-value">
                                {emissionsData.weekly.reduce((sum, day) => sum + day.transportation, 0).toFixed(2)} kg CO<sub>2</sub>
                            </span>
                        </div>

                        <div className="category-item">
                            <span className="category-name">Food Consumption</span>
                            <span className="category-value">
                                {emissionsData.weekly.reduce((sum, day) => sum + day.food, 0).toFixed(2)} kg CO<sub>2</sub>
                            </span>
                        </div>

                        <div className="category-item">
                            <span className="category-name">Energy Usage</span>
                            <span className="category-value">
                                {emissionsData.weekly.reduce((sum, day) => sum + day.energy, 0).toFixed(2)} kg CO<sub>2</sub>
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {activeView === 'Monthly' && (
                <div className="monthly-view">
                    <div className="monthly-chart">
                        {emissionsData.monthly.map((week, index) => (
                            <div key={index} className="chart-bar-container">
                                <div className="chart-label">{week.week}</div>
                                <div className="chart-bar-wrapper">
                                    <div
                                        className="chart-bar"
                                        style={{
                                            height: `${Math.max(5, (week.value / (Math.max(...emissionsData.monthly.map(w => w.value)) || 1)) * 100)}%`
                                        }}
                                    >
                                        <span className="chart-value">{week.value}</span>
                                    </div>
                                </div>
                                <div className="chart-date-range">
                                    {week.startDate && week.endDate ?
                                        `${formatDateShort(week.startDate)}-${formatDateShort(week.endDate)}` : ""}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="emission-categories monthly-categories">
                        <div className="category-item">
                            <span className="category-name">Transportation</span>
                            <span className="category-value">
                                {emissionsData.monthly.reduce((sum, week) => sum + week.transportation, 0).toFixed(2)} kg CO<sub>2</sub>
                            </span>
                        </div>

                        <div className="category-item">
                            <span className="category-name">Food Consumption</span>
                            <span className="category-value">
                                {emissionsData.monthly.reduce((sum, week) => sum + week.food, 0).toFixed(2)} kg CO<sub>2</sub>
                            </span>
                        </div>

                        <div className="category-item">
                            <span className="category-name">Energy Usage</span>
                            <span className="category-value">
                                {emissionsData.monthly.reduce((sum, week) => sum + week.energy, 0).toFixed(2)} kg CO<sub>2</sub>
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmissionsDashboard;
