import {NavLink, Outlet, useNavigate} from 'react-router-dom';
import {useEffect,useState} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {Heart, Home, Image, CheckSquare, CalendarDays, BookHeart, Settings, Menu, X, LogOut, Sparkles, MessageCircle, Cake, Bell, HeartHandshake, Mail, MapPin, BarChart3,WalletCards,Gamepad2,Music2,Gift,ListTodo,UserRound,ShieldCheck,Palette,BellRing,Smartphone} from 'lucide-react';
import {api} from '../lib/api';
import {useAuth} from '../main';

const links = [
  ['/','Home',Home], ['/memories','Memories',Image], ['/bucket-list','Bucket list',CheckSquare],
  ['/dates','Dates',CalendarDays], ['/journal','Journal',BookHeart], ['/messages','Messages',MessageCircle], ['/rituals','Daily rituals',HeartHandshake], ['/letters','Open When',Mail], ['/timeline','Our timeline',HeartHandshake], ['/places','Places',MapPin], ['/stats','Our stats',BarChart3], ['/notifications','Notifications',Bell], ['/settings','Settings',Settings], ['/games','Couple games',Gamepad2], ['/playlist','Playlist',Music2], ['/wishlist','Wishlist',Gift], ['/tasks','Shared tasks',ListTodo], ['/expenses','Trip expenses',WalletCards], ['/couple-profile','Couple profile',UserRound], ['/privacy','Privacy center',ShieldCheck], ['/themes','Themes',Palette], ['/push','Push alerts',BellRing], ['/pwa','Install app',Smartphone]
] as const;

export default function AppLayout(){
  const [open,setOpen]=useState(false); const [unread,setUnread]=useState(0); const nav=useNavigate(); const {couple,user,refresh}=useAuth();
  const logout=async()=>{await api.post('/auth/logout');await refresh();nav('/login')}; useEffect(()=>{let alive=true;const load=async()=>{try{const r=await api.get('/notifications');if(alive)setUnread(Number(r.data.unread||0))}catch{}};void load();const timer=window.setInterval(load,10000);return()=>{alive=false;window.clearInterval(timer)}},[]);
  const navItems=links.map(([to,label,Icon])=><NavLink onClick={()=>setOpen(false)} key={to} to={to} className={({isActive})=>`nav-link ${isActive?'nav-active':''}`}><Icon size={19}/><span className="min-w-0 flex-1">{label}</span>{to==='/notifications'&&unread>0&&<span className="grid min-w-5 place-items-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{unread>99?'99+':unread}</span>}</NavLink>);
  return <div className="min-h-screen bg-[var(--cn-bg)] text-slate-800">
    <aside className="fixed inset-y-0 left-0 z-40 hidden h-screen w-72 flex-col overflow-hidden border-r border-rose-100 bg-white/85 px-5 py-6 backdrop-blur-xl lg:flex">
      <Brand/><div className="mt-6 flex shrink-0 items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/60 p-3"><Avatar src={user?.profilePicture}/><div className="min-w-0"><p className="truncate text-sm font-semibold">{couple?.name||'Our space'}</p><p className="flex items-center gap-1 text-[11px] text-slate-400"><Cake size={12}/> Private couple space</p></div></div><div className="mt-5 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 [scrollbar-width:thin]">{navItems}</div>
      <div className="mt-4 shrink-0"><div className="rounded-3xl bg-gradient-to-br from-rose-50 to-violet-50 p-4"><div className="flex items-center gap-2 text-sm font-semibold"><Sparkles size={16}/> Your little corner</div><p className="mt-1 text-xs leading-5 text-slate-500">{couple?.name||'Our space'} is private to you two.</p></div><button onClick={logout} className="mt-3 nav-link w-full text-slate-500"><LogOut size={18}/> Sign out</button></div>
    </aside>
    <header className="sticky top-0 z-30 border-b border-rose-100/80 bg-white/85 px-4 py-3 backdrop-blur-xl lg:hidden"><div className="flex items-center justify-between"><Brand compact/><button className="icon-btn" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></div></header>
    <AnimatePresence>{open&&<motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="fixed inset-x-0 top-[65px] z-30 max-h-[calc(100vh-65px)] overflow-y-auto bg-white p-4 shadow-xl lg:hidden"><div className="space-y-1">{navItems}</div></motion.div>}</AnimatePresence>
    <main className="w-full px-4 py-6 lg:ml-72 lg:w-[calc(100%-18rem)] lg:max-w-none lg:px-8 lg:py-10"><Outlet/></main>
  </div>
}
function Avatar({src}:{src?:string}){return src?<img src={src} className="size-10 rounded-xl object-cover"/>:<div className="grid size-10 place-items-center rounded-xl bg-white text-rose-400"><Heart size={17} fill="currentColor"/></div>}
function Brand({compact=false}:{compact?:boolean}){return <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-rose-400 to-fuchsia-500 text-white shadow-lg shadow-rose-200"><Heart size={19} fill="currentColor"/></div>{!compact&&<div><div className="font-display text-xl font-bold">CoupleNest</div><div className="text-[11px] text-slate-400">your private little world</div></div>}</div>}
