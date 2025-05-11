// filepath: c:\Users\DHRUV\Desktop\Ecostrack\src\utils\api.ts
export const fetchVehicleMakes = async () => {
    try {
        const response = await fetch("https://www.carboninterface.com/api/v1/vehicle_makes", {
            headers: { Authorization: `Bearer ${CARBON_INTERFACE_API_KEY}` },
        });
        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch vehicle makes:", error);
        return [];
    }
};