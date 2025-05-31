//rolesApi.ts
import axios from "axios";

export const fetchRoles = async () => {
  // ✅ Correct API endpoint
const res = await axios.get("https://tumbledrybe.sharda.co.in/api/roles");
  console.log('API Response:', res); // Log the full response
  console.log('Response data:', res.data); // Log the data property
  return res.data || [];
};


export const updateRole = async (id: string, data: any) => {
  const res = await axios.put(`https://tumbledrybe.sharda.co.in/api/roles/${id}`, data);
  return res.data;
};
