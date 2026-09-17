import {useEffect,useState} from 'react';
import {BellRing,CheckCircle2,ShieldCheck} from 'lucide-react';
import Modal from './Modal';
import {api,errorMessage} from '../lib/api';

const DISMISS_KEY='couplenest_notification_prompt_dismissed';

export default function NotificationPrompt(){
  const [open,setOpen]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');

  useEffect(()=>{
    let cancelled=false;
    const setup=async()=>{
      if(cancelled||!('serviceWorker' in navigator)||!('PushManager' in window)||!('Notification' in window))return;
      try{
        const permission=Notification.permission;
        if(permission==='granted'){
          await subscribeAndSave();
          return;
        }
        if(permission==='denied')return;
        if(localStorage.getItem(DISMISS_KEY)==='1')return;
        const key=(await api.get('/push/public-key')).data.publicKey;
        if(!cancelled&&key)setOpen(true);
      }catch(e){
        console.error('Notification setup failed',e);
      }
    };
    const timer=window.setTimeout(()=>void setup(),800);
    return()=>{cancelled=true;window.clearTimeout(timer)};
  },[]);

  const enable=async()=>{
    setBusy(true);setError('');
    try{
      await subscribeAndSave();
      setOpen(false);
    }catch(e){setError(errorMessage(e))}
    finally{setBusy(false)}
  };

  const notNow=()=>{
    localStorage.setItem(DISMISS_KEY,'1');
    setOpen(false);
  };

  return <Modal open={open} onClose={notNow} title="Stay connected 💗">
    <div className="text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-rose-50 text-rose-500 shadow-sm">
        <BellRing size={30}/>
      </div>
      <h3 className="mt-5 font-display text-2xl font-bold">Never miss a little moment</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">Allow CoupleNest to send notifications for messages, birthdays, memories, dates, reactions and other important updates from your shared space.</p>
      <div className="mt-5 rounded-2xl bg-rose-50/70 p-4 text-left">
        <div className="flex gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-emerald-500" size={19}/><p className="text-xs leading-5 text-slate-600">Your browser creates a private push subscription and CoupleNest stores it securely so this device can receive notifications.</p></div>
      </div>
      {error&&<div className="alert-error mt-4 text-left">{error}</div>}
      <button onClick={()=>void enable()} disabled={busy} className="btn-primary mt-6 w-full justify-center"><CheckCircle2 size={17}/>{busy?'Enabling…':'Enable notifications'}</button>
      <button onClick={notNow} disabled={busy} className="mt-3 w-full text-sm font-semibold text-slate-400 hover:text-slate-600">Not now</button>
    </div>
  </Modal>;
}

async function subscribeAndSave(){
  const reg=await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;
  const key=(await api.get('/push/public-key')).data.publicKey;
  if(!key)throw new Error('Push notifications are not configured on the server yet.');
  if(Notification.permission!=='granted'){
    const permission=await Notification.requestPermission();
    if(permission!=='granted')throw new Error('Notifications were not allowed.');
  }
  const existing=await reg.pushManager.getSubscription();
  const subscription=existing||await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64(key)});
  await api.post('/push/subscribe',{subscription:subscription.toJSON()});
}

function urlBase64(s:string){
  const padding='='.repeat((4-s.length%4)%4);
  const base64=(s+padding).replace(/-/g,'+').replace(/_/g,'/');
  const raw=atob(base64);
  return Uint8Array.from([...raw].map(c=>c.charCodeAt(0)));
}
