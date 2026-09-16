import React from 'react';
import {useState} from 'react';
import type {FormEvent} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {ArrowRight,Heart,ShieldCheck} from 'lucide-react';
import {motion} from 'framer-motion';
import {api,errorMessage} from '../lib/api';
import {useAuth} from '../main';

export default function Login(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const [accountMissing,setAccountMissing]=useState(false);
  const nav=useNavigate();
  const {refresh}=useAuth();

  const request=async(e:FormEvent)=>{
    e.preventDefault();
    setError('');
    setAccountMissing(false);
    setBusy(true);
    try{
      await api.post('/auth/login',{email,password});
      await refresh();
      nav('/');
    }catch(e){
      const status=(e as any)?.response?.status;
      if(status===404){
        setAccountMissing(true);
        setError('No account was found with this email.');
      }else{
        setError(errorMessage(e));
      }
    }finally{setBusy(false)}
  };

  const createAccount=()=>nav(`/signup?email=${encodeURIComponent(email.trim().toLowerCase())}`);

  return <AuthShell><div className="mx-auto w-full max-w-md">
    <p className="eyebrow">WELCOME BACK</p>
    <h1 className="font-display text-4xl font-bold tracking-tight">Come back to your<br/><span className="text-gradient">little world.</span></h1>
    <p className="mt-3 text-slate-500">Sign in with your email and password.</p>
    <form onSubmit={request} className="mt-8 space-y-4">
      {error&&<div className="alert-error">{error}</div>}
      {accountMissing&&<div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4">
        <p className="text-sm font-semibold text-slate-800">Create your CoupleNest account?</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">We couldn't find an account for <b className="text-slate-700">{email}</b>. You can create one using this email address.</p>
        <button type="button" onClick={createAccount} className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-rose-500 hover:text-rose-600">Create account with this email <ArrowRight size={15}/></button>
      </div>}
      <input className="input" placeholder="Email address" type="email" value={email} onChange={e=>{setEmail(e.target.value);setAccountMissing(false)}} required/>
      <input className="input" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required/>
      <button disabled={busy} className="btn-primary w-full">{busy?'Signing in…':'Sign in securely'}<ArrowRight size={17}/></button>
      <div className="flex items-center justify-center gap-2 text-xs text-slate-400"><ShieldCheck size={14}/> Your password securely signs you in</div>
    </form>
    <p className="mt-6 text-center text-sm text-slate-500">New here? <Link className="font-semibold text-rose-500" to="/signup">Create your nest</Link></p>
  </div></AuthShell>
}

function AuthShell({children}:{children:React.ReactNode}){return <div className="min-h-screen overflow-hidden bg-[#fff9fb]"><div className="absolute -left-24 -top-24 size-72 rounded-full bg-rose-200/50 blur-3xl"/><div className="absolute -bottom-32 -right-20 size-96 rounded-full bg-violet-200/50 blur-3xl"/><div className="relative mx-auto grid min-h-screen max-w-6xl gap-12 px-6 py-10 lg:grid-cols-2 lg:items-center"><motion.div initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} className="hidden lg:block"><div className="inline-flex items-center gap-3 rounded-full border border-rose-100 bg-white/70 px-4 py-2 text-sm font-semibold"><Heart size={15} className="text-rose-500" fill="currentColor"/> Made for two</div><h2 className="mt-8 font-display text-6xl font-bold leading-[1.02]">A tiny home<br/>for your <span className="text-gradient">big love.</span></h2><p className="mt-6 max-w-md text-lg leading-8 text-slate-500">Keep the little things that become the best stories — together, privately, beautifully.</p></motion.div><motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>{children}</motion.div></div></div>}
