import {motion,AnimatePresence} from 'framer-motion';
import {AlertTriangle,X} from 'lucide-react';

export default function ConfirmDialog({open,title,message,confirmLabel='Confirm',danger=false,onConfirm,onCancel,busy=false}:{open:boolean;title:string;message:string;confirmLabel?:string;danger?:boolean;onConfirm:()=>void;onCancel:()=>void;busy?:boolean}){
 return <AnimatePresence>{open&&<div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={e=>e.target===e.currentTarget&&!busy&&onCancel()}>
  <motion.div role="dialog" aria-modal="true" initial={{opacity:0,scale:.96,y:12}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.96,y:12}} className="modal-surface w-full max-w-md overflow-hidden rounded-[2rem] border border-white/70 bg-white p-6 shadow-2xl">
   <div className="flex items-start gap-4"><div className={`grid size-12 shrink-0 place-items-center rounded-2xl ${danger?'bg-rose-50 text-rose-500':'bg-violet-50 text-violet-500'}`}><AlertTriangle size={22}/></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><h2 className="font-display text-2xl font-bold text-slate-800">{title}</h2><button disabled={busy} onClick={onCancel} className="icon-btn -mr-2 -mt-2"><X size={18}/></button></div><p className="mt-2 text-sm leading-6 text-slate-500">{message}</p></div></div>
   <div className="mt-7 flex justify-end gap-3"><button disabled={busy} onClick={onCancel} className="btn-secondary">Cancel</button><button disabled={busy} onClick={onConfirm} className={danger?'inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-700 disabled:opacity-60':'btn-primary'}>{busy?'Please wait…':confirmLabel}</button></div>
  </motion.div>
 </div>}</AnimatePresence>
}
