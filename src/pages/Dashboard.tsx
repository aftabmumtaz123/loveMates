import {useEffect,useMemo,useState} from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import {ArrowUpRight,CalendarDays,Check,CheckCircle2,Copy,Heart,Image,BookHeart,Cake,MessageCircle,Sparkles,Smile,Gift,Send,RefreshCw} from 'lucide-react';
import {api,errorMessage} from '../lib/api';
import type {Bucket,DatePlan,Journal,Memory} from '../types';
import {useAuth} from '../main';

function birthdayInfo(month?:number,day?:number){if(!month||!day)return null;const now=new Date();const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());let target=new Date(now.getFullYear(),month-1,day);if(target<today)target=new Date(now.getFullYear()+1,month-1,day);return Math.round((target.getTime()-today.getTime())/86400000)}
function loveDuration(startValue?:string, nowValue=new Date()){
  if(!startValue)return null;

  const start=new Date(startValue);
  const now=new Date(nowValue);

  if(Number.isNaN(start.getTime())||Number.isNaN(now.getTime())||start>now)return null;

  // All instant-based units are calculated from the exact stored timestamp.
  // This prevents the old "20 days" result caused by calendar-component math.
  const elapsedMs=now.getTime()-start.getTime();
  const totalSeconds=Math.floor(elapsedMs/1000);
  const totalMinutes=Math.floor(totalSeconds/60);
  const totalHours=Math.floor(totalMinutes/60);
  const totalDays=Math.floor(totalHours/24);

  // Calendar-aware completed months/years, while preserving the exact time.
  let years=now.getFullYear()-start.getFullYear();
  let months=years*12+(now.getMonth()-start.getMonth());

  const anniversary=new Date(start);
  anniversary.setFullYear(start.getFullYear()+years);
  anniversary.setMonth(start.getMonth());

  if(anniversary>now){
    years-=1;
    months-=12;
  }

  const monthAnchor=new Date(start);
  monthAnchor.setFullYear(start.getFullYear());
  monthAnchor.setMonth(start.getMonth()+months);

  if(monthAnchor>now)months-=1;

  return {
    years:Math.max(0,years),
    months:Math.max(0,months),
    days:totalDays,
    hours:totalHours,
    minutes:totalMinutes,
    seconds:totalSeconds,
    totalDays,
    totalMinutes,
    totalSeconds
  };
}

export default function Dashboard(){
  const {user,couple,refresh}=useAuth();
  const [data,setData]=useState<{memories:Memory[];bucket:Bucket[];dates:DatePlan[];journal:Journal[]}>({memories:[],bucket:[],dates:[],journal:[]});
  const [rituals,setRituals]=useState<any>({question:'What is one little thing your partner did recently that made you smile?',moods:[],answers:[],loveNotes:[]});
  const [answer,setAnswer]=useState('');const [note,setNote]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [copied,setCopied]=useState(false);
  const load=()=>Promise.all(['/memories','/bucket-list','/dates','/journal','/rituals'].map(x=>api.get(x))).then(([m,b,d,j,r])=>{setData({memories:m.data,bucket:b.data,dates:d.data,journal:j.data});setRituals(r.data)}).catch(e=>setError(errorMessage(e)));
  useEffect(()=>{void load()},[]);
  const upcoming=data.dates.filter(x=>new Date(x.date)>=new Date()).sort((a,b)=>+new Date(a.date)-+new Date(b.date))[0];
  const partnerDays=birthdayInfo(couple?.partner?.birthMonth,couple?.partner?.birthDay);const birthday=partnerDays!==null&&partnerDays<=7?partnerDays:null;
  const [timerUnit,setTimerUnit]=useState<'years'|'months'|'days'|'minutes'|'seconds'>('days');const [now,setNow]=useState(new Date());useEffect(()=>{const id=window.setInterval(()=>setNow(new Date()),1000);return()=>window.clearInterval(id)},[]);const together=loveDuration((couple?.fellInLoveAt||couple?.anniversary) as any,now);
  const bucketDone=data.bucket.filter(x=>x.done).length;
  const latestMemory=data.memories[0];
  const copy=async()=>{if(!couple?.inviteCode)return;navigator.clipboard?.writeText(couple.inviteCode);setCopied(true);setTimeout(()=>setCopied(false),1600)};
  const [partnerBusy,setPartnerBusy]=useState(false);
  const respondToPartner=async(action:'accept'|'reject')=>{const id=couple?.pendingPartnerRequest?.id;if(!id)return;setPartnerBusy(true);setError('');try{const r=await api.post(`/couple/requests/${id}/${action}`);setError(action==='accept'?r.data.message:'');await refresh()}catch(e){setError(errorMessage(e))}finally{setPartnerBusy(false)}};
  const sendAnswer=async()=>{if(!answer.trim())return;setBusy(true);try{await api.post('/rituals/answer',{questionKey:rituals.question,answer});setAnswer('');await load()}catch(e){setError(errorMessage(e))}finally{setBusy(false)}};
  const addNote=async()=>{if(!note.trim())return;setBusy(true);try{await api.post('/rituals/love-note',{body:note});setNote('');await load()}catch(e){setError(errorMessage(e))}finally{setBusy(false)}};
  const pickMood=async(mood:string)=>{try{await api.post('/rituals/mood',{mood});await load()}catch(e){setError(errorMessage(e))}};
  const myMood=rituals.moods?.find((x:any)=>String(x.userId?._id||x.userId)===user?.id)?.mood;
  const partnerMood=rituals.moods?.find((x:any)=>String(x.userId?._id||x.userId)!==user?.id)?.mood;
  const randomNote=useMemo(()=>{const a=rituals.loveNotes||[];return a.length?a[Math.floor(Math.random()*a.length)]:null},[rituals.loveNotes]);
  return <div className="space-y-7">
    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="eyebrow">{new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</p><h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Good {new Date().getHours()<12?'morning':new Date().getHours()<18?'afternoon':'evening'}, {user?.name?.split(' ')[0]} <span className="text-rose-400">♥</span></h1><p className="mt-2 text-slate-500">Welcome back to <b className="text-slate-700">{couple?.name}</b>.</p></div><button onClick={copy} className="btn-secondary">{copied?<Check size={16}/>:<Copy size={16}/>} {copied?'Copied':'Share invite code'}</button></div>

    {birthday!==null&&<motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="rounded-[1.6rem] border border-rose-200 bg-gradient-to-r from-rose-100 via-fuchsia-50 to-violet-100 p-5"><div className="flex items-center gap-3"><div className="grid size-12 place-items-center rounded-2xl bg-white/80 text-2xl">🎂</div><div><p className="text-xs font-bold uppercase tracking-[.15em] text-rose-500">Birthday countdown</p><p className="mt-1 font-display text-xl font-bold">{birthday===0?`Today is ${couple?.partner?.name}'s birthday! 🎉`:birthday===1?`Tomorrow is ${couple?.partner?.name}'s birthday! 💕`:`${couple?.partner?.name}'s birthday is in ${birthday} days! ✨`}</p></div></div></motion.div>}

    {couple?.pendingPartnerRequest&&<motion.section initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="rounded-[1.6rem] border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-rose-50 p-5 shadow-sm"><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><div className="flex items-center gap-3"><div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white text-rose-400 shadow-sm">{couple.pendingPartnerRequest.requesterProfilePicture?<img src={couple.pendingPartnerRequest.requesterProfilePicture} className="size-full object-cover"/>:<Heart fill="currentColor" size={21}/>}</div><div><p className="text-xs font-bold uppercase tracking-[.15em] text-amber-600">Partner request</p><h2 className="mt-1 font-display text-xl font-bold">{couple.pendingPartnerRequest.requesterName} wants to connect ♥</h2><p className="mt-1 text-sm text-slate-500">{couple.pendingPartnerRequest.requesterEmail} entered your partner code. You decide whether to accept.</p></div></div><div className="flex shrink-0 gap-2 sm:ml-auto"><button disabled={partnerBusy} onClick={()=>respondToPartner('reject')} className="btn-secondary">Decline</button><button disabled={partnerBusy} onClick={()=>respondToPartner('accept')} className="btn-primary">{partnerBusy?'Working…':'Accept & connect'}</button></div></div></motion.section>}

    {couple?.outgoingPartnerRequest&&<motion.section initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="rounded-[1.6rem] border border-amber-200 bg-amber-50/70 p-5"><div className="flex items-center gap-3"><div className="grid size-12 place-items-center rounded-2xl bg-white text-amber-500"><Heart size={20} fill="currentColor"/></div><div><p className="text-xs font-bold uppercase tracking-[.15em] text-amber-600">Waiting for confirmation</p><h2 className="mt-1 font-display text-xl font-bold">Your request to {couple.outgoingPartnerRequest.recipientName} is pending</h2><p className="mt-1 text-sm text-slate-500">We emailed {couple.outgoingPartnerRequest.recipientEmail}. They must accept it from their dashboard before you become partners.</p></div></div></motion.section>}

    <section className="relative overflow-hidden rounded-[2rem] border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-fuchsia-50 p-6 shadow-[0_20px_60px_rgba(244,63,94,.08)] md:p-8"><div className="absolute -right-16 -top-16 size-48 rounded-full bg-rose-100/50 blur-3xl"/><div className="relative flex flex-col items-center text-center"><div className="flex items-center -space-x-4">{couple?.partner?.profilePicture?<img src={couple.partner.profilePicture} className="size-20 rounded-full border-4 border-white object-cover shadow-lg"/>:<div className="grid size-20 place-items-center rounded-full border-4 border-white bg-rose-100 text-3xl shadow-lg">♥</div>}<div className="grid size-11 place-items-center rounded-full border-4 border-white bg-white text-rose-500 shadow-md z-10"><Heart size={17} fill="currentColor"/></div>{user?.profilePicture?<img src={user.profilePicture} className="size-20 rounded-full border-4 border-white object-cover shadow-lg"/>:<div className="grid size-20 place-items-center rounded-full border-4 border-white bg-fuchsia-100 text-3xl shadow-lg">♥</div>}</div><h2 className="mt-5 font-display text-2xl font-bold md:text-3xl">{user?.name} & {couple?.partner?.name||'Your partner'}</h2>{together!==null&&<><div className="mt-2 flex items-end gap-2"><span className="font-display text-5xl font-bold text-rose-400 tabular-nums md:text-6xl">{together[timerUnit].toLocaleString()}</span><span className="mb-2 font-display text-lg italic capitalize text-slate-500">{timerUnit}</span></div><div className="mt-3 flex flex-wrap justify-center gap-2">{(['days','years','months','minutes','seconds'] as const).map(unit=><button key={unit} onClick={()=>setTimerUnit(unit)} className={`pill ${timerUnit===unit?'border-rose-300 bg-rose-50 text-rose-500':''}`}>{unit}</button>)}</div><p className="mt-3 text-sm italic text-slate-400">together since {new Date(couple!.fellInLoveAt||couple!.anniversary!).toLocaleString(undefined,{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'})}</p></>}<p className="mt-5 max-w-xl font-display text-lg italic text-slate-500">“{(couple as any)?.coverQuote||'Together is a wonderful place to be.'}”</p></div></section>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat icon={<Image/>} label="Memories" value={data.memories.length} to="/memories"/><Stat icon={<CheckCircle2/>} label="Dreams completed" value={`${bucketDone}/${data.bucket.length}`} to="/bucket-list"/><Stat icon={<CalendarDays/>} label="Next date" value={upcoming?new Date(upcoming.date).toLocaleDateString(undefined,{month:'short',day:'numeric'}):'Plan one'} to="/dates"/><Stat icon={<BookHeart/>} label="Journal entries" value={data.journal.length} to="/journal"/></div>

    <section><div className="flex items-end justify-between"><div><p className="eyebrow">DAILY RITUALS</p><h2 className="font-display text-2xl font-bold">Little ways to stay close</h2></div><button onClick={()=>load()} className="icon-btn" title="Refresh"><RefreshCw size={17}/></button></div><div className="mt-4 grid gap-4 lg:grid-cols-3">
      <div className="card bg-violet-50/50"><div className="flex items-center gap-3"><span className="text-3xl">💬</span><div><h3 className="font-semibold">Daily Q&A</h3><p className="text-xs text-slate-400">Share your thought</p></div></div><p className="mt-4 font-display text-lg leading-7 text-slate-700">{rituals.question}</p><textarea value={answer} onChange={e=>setAnswer(e.target.value)} className="input mt-3 min-h-20 resize-none bg-white/80" placeholder="Your answer…"/><button disabled={busy||!answer.trim()} onClick={sendAnswer} className="btn-primary mt-3 w-full"><Send size={15}/> Share answer</button>{rituals.answers?.length>0&&<p className="mt-3 text-xs text-slate-400">{rituals.answers.length} answer{rituals.answers.length>1?'s':''} shared today</p>}</div>
      <div className="card bg-orange-50/50"><div className="flex items-center gap-3"><span className="text-3xl">😊</span><div><h3 className="font-semibold">Mood Check</h3><p className="text-xs text-slate-400">How are you both?</p></div></div><div className="mt-5 flex justify-between gap-2">{['🥰','😊','😌','🥹','😴','😵'].map(m=><button key={m} onClick={()=>pickMood(m)} className={`grid size-10 place-items-center rounded-xl border bg-white text-xl transition hover:-translate-y-1 ${myMood===m?'border-rose-300 ring-2 ring-rose-100':''}`}>{m}</button>)}</div><div className="mt-5 rounded-2xl bg-white/70 p-4 text-sm"><p className="text-slate-400">Your mood <b className="text-slate-700">{myMood||'—'}</b></p><p className="mt-2 text-slate-400">Partner mood <b className="text-slate-700">{partnerMood||'Not checked yet'}</b></p></div></div>
      <div className="card bg-amber-50/50"><div className="flex items-center gap-3"><span className="text-3xl">🫙</span><div><h3 className="font-semibold">Love Jar</h3><p className="text-xs text-slate-400">Pick a little note</p></div></div><div className="mt-4 min-h-24 rounded-2xl bg-white/70 p-4 text-center"><p className="font-display text-lg italic text-slate-600">{randomNote?`“${randomNote.body}”`:'Add a sweet note and keep it for later.'}</p></div><div className="mt-3 flex gap-2"><input value={note} onChange={e=>setNote(e.target.value)} className="input bg-white/80" placeholder="Write a love note…"/><button disabled={busy||!note.trim()} onClick={addNote} className="btn-primary shrink-0 px-4"><Gift size={16}/></button></div></div>
    </div></section>

    {error&&<div className="alert-error">{error}</div>}
    <div className="grid gap-5 lg:grid-cols-2"><section className="card"><div className="flex items-center justify-between"><div><p className="eyebrow">LATEST MEMORY</p><h2 className="font-display text-xl font-bold">A little moment</h2></div><Link to="/memories" className="icon-btn"><ArrowUpRight size={17}/></Link></div>{latestMemory?<div className="mt-4 flex gap-4">{latestMemory.imageUrl?<img src={latestMemory.imageUrl} className="size-24 rounded-2xl object-cover"/>:<div className="grid size-24 shrink-0 place-items-center rounded-2xl bg-rose-50 text-3xl">{latestMemory.emoji}</div>}<div><h3 className="font-semibold">{latestMemory.title}</h3><p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-500">{latestMemory.story||'No words needed.'}</p></div></div>:<p className="mt-4 text-sm text-slate-400">Your first memory is waiting to be added.</p>}</section><section className="card"><div className="flex items-center justify-between"><div><p className="eyebrow">STAY CONNECTED</p><h2 className="font-display text-xl font-bold">Send a message</h2></div><MessageCircle className="text-rose-300"/></div><p className="mt-3 text-sm leading-6 text-slate-500">Chat without sockets. CoupleNest checks for new messages automatically every few seconds.</p><Link to="/messages" className="btn-primary mt-4">Open our chat</Link></section></div>
  </div>
}
function Stat({icon,label,value,to}:{icon:React.ReactNode;label:string;value:React.ReactNode;to:string}){return <Link to={to} className="stat-card"><span className="icon-square tone-0">{icon}</span><span className="min-w-0"><span className="block text-xs font-semibold text-slate-400">{label}</span><span className="mt-1 block truncate text-lg font-bold">{value}</span></span></Link>}
