import {useCallback,useEffect,useRef,useState} from 'react';
import type {FormEvent} from 'react';
import {Heart,Send,MessageCircle,RefreshCw,Wifi,WifiOff,Check,CheckCheck} from 'lucide-react';
import {api,errorMessage} from '../lib/api';
import {getSocket} from '../lib/socket';
import type {Message} from '../types';
import {useAuth} from '../main';

export default function Messages(){
  const {user,couple}=useAuth();
  const [items,setItems]=useState<Message[]>([]);
  const [text,setText]=useState('');
  const [loading,setLoading]=useState(true);
  const [loadingOlder,setLoadingOlder]=useState(false);
  const [hasMore,setHasMore]=useState(false);
  const [sending,setSending]=useState(false);
  const [error,setError]=useState('');
  const [connected,setConnected]=useState(false);
  const [partnerOnline,setPartnerOnline]=useState(false);
  const bottom=useRef<HTMLDivElement>(null);
  const listRef=useRef<HTMLDivElement>(null);
  const initialScroll=useRef(true);

  const markRead=useCallback((messages:Message[])=>{
    const ids=messages.filter(m=>m.createdBy!==user?.id&&!m.readAt).map(m=>m._id);
    if(!ids.length)return;
    void api.patch('/messages/read',{messageIds:ids}).catch(()=>{});
    const socket=getSocket(); if(socket?.connected) socket.emit('message:read',{messageIds:ids});
    setItems(prev=>prev.map(m=>ids.includes(m._id)?{...m,readAt:new Date().toISOString()}:m));
  },[user?.id]);

  const load=useCallback(async(silent=false)=>{
    try{const r=await api.get('/messages',{params:{limit:20}});setItems(r.data.items||[]);setHasMore(Boolean(r.data.hasMore));setError('');
      setTimeout(()=>markRead(r.data.items||[]),0);
    }catch(e){if(!silent)setError(errorMessage(e))}finally{if(!silent)setLoading(false)}
  },[markRead]);

  const loadOlder=async()=>{
    if(loadingOlder||!hasMore||!items.length)return;
    const first=items[0];setLoadingOlder(true);const box=listRef.current;const oldHeight=box?.scrollHeight||0;
    try{const r=await api.get('/messages',{params:{limit:20,before:first.createdAt}});const older:Message[]=r.data.items||[];setItems(x=>[...older,...x]);setHasMore(Boolean(r.data.hasMore));
      requestAnimationFrame(()=>{if(box)box.scrollTop=box.scrollHeight-oldHeight});markRead(older);
    }catch(e){setError(errorMessage(e))}finally{setLoadingOlder(false)}
  };

  useEffect(()=>{
    void load();
    const socket=getSocket();
    if(!socket){setConnected(false);return;}
    const onConnect=()=>setConnected(true);
    const onDisconnect=()=>setConnected(false);
    const onConnectError=()=>setConnected(false);
    const onNew=(m:Message)=>{setItems(prev=>prev.some(x=>x._id===m._id)?prev:[...prev,m]);if(m.createdBy!==user?.id)markRead([m]);};
    const onStatus=(data:{messageId?:string;messageIds?:string[];status:string;deliveredAt?:string;readAt?:string})=>{
      const ids=data.messageIds|| (data.messageId?[data.messageId]:[]);
      setItems(prev=>prev.map(m=>ids.includes(m._id)?{...m,...(data.status==='delivered'?{deliveredAt:data.deliveredAt||new Date().toISOString()}:{readAt:data.readAt||new Date().toISOString(),deliveredAt:m.deliveredAt||data.readAt||new Date().toISOString()})}:m));
    };
    const onPresence=(d:{userId:string;online:boolean})=>{if(d.userId!==user?.id)setPartnerOnline(d.online)};
    const onViewing=()=>socket.emit('chat:viewing',true);
    const onLeaving=()=>socket.emit('chat:viewing',false);
    socket.on('connect',onConnect).on('disconnect',onDisconnect).on('connect_error',onConnectError).on('message:new',onNew).on('message:status',onStatus).on('presence:update',onPresence).on('connect',onViewing);
    socket.connect();
    if(socket.connected) onViewing();
    return()=>{onLeaving();socket.off('connect',onConnect).off('disconnect',onDisconnect).off('connect_error',onConnectError).off('message:new',onNew).off('message:status',onStatus).off('presence:update',onPresence).off('connect',onViewing)};
  },[load,markRead,user?.id]);

  useEffect(()=>{if(initialScroll.current&&items.length){bottom.current?.scrollIntoView();initialScroll.current=false;}else if(items.length)bottom.current?.scrollIntoView({behavior:'smooth'})},[items.length]);

  const send=async(e:FormEvent)=>{
    e.preventDefault();const body=text.trim();if(!body||sending)return;setSending(true);setError('');const socket=getSocket();
    try{
      if(socket?.connected){await new Promise<void>((resolve,reject)=>socket.emit('message:send',{body},(result:any)=>{if(result?.ok){setText('');resolve()}else reject(new Error(result?.message||'Could not send message.'))}));}
      else{const r=await api.post('/messages',{body});setItems(x=>[...x,r.data]);setText('');}
    }catch(e){setError(errorMessage(e))}finally{setSending(false)}
  };

  const sender=(m:Message)=>{
    if(m.createdBy===user?.id)return {name:user?.name||'You',image:user?.profilePicture};
    return {name:couple?.partner?.name||'Partner',image:couple?.partner?.profilePicture};
  };
  const status=(m:Message)=>{if(m.createdBy!==user?.id)return null;if(m.readAt)return <CheckCheck size={13} className="text-sky-200"/>;if(m.deliveredAt)return <CheckCheck size={13}/>;return <Check size={13}/>};

  return <div className="mx-auto max-w-4xl">
    <div className="flex items-end justify-between gap-4"><div><p className="eyebrow">JUST BETWEEN US</p><h1 className="font-display text-4xl font-bold">Messages</h1><p className="mt-2 text-sm text-slate-500">Real-time private chat with delivery and read status.</p></div><button onClick={()=>load()} className="btn-secondary" title="Refresh"><RefreshCw size={16}/><span className="hidden sm:inline">Refresh</span></button></div>
    {error&&<div className="alert-error mt-5">{error}</div>}
    <section className="card mt-7 overflow-hidden p-0">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-white/80 px-5 py-4"><div className="grid size-10 place-items-center rounded-2xl bg-rose-50 text-rose-500"><MessageCircle size={19}/></div><div className="min-w-0 flex-1"><p className="font-semibold">{couple?.name||'Our chat'}</p><p className="flex items-center gap-1 text-xs text-slate-400">{connected?<Wifi size={12}/>:<WifiOff size={12}/>} {connected?(partnerOnline?`${couple?.partner?.name||'Partner'} is online`:'Connected'):getSocket()?'Connecting…':'Standard chat'}</p></div></div>
      <div ref={listRef} onScroll={e=>{if(e.currentTarget.scrollTop<80)void loadOlder()}} className="h-[55vh] min-h-[360px] overflow-y-auto bg-gradient-to-b from-[#fffafc] to-white p-4 sm:p-6">
        {loading?<div className="grid h-full place-items-center text-sm text-slate-400"><span className="heart-loader">♥</span></div>:<>
          {hasMore&&<div className="mb-3 text-center text-xs text-slate-400">{loadingOlder?'Loading older messages…':'Scroll up for older messages'}</div>}
          {items.length===0?<div className="grid h-full place-items-center text-center"><div><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-rose-50 text-rose-400"><Heart size={24} fill="currentColor"/></div><h2 className="mt-4 font-display text-xl font-bold">Say hello 💗</h2><p className="mt-1 max-w-xs text-sm leading-6 text-slate-500">Start the first conversation in your private little corner.</p></div></div>:<div className="space-y-3">{items.map(m=>{const mine=m.createdBy===user?.id;const s=sender(m);return <div key={m._id} className={`flex ${mine?'justify-end':'justify-start'}`}><div className="max-w-[88%] sm:max-w-[74%]"><div className={`min-w-0 rounded-3xl px-3.5 py-3 shadow-sm ${mine?'rounded-br-md bg-rose-500 text-white':'rounded-bl-md border border-rose-100 bg-rose-50/80 text-slate-700'}`}><div className={`mb-1.5 flex items-center gap-1.5 ${mine?'justify-end':''}`}><span className={`grid size-6 shrink-0 overflow-hidden rounded-full ${mine?'ring-1 ring-rose-300/70':'ring-1 ring-rose-200'} `}>{s.image?<img src={s.image} alt="" className="size-full object-cover"/>:<span className={`grid size-full place-items-center text-[9px] font-bold ${mine?'bg-rose-300 text-white':'bg-rose-100 text-rose-500'}`}>{s.name.charAt(0).toUpperCase()}</span>}</span><span className={`truncate text-[10px] font-semibold ${mine?'text-rose-100':'text-rose-400'}`}>{s.name}</span></div><p className="whitespace-pre-wrap break-words text-sm leading-6">{m.body}</p><p className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${mine?'text-rose-100':'text-rose-400'}`}>{new Date(m.createdAt).toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'})}{status(m)}</p></div></div></div>})}<div ref={bottom}/></div>}
        </>}
      </div>
      <form onSubmit={send} className="border-t border-slate-100 bg-white p-3 sm:p-4"><div className="flex items-end gap-2"><textarea value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void send(e)}}} maxLength={2000} rows={1} className="input max-h-28 min-h-12 resize-none rounded-2xl" placeholder={`Message ${couple?.partner?.name||'your partner'}…`}/><button disabled={sending||!text.trim()} className="grid size-12 shrink-0 place-items-center rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-200 transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"><Send size={18}/></button></div><p className="mt-2 px-1 text-[10px] text-slate-400">Enter to send · Shift + Enter for a new line · last 100 messages retained</p></form>
    </section>
  </div>
}
