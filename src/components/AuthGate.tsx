import {Navigate} from 'react-router-dom';import {useAuth} from '../main';
export default function AuthGate({children}:{children:React.ReactNode}){const {user,loading}=useAuth();if(loading)return <div className="min-h-screen grid place-items-center bg-[#fff8fb]"><div className="heart-loader">♥</div></div>;return user?<>{children}</>:<Navigate to="/login" replace/>}
