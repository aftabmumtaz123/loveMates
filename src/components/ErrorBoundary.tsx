import React from 'react';

type Props={children:React.ReactNode};
type State={error:Error|null};
export default class ErrorBoundary extends React.Component<Props,State>{
  state:State={error:null};
  static getDerivedStateFromError(error:Error){return {error};}
  componentDidCatch(error:Error,info:React.ErrorInfo){console.error('CoupleNest page error',error,info);}
  render(){
    if(this.state.error)return <div className="min-h-screen grid place-items-center bg-[#fff9fb] px-5"><div className="card max-w-lg text-center"><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-rose-50 text-2xl">💗</div><h1 className="mt-5 font-display text-2xl font-bold">This page hit a small bump</h1><p className="mt-2 text-sm leading-6 text-slate-500">The app recovered the error instead of showing a blank screen. Refresh once, and if it keeps happening open the browser console for the exact error.</p><details className="mt-4 text-left"><summary className="cursor-pointer text-xs font-semibold text-slate-500">Technical details</summary><pre className="mt-2 overflow-auto rounded-xl bg-slate-50 p-3 text-xs text-slate-600">{this.state.error.message}</pre></details><button className="btn-primary mt-5" onClick={()=>location.reload()}>Refresh CoupleNest</button></div></div>;
    return this.props.children;
  }
}
