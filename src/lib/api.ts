import axios from 'axios';

const AUTH_TOKEN_KEY='couplenest_auth_token';

export const api=axios.create({
  baseURL:import.meta.env.VITE_API_URL||'http://localhost:5000/api',
  withCredentials:true,
});

// Cookie auth is preferred. The bearer token is a fallback for browsers that
// block cross-origin cookie credentials. This keeps the app usable on Vercel.
api.interceptors.request.use(config=>{
  const token=localStorage.getItem(AUTH_TOKEN_KEY);
  if(token) config.headers.Authorization=`Bearer ${token}`;
  return config;
});

export const saveAuthToken=(token:string|undefined)=>{
  if(token) localStorage.setItem(AUTH_TOKEN_KEY,token);
};

export const clearAuthToken=()=>localStorage.removeItem(AUTH_TOKEN_KEY);

export const errorMessage=(e:unknown)=>axios.isAxiosError(e)?(e.response?.data?.message||'Something went wrong.'):e instanceof Error?e.message:'Something went wrong.';
