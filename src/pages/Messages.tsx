import {FormEvent,useEffect,useRef,useState} from 'react';
import {Heart,Send,MessageCircle,RefreshCw} from 'lucide-react';
import {api,errorMessage} from '../lib/api';
import type {Message} from '../types';
import {useAuth} from '../main';

export default function Messages(){
  const {user,couple}=useAuth(); const [items,setItems]=useState<Message[]>([]); const [text,setText]=useState(''); const [loading,setLoading]=useState(true); const [sending,setSending]=useState(false); const [error,setError]=useState(''); const bottom=useRef<HTMLDivElement>(null);
  const load=async(silent=false)=>{try{const r=await api.get('/messages');setItems(r.data);setError('')}catch(e){if(!silent)setError(errorMessage(e))}finally{if(!silent)setLoading(false)}};
  useEffect(()=>{load(); const id=window.setInterval(()=>load(true),2500); return()=>window.clearInterval(id)},[]);
  useEffect(()=>{bottom.current?.scrollIntoView({behavior:'smooth'})},[items.length]);
  const send=async(e:FormEvent)=>{e.preventDefault();const body=text.trim();if(!body||sending)return;setSending(true);try{const r=await api.post('/messages',{body});setItems(x=>[...x,r.data]);setText('')}catch(e){setError(errorMessage(e))}finally{setSending(false)}};
  return <div className="mx-auto max-w-4xl">
    <div className="flex items-end justify-between gap-4"><div><p className="eyebrow">JUST BETWEEN US</p><h1 className="font-display text-4xl font-bold">Messages</h1><p className="mt-2 text-sm text-slate-500">A simple private chat — no WebSocket required.</p></div><button onClick={()=>load()} className="btn-secondary" title="Refresh"><RefreshCw size={16}/><span className="hidden sm:inline">Refresh</span></button></div>
    {error&&<div className="alert-error mt-5">{error}</div>}
    <section className="card mt-7 overflow-hidden p-0">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-white/80 px-5 py-4"><div className="grid size-10 place-items-center rounded-2xl bg-rose-50 text-rose-500"><MessageCircle size={19}/></div><div><p className="font-semibold">{couple?.name||'Our chat'}</p><p className="text-xs text-slate-400">Messages refresh automatically every few seconds</p></div></div>
      <div className="h-[55vh] min-h-[360px] overflow-y-auto bg-gradient-to-b from-[#fffafc] to-white p-4 sm:p-6">
        {loading?<div className="grid h-full place-items-center text-sm text-slate-400"><span className="heart-loader">♥</span></div>:items.length===0?<div className="grid h-full place-items-center text-center"><div><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-rose-50 text-rose-400"><Heart size={24} fill="currentColor"/></div><h2 className="mt-4 font-display text-xl font-bold">Say hello 💗</h2><p className="mt-1 max-w-xs text-sm leading-6 text-slate-500">Start the first conversation in your private little corner.</p></div></div>:<div className="space-y-3">{items.map(m=>{const mine=m.createdBy===user?.id;return <div key={m._id} className={`flex ${mine?'justify-end':'justify-start'}`}><div className={`max-w-[82%] sm:max-w-[70%] rounded-3xl px-4 py-3 shadow-sm ${mine?'rounded-br-md bg-rose-500 text-white':'rounded-bl-md border border-slate-100 bg-white text-slate-700'}`}><p className="whitespace-pre-wrap break-words text-sm leading-6">{m.body}</p><p className={`mt-1 text-[10px] ${mine?'text-rose-100':'text-slate-400'}`}>{new Date(m.createdAt).toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'})}</p></div></div>})}<div ref={bottom}/></div>}
      </div>
      <form onSubmit={send} className="border-t border-slate-100 bg-white p-3 sm:p-4"><div className="flex items-end gap-2"><textarea value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send(e)}}} maxLength={2000} rows={1} className="input max-h-28 min-h-12 resize-none rounded-2xl" placeholder={`Message ${couple?.partner?.name||'your partner'}…`}/><button disabled={sending||!text.trim()} className="grid size-12 shrink-0 place-items-center rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-200 transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"><Send size={18}/></button></div><p className="mt-2 px-1 text-[10px] text-slate-400">Enter to send · Shift + Enter for a new line</p></form>
    </section>
  </div>
}
