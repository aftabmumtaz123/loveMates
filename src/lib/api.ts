import axios from 'axios';
export const api=axios.create({baseURL:import.meta.env.VITE_API_URL||'http://localhost:5000/api',withCredentials:true});
export const errorMessage=(e:unknown)=>axios.isAxiosError(e)?(e.response?.data?.message||'Something went wrong.'):e instanceof Error?e.message:'Something went wrong.';
