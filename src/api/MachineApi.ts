import axios from "axios";

export const getMachines = async () => {
    try {
        const response = await fetch('http://localhost:3001/api/machines');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching machines:', error);
        throw error;
    }
};

export const createMachine = async (machineData: { name: string; crafting_speed_multiplier: number; image: File | null }) => {
    try {
        const response = await axios.post('http://localhost:3001/api/machines', machineData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.status || response.status >= 400) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = response.data;
        return data;
    } catch (error) {
        console.error('Error creating machine:', error);
        throw error;
    }
};