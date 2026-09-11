'use client';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Leaf, LockKeyhole, LogOut, Mail, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
const ALLOWED_EMAIL = 'bjungtamu@gmail.com';

export function AuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null), [ready, setReady] = useState(false), [aal2, setAal2] = useState(false);
  const [enrollment, setEnrollment] = useState<{id:string;totp?:{qr_code:string}} | null>(null), [code, setCode] = useState(''), [message, setMessage] = useState('');
  async function refresh(next?: Session | null) {
    const current = next === undefined ? (await supabase.auth.getSession()).data.session : next;
    if (current?.user.email?.toLowerCase() !== ALLOWED_EMAIL) { if (current) await supabase.auth.signOut(); setSession(null); setAal2(false); setMessage(current ? 'This workspace is restricted to the configured owner.' : ''); setReady(true); return; }
    setSession(current); setAal2(current ? (await supabase.auth.mfa.getAuthenticatorAssuranceLevel()).data?.currentLevel === 'aal2' : false); setReady(true);
  }
  useEffect(() => { void refresh(); const { data } = supabase.auth.onAuthStateChange((_event, next) => { setTimeout(() => void refresh(next), 0); }); return () => data.subscription.unsubscribe(); }, []);
  async function sendLink(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setMessage('Sending your secure sign-in link…'); const { error } = await supabase.auth.signInWithOtp({ email: ALLOWED_EMAIL, options: { emailRedirectTo: window.location.origin } }); setMessage(error ? error.message : 'Check Gmail for your sign-in link.'); }
  async function beginMfa() { setMessage(''); const factors = await supabase.auth.mfa.listFactors(); if (factors.error) return setMessage(factors.error.message); const verified = factors.data.totp.find(f => f.status === 'verified'); if (verified) { setEnrollment({ id: verified.id }); return; } const result = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Arshistudio Command Center' }); if (result.error) return setMessage(result.error.message); setEnrollment({id:result.data.id,totp:{qr_code:result.data.totp.qr_code}}); }
  async function verify(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!enrollment || !/^\d{6}$/.test(code)) return setMessage('Enter the six-digit authenticator code.'); const challenge = await supabase.auth.mfa.challenge({ factorId: enrollment.id }); if (challenge.error) return setMessage(challenge.error.message); const result = await supabase.auth.mfa.verify({ factorId: enrollment.id, challengeId: challenge.data.id, code }); if (result.error) return setMessage(result.error.message); await refresh(); }
  if (!ready) return <AuthShell><p>Opening your private workspace…</p></AuthShell>;
  if (!session) return <AuthShell><form onSubmit={sendLink} className="auth-form"><Mail/><h1>Welcome to Arshistudio</h1><p>Sign in with the private Gmail account configured for this command center.</p><label>Email<input value={ALLOWED_EMAIL} readOnly/></label><button className="primary">Email me a secure sign-in link</button>{message && <output>{message}</output>}</form></AuthShell>;
  if (!aal2) return <AuthShell><div className="auth-form"><ShieldCheck/><h1>Two-step verification</h1><p>Use an authenticator app to protect your financial workspace.</p>{!enrollment ? <button className="primary" onClick={beginMfa}>Set up or verify authenticator</button> : <form onSubmit={verify}>{enrollment.totp?.qr_code && <img className="mfa-qr" src={enrollment.totp.qr_code} alt="Authenticator setup QR code"/>}<label>Six-digit code<input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,''))}/></label><button className="primary">Verify and open dashboard</button></form>}{message && <output>{message}</output>}<button className="text-action" onClick={()=>supabase.auth.signOut()}><LogOut size={15}/> Sign out</button></div></AuthShell>;
  return <><button className="session-signout" onClick={()=>supabase.auth.signOut()}>Sign out</button>{children}</>;
}
function AuthShell({children}:{children:ReactNode}) { return <main className="auth-shell"><section className="auth-card"><div className="auth-brand"><Leaf/><span>ARSHISTUDIO</span></div><LockKeyhole className="auth-lock"/>{children}</section></main>; }
