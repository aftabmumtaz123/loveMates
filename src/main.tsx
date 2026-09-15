import React,{createContext,useContext,useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter,Routes,Route} from 'react-router-dom';
import './index.css';
import {api,saveAuthToken,clearAuthToken} from './lib/api';
import type {User,Couple} from './types';
import AuthGate from './components/AuthGate';
import AppLayout from './components/AppLayout';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login'; import Signup from './pages/Signup'; import Dashboard from './pages/Dashboard'; import Memories from './pages/Memories'; import BucketList from './pages/BucketList'; import Dates from './pages/Dates'; import Journal from './pages/Journal'; import Messages from './pages/Messages'; import Settings from './pages/Settings'; import MomentDetail from './pages/MomentDetail';

type Auth={user:User|null;loading:boolean;couple:Couple|null;refresh:()=>Promise<void>};
const C=createContext<Auth>({user:null,loading:true,couple:null,refresh:async()=>{}});
export const useAuth=()=>useContext(C);
function App(){
  const [user,setUser]=useState<User|null>(null),[couple,setCouple]=useState<Couple|null>(null),[loading,setLoading]=useState(true);
  const refresh=async()=>{try{const r=await api.get('/auth/me');setUser(r.data.user);setCouple(r.data.couple);if(r.data.token)saveAuthToken(r.data.token)}catch{clearAuthToken();setUser(null);setCouple(null)}finally{setLoading(false)}};
  useEffect(()=>{refresh()},[]);
  return <C.Provider value={{user,loading,couple,refresh}}><ErrorBoundary><Routes>
    <Route path="/login" element={<Login/>}/><Route path="/signup" element={<Signup/>}/>
    <Route element={<AuthGate><AppLayout/></AuthGate>}>
      <Route path="/" element={<Dashboard/>}/><Route path="/memories" element={<Memories/>}/><Route path="/memories/:id" element={<MomentDetail/>}/><Route path="/bucket-list" element={<BucketList/>}/><Route path="/dates" element={<Dates/>}/><Route path="/journal" element={<Journal/>}/><Route path="/messages" element={<Messages/>}/><Route path="/settings" element={<Settings/>}/>
    </Route>
    <Route path="*" element={<Login/>}/>
  </Routes></ErrorBoundary></C.Provider>
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><App/></BrowserRouter></React.StrictMode>);
