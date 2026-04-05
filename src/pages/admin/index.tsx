import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Admin() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin/login");
  }, [status]);

  if (status === "loading") return <div style={{padding:"40px",fontFamily:"Inter,sans-serif"}}>Chargement…</div>;
  if (!session) return null;

  return (
    <div style={{minHeight:"100vh",background:"#1a2744",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Inter,sans-serif"}}>
      <div style={{background:"#fff",padding:"48px",borderRadius:"6px",textAlign:"center"}}>
        <div style={{fontFamily:"Barlow Condensed,sans-serif",fontSize:"42px",fontWeight:"800",color:"#1a2744"}}>
          SIT<span style={{color:"#c0392b"}}>REP</span>
        </div>
        <div style={{fontSize:"13px",color:"#7a7468",margin:"16px 0"}}>
          Connecté en tant que <strong>{session.user?.email}</strong>
        </div>
        <div style={{fontSize:"13px",color:"#2e6e48",marginBottom:"24px"}}>✅ Backoffice en construction…</div>
        <button onClick={() => signOut()} style={{background:"#c0392b",color:"#fff",border:"none",padding:"10px 24px",fontFamily:"Inter,sans-serif",fontSize:"12px",fontWeight:"700",cursor:"pointer",borderRadius:"4px"}}>
          Déconnexion
        </button>
      </div>
    </div>
  );
}
