import {useEffect,useState} from 'react';
import {Bell,CheckCheck,Heart,MessageCircle,Mail,Trash2,EyeOff} from 'lucide-react';
import {Link} from 'react-router-dom';
import {api,errorMessage} from '../lib/api';
const icon=(type:string)=>type==='comment'?<MessageCircle size={18}/>:type==='letter'?<Mail size={18}/>:type==='reaction'?<Heart size={18}/>:<Bell size={18}/>;
export default function Notifications(){
  const [items,setItems]=useState<any[]>([]),[error,setError]=useState(''),[hidden,setHidden]=useState(false);
  const load=async()=>{try{setError('');setItems((await api.get('/notifications')).data.items||[])}catch(e){setError(errorMessage(e))}};
  useEffect(()=>{void load();const timer=window.setInterval(()=>void load(),10000);return()=>window.clearInterval(timer)},[]);
  const read=async(id:string)=>{await api.patch('/notifications/'+id+'/read');setItems(x=>x.map(n=>n._id===id?{...n,read:true}:n))};
  const all=async()=>{await api.post('/notifications/read-all');setItems(x=>x.map(n=>({...n,read:true})))};
  const clear=async()=>{if(!window.confirm('Clear all notifications? This will permanently remove them from the database.'))return;try{await api.delete('/notifications');setItems([])}catch(e){setError(errorMessage(e))}};
  const unread=items.filter(n=>!n.read).length;
  return <div>
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">YOUR LITTLE UPDATES</p><h1 className="font-display text-4xl font-bold">Notifications</h1><p className="mt-2 text-sm text-slate-500">Activity from your shared little world. New messages use the Messages badge instead.</p></div><div className="flex flex-wrap gap-2">{unread>0&&<button onClick={()=>void all()} className="btn-secondary"><CheckCheck size={16}/> Mark all read</button>}<button onClick={()=>setHidden(v=>!v)} className="btn-secondary"><EyeOff size={16}/>{hidden?'Show latest':'Hide latest'}</button><button onClick={()=>void clear()} className="btn-secondary text-rose-500"><Trash2 size={16}/> Clear all</button></div></div>
    {error&&<div className="alert-error mt-5">{error}</div>}
    {!hidden&&items[0]&&<div className="card mt-6 border-rose-200 bg-gradient-to-r from-rose-50/80 to-fuchsia-50/60"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-rose-400">Latest notification</p><div className="mt-2 flex items-start gap-3"><div className="icon-square tone-0">{icon(items[0].type)}</div><div className="min-w-0 flex-1"><p className="font-semibold">{items[0].title}</p><p className="mt-1 text-sm leading-6 text-slate-500">{items[0].body}</p><p className="mt-2 text-xs text-slate-400">{new Date(items[0].createdAt).toLocaleString()}</p></div></div></div>}
    <div className="mt-7 space-y-3">{items.length?items.map(n=><div key={n._id} className={`card flex items-start gap-4 ${n.read?'opacity-65':'border-rose-200 bg-rose-50/20'}`}><div className="icon-square tone-0">{icon(n.type)}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold">{n.title}</p><p className="mt-1 text-sm leading-6 text-slate-500">{n.body}</p></div>{!n.read&&<span className="mt-1 size-2 rounded-full bg-rose-500"/>}</div><div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400"><span>{new Date(n.createdAt).toLocaleString()}</span>{n.link&&<Link onClick={()=>void read(n._id)} to={n.link} className="font-semibold text-rose-500">Open</Link>}{!n.read&&<button onClick={()=>void read(n._id)} className="font-semibold text-slate-500">Mark read</button>}</div></div></div>):<div className="card py-16 text-center"><Bell className="mx-auto text-rose-300" size={30}/><h2 className="mt-4 font-display text-xl font-bold">You're all caught up</h2><p className="mt-2 text-sm text-slate-400">Reactions, comments, letters, dates and other updates will appear here. Messages are shown only in the Messages badge.</p></div>}</div>
  </div>
}
