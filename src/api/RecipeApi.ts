import axios from "axios"

export const getRecipes = async (machineId: string) => {
    return axios.get(`http://localhost:3001/api/recipes/${machineId}`)
}