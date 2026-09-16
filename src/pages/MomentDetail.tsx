import {useEffect,useState} from 'react';
import {ArrowLeft,CalendarDays,Heart,MessageCircle,Send,Smile,Trash2} from 'lucide-react';
import {Link,useNavigate,useParams} from 'react-router-dom';
import {api,errorMessage} from '../lib/api';
import ConfirmDialog from '../components/ConfirmDialog';
import type {Memory,MemoryComment} from '../types';
import {useAuth} from '../main';

const REACTIONS=[['like','👍','Like'],['love','❤️','Love'],['haha','😂','Haha'],['wow','😮','Wow'],['sad','😢','Sad'],['angry','😡','Angry']] as const;

export default function MomentDetail(){
 const {id=''}=useParams(); const nav=useNavigate(); const {user}=useAuth();
 const [galleryIndex,setGalleryIndex]=useState(0); const [memory,setMemory]=useState<Memory|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[commentText,setCommentText]=useState(''),[showReactions,setShowReactions]=useState(false),[busy,setBusy]=useState(false);
 const load=async()=>{setLoading(true);setError('');try{const r=await api.get('/memories/'+id);setMemory(r.data)}catch(e){setError(errorMessage(e))}finally{setLoading(false)}};
 useEffect(()=>{void load()},[id]);
 const react=async(reaction:string)=>{try{if(memory?.myReaction===reaction) await api.delete('/memories/'+id+'/reaction'); else await api.put('/memories/'+id+'/reaction',{reaction}); await load();setShowReactions(false)}catch(e){setError(errorMessage(e))}};
 const comment=async(e:React.FormEvent<HTMLFormElement>)=>{e.preventDefault();if(!commentText.trim())return;const form=e.currentTarget;setBusy(true);try{const r=await api.post('/memories/'+id+'/comments',{body:commentText});setMemory(m=>m?{...m,comments:[...(m.comments||[]),r.data]}:m);setCommentText('');form.reset()}catch(e){setError(errorMessage(e))}finally{setBusy(false)}};
 const [confirmDelete,setConfirmDelete]=useState(false); const del=async()=>{if(!memory)return;try{await api.delete('/memories/'+id);nav('/memories')}catch(e){setError(errorMessage(e))}};
 if(loading)return <div className="card p-12 text-center text-sm text-slate-400">♥ Opening your moment…</div>;
 if(error||!memory)return <div><Link to="/memories" className="btn-secondary"><ArrowLeft size={16}/> Back to moments</Link><div className="alert-error mt-5">{error||'Moment not found.'}</div></div>;
 const gallery=(memory.imageUrls&&memory.imageUrls.length?memory.imageUrls:[memory.imageUrl].filter(Boolean)) as string[]; const activeImage=gallery[galleryIndex]||memory.imageUrl; const counts=memory.reactionCounts||{}; const total=Object.values(counts).reduce((a,b)=>a+b,0); const creatorId=String(memory.createdBy); const isCreator=user?.id===creatorId;
 return <div>
   <Link to="/memories" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-rose-500"><ArrowLeft size={17}/> Back to moments</Link>
   {error&&<div className="alert-error mb-5">{error}</div>}
   <div className="overflow-hidden rounded-[2rem] border border-rose-100 bg-white shadow-[0_24px_70px_rgba(244,63,94,.10)] lg:h-[calc(100vh-9rem)] lg:min-h-[620px]">
    <div className="grid h-full lg:grid-cols-[minmax(0,1.35fr)_minmax(360px,.85fr)]">
      <section className="relative flex min-h-[360px] items-center justify-center overflow-hidden bg-slate-950">
        {activeImage?<><img src={activeImage} className="h-full max-h-[calc(100vh-9rem)] w-full object-contain"/>{gallery.length>1&&<div className="absolute left-1/2 top-5 flex -translate-x-1/2 gap-2 rounded-2xl bg-black/35 p-2 backdrop-blur">{gallery.map((src,i)=><button key={src+i} onClick={()=>setGalleryIndex(i)} className={`size-12 overflow-hidden rounded-xl border-2 ${i===galleryIndex?'border-white':'border-transparent opacity-70'}`}><img src={src} className="h-full w-full object-cover"/></button>)}</div>}</> :<div className="flex h-full min-h-[360px] w-full items-center justify-center bg-gradient-to-br from-rose-50 via-white to-violet-50 text-7xl">{memory.emoji}</div>}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-6 pt-20 text-white">
          <div className="flex items-center gap-3"><Avatar src={memory.createdByUser?.profilePicture}/><div><p className="text-sm font-semibold">{memory.createdByUser?.name||'Your partner'}</p><p className="text-xs text-white/70">Uploaded this moment</p></div></div>
          <h1 className="mt-4 font-display text-3xl font-bold">{memory.title}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-white/75"><CalendarDays size={15}/>{new Date(memory.happenedAt).toLocaleDateString(undefined,{dateStyle:'medium'})}</div>
          {memory.story&&<p className="mt-3 max-w-2xl whitespace-pre-line text-sm leading-6 text-white/85">{memory.story}</p>}
        </div>
        {isCreator&&<button onClick={()=>setConfirmDelete(true)} className="absolute right-5 top-5 rounded-xl bg-white/90 p-2 text-slate-400 shadow-lg transition hover:text-rose-500" title="Delete moment"><Trash2 size={17}/></button>}
      </section>
      <aside className="flex min-h-0 flex-col border-t border-slate-100 bg-white lg:border-l lg:border-t-0">
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-center justify-between"><div><p className="eyebrow">MOMENT REACTIONS</p><p className="mt-1 text-sm font-semibold text-slate-700">{total} {total===1?'reaction':'reactions'} · {memory.comments?.length||0} {memory.comments?.length===1?'comment':'comments'}</p></div><div className="relative"><button onClick={()=>setShowReactions(v=>!v)} className={`btn-secondary ${memory.myReaction?'text-rose-500':''}`}><Smile size={16}/>{memory.myReaction?REACTIONS.find(x=>x[0]===memory.myReaction)?.[2]:'React'}</button>{showReactions&&<div className="absolute right-0 top-12 z-30 flex gap-1 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">{REACTIONS.map(([r,e,label])=><button key={r} title={label} onClick={()=>void react(r)} className="grid size-9 place-items-center rounded-xl text-lg hover:bg-rose-50">{e}</button>)}</div>}</div></div>
          <div className="mt-3 flex flex-wrap gap-2">{REACTIONS.filter(([r])=>counts[r]).map(([r,e,label])=><span key={r} className="rounded-full bg-slate-50 px-3 py-1.5 text-xs text-slate-500">{e} {counts[r]} {label}</span>)}</div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="mb-4 flex items-center gap-2"><MessageCircle size={17} className="text-rose-400"/><h2 className="font-display text-xl font-bold">Comments</h2></div>
          {!memory.comments?.length?<div className="rounded-2xl bg-rose-50/60 p-6 text-center text-sm text-slate-400">No comments yet. Start the conversation ♥</div>:<div className="space-y-4">{memory.comments.map((c:MemoryComment)=><Comment key={c.id} comment={c} isPostCreator={String(c.user.id)===creatorId}/>)}</div>}
        </div>
        <form onSubmit={comment} className="border-t border-slate-100 bg-white p-4"><div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-rose-300 focus-within:bg-white"><textarea value={commentText} onChange={e=>setCommentText(e.target.value)} className="max-h-28 min-h-11 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none" placeholder="Write a comment…" rows={1} disabled={busy}/><button disabled={busy||!commentText.trim()} className="grid size-10 shrink-0 place-items-center rounded-xl bg-rose-500 text-white shadow-sm disabled:opacity-40"><Send size={16}/></button></div><p className="mt-2 px-2 text-[11px] text-slate-400">The moment creator's comments appear on the right, partner comments on the left.</p></form>
      </aside>
    </div>
   </div>
   <ConfirmDialog open={confirmDelete} title="Delete this moment?" message="This moment, its reactions and comments will be permanently removed." confirmLabel="Delete moment" danger onCancel={()=>setConfirmDelete(false)} onConfirm={()=>void del()}/>
 </div>
}
function Comment({ comment, isPostCreator }: { comment: MemoryComment; isPostCreator: boolean }) {
  return (
    <div className={`flex gap-2 ${isPostCreator ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[88%] gap-2 ${isPostCreator ? 'flex-row-reverse' : ''}`}>
        <Avatar src={comment.user.profilePicture} small />
        <div className={isPostCreator ? 'items-end' : ''}>
          <div
            className={`rounded-2xl px-3.5 py-2.5 ${
              isPostCreator
                ? 'rounded-tr-md bg-rose-500 text-white'
                : 'rounded-tl-md bg-slate-100 text-slate-700'
            }`}
          >
            <p className={`text-[11px] font-bold ${isPostCreator ? 'text-white/80' : 'text-slate-500'}`}>
              {comment.user.name}{isPostCreator ? ' · Creator' : ''}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-5">{comment.body}</p>
          </div>
          <p className={`mt-1 px-1 text-[10px] text-slate-400 ${isPostCreator ? 'text-right' : ''}`}>
            {new Date(comment.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
}

function Avatar({ src, small = false }: { src?: string; small?: boolean }) {
  if (src) {
    return <img src={src} alt="" className={`${small ? 'size-8' : 'size-10'} shrink-0 rounded-xl object-cover`} />;
  }

  return (
    <div className={`grid ${small ? 'size-8' : 'size-10'} shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-400`}>
      <Heart size={small ? 13 : 16} fill="currentColor" />
    </div>
  );
}
