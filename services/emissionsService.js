// Emissions tracking service
import { calculateTotalDailyCarbonFootprint } from '../src/lib/utils';

/**
 * Get the start of the current week (Sunday)
 * @returns {Date} The date for the start of the current week
 */
export const getStartOfWeek = () => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diff = now.getDate() - day;
    return new Date(now.setDate(diff));
};

/**
 * Get the start of the current month
 * @returns {Date} The date for the start of the current month
 */
export const getStartOfMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
};

/**
 * Format a date to YYYY-MM-DD
 * @param {Date} date The date to format
 * @returns {string} The formatted date string
 */
export const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

/**
 * Save emissions data for a specific date
 * @param {object} data The emissions data to save
 * @param {string} date Optional date string (defaults to today)
 */
export const saveEmissionsData = (data, date = null) => {
    try {
        const currentUser = sessionStorage.getItem("currentUser");
        if (!currentUser) return;

        const currentDate = date || formatDate(new Date());

        // Calculate total emissions
        const carbonFootprint = calculateTotalDailyCarbonFootprint(data);

        // Get existing emissions history or create a new one
        const emissionsHistoryKey = `${currentUser}_emissionsHistory`;
        const emissionsHistory = JSON.parse(localStorage.getItem(emissionsHistoryKey) || "{}");

        // Save the daily emissions data
        emissionsHistory[currentDate] = {
            ...carbonFootprint,
            date: currentDate,
            timestamp: new Date().toISOString()
        };

        // Save the updated history back to localStorage
        localStorage.setItem(emissionsHistoryKey, JSON.stringify(emissionsHistory));

        // Also update the weekly and monthly aggregates
        updateWeeklyAndMonthlyAggregates(currentUser, emissionsHistory);

        return emissionsHistory[currentDate];
    } catch (error) {
        console.error("Error saving emissions data:", error);
        return null;
    }
};

/**
 * Update the weekly and monthly aggregate data
 * @param {string} currentUser The current user
 * @param {object} emissionsHistory The emissions history object
 */
export const updateWeeklyAndMonthlyAggregates = (currentUser, emissionsHistory) => {
    try {
        // Weekly data
        const weeklyData = calculateWeeklyEmissions(emissionsHistory);
        localStorage.setItem(`${currentUser}_weeklyEmissions`, JSON.stringify(weeklyData));

        // Monthly data
        const monthlyData = calculateMonthlyEmissions(emissionsHistory);
        localStorage.setItem(`${currentUser}_monthlyEmissions`, JSON.stringify(monthlyData));

        return { weeklyData, monthlyData };
    } catch (error) {
        console.error("Error updating weekly and monthly aggregates:", error);
        return { weeklyData: [], monthlyData: [] };
    }
};

/**
 * Calculate weekly emissions from history
 * @param {object} emissionsHistory The emissions history object
 * @returns {Array} The weekly emissions data
 */
export const calculateWeeklyEmissions = (emissionsHistory) => {
    const startOfWeek = getStartOfWeek();
    const daysInWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyData = [];

    // Create array for the current week
    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(date.getDate() + i);
        const dateStr = formatDate(date);
        const dayData = emissionsHistory[dateStr];

        weeklyData.push({
            day: daysInWeek[date.getDay()],
            value: dayData ? dayData.totalCO2 : 0,
            date: dateStr,
            food: dayData ? dayData.foodCO2 : 0,
            transportation: dayData ? dayData.vehicleCO2 : 0,
            energy: dayData ? dayData.energyCO2 : 0
        });
    }

    return weeklyData;
};

/**
 * Calculate monthly emissions from history
 * @param {object} emissionsHistory The emissions history object
 * @returns {Array} The monthly emissions data
 */
export const calculateMonthlyEmissions = (emissionsHistory) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysInMonth = endOfMonth.getDate();

    // Group by week (4 weeks in a month)
    const monthlyData = [
        { week: "Week 1", value: 0, food: 0, transportation: 0, energy: 0, startDate: null, endDate: null },
        { week: "Week 2", value: 0, food: 0, transportation: 0, energy: 0, startDate: null, endDate: null },
        { week: "Week 3", value: 0, food: 0, transportation: 0, energy: 0, startDate: null, endDate: null },
        { week: "Week 4", value: 0, food: 0, transportation: 0, energy: 0, startDate: null, endDate: null }
    ];

    // Calculate the week span
    const weeksInMonth = Math.ceil(daysInMonth / 7);
    const daysPerWeek = Math.ceil(daysInMonth / weeksInMonth);

    // Accumulate data for each week
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(now.getFullYear(), now.getMonth(), day);
        const dateStr = formatDate(date);
        const dayData = emissionsHistory[dateStr];

        // Determine which week this day belongs to (0-3)
        const weekIndex = Math.min(3, Math.floor((day - 1) / daysPerWeek));

        // Set start/end dates for this week if not already set
        if (monthlyData[weekIndex].startDate === null) {
            monthlyData[weekIndex].startDate = dateStr;
        }
        monthlyData[weekIndex].endDate = dateStr;

        // Add the emissions data
        if (dayData) {
            monthlyData[weekIndex].value += dayData.totalCO2;
            monthlyData[weekIndex].food += dayData.foodCO2;
            monthlyData[weekIndex].transportation += dayData.vehicleCO2;
            monthlyData[weekIndex].energy += dayData.energyCO2;
        }
    }

    // Round values to 2 decimal places
    monthlyData.forEach(week => {
        week.value = parseFloat(week.value.toFixed(2));
        week.food = parseFloat(week.food.toFixed(2));
        week.transportation = parseFloat(week.transportation.toFixed(2));
        week.energy = parseFloat(week.energy.toFixed(2));
    });

    return monthlyData;
};

/**
 * Get emissions data for today
 * @returns {object} Today's emissions data
 */
export const getTodayEmissions = () => {
    try {
        const currentUser = sessionStorage.getItem("currentUser");
        if (!currentUser) return null;

        const today = formatDate(new Date());
        const emissionsHistoryKey = `${currentUser}_emissionsHistory`;
        const emissionsHistory = JSON.parse(localStorage.getItem(emissionsHistoryKey) || "{}");

        return emissionsHistory[today] || null;
    } catch (error) {
        console.error("Error getting today's emissions:", error);
        return null;
    }
};

/**
 * Get weekly emissions data
 * @returns {Array} Weekly emissions data
 */
export const getWeeklyEmissions = () => {
    try {
        const currentUser = sessionStorage.getItem("currentUser");
        if (!currentUser) return [];

        const weeklyEmissionsKey = `${currentUser}_weeklyEmissions`;
        return JSON.parse(localStorage.getItem(weeklyEmissionsKey) || "[]");
    } catch (error) {
        console.error("Error getting weekly emissions:", error);
        return [];
    }
};

/**
 * Get monthly emissions data
 * @returns {Array} Monthly emissions data
 */
export const getMonthlyEmissions = () => {
    try {
        const currentUser = sessionStorage.getItem("currentUser");
        if (!currentUser) return [];

        const monthlyEmissionsKey = `${currentUser}_monthlyEmissions`;
        return JSON.parse(localStorage.getItem(monthlyEmissionsKey) || "[]");
    } catch (error) {
        console.error("Error getting monthly emissions:", error);
        return [];
    }
};

/**
 * Calculate weekly total emissions
 * @returns {number} Total weekly emissions
 */
export const calculateWeeklyTotal = () => {
    const weeklyData = getWeeklyEmissions();
    return weeklyData.reduce((total, day) => total + day.value, 0).toFixed(2);
};

/**
 * Calculate monthly total emissions
 * @returns {number} Total monthly emissions
 */
export const calculateMonthlyTotal = () => {
    const monthlyData = getMonthlyEmissions();
    return monthlyData.reduce((total, week) => total + week.value, 0).toFixed(2);
};

/**
 * Initialize and update emissions data
 */
export const initializeEmissionsData = () => {
    try {
        const currentUser = sessionStorage.getItem("currentUser");
        if (!currentUser) return;

        const emissionsHistoryKey = `${currentUser}_emissionsHistory`;
        const emissionsHistory = JSON.parse(localStorage.getItem(emissionsHistoryKey) || "{}");

        // Update weekly and monthly aggregates
        updateWeeklyAndMonthlyAggregates(currentUser, emissionsHistory);

        return {
            today: getTodayEmissions(),
            weekly: getWeeklyEmissions(),
            monthly: getMonthlyEmissions(),
            weeklyTotal: calculateWeeklyTotal(),
            monthlyTotal: calculateMonthlyTotal()
        };
    } catch (error) {
        console.error("Error initializing emissions data:", error);
        return null;
    }
};