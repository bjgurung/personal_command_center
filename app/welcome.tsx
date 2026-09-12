'use client';
import './welcome.css';
import {Leaf,ArrowRight,Target} from 'lucide-react';
import {active,billOccurrence,type State} from './model';
import {unassignedCount} from './scope-model';
export function welcomeHighlight(state:State,today:string,month:string,ready:boolean,needsAssignment:boolean){
 if(!ready)return {text:'Your workspace is opening. Your records will appear here shortly.',page:'',label:''};
 if(needsAssignment)return {text:'Some records still need a Personal or Business assignment.',page:'Settings',label:'Review your setup'};
 const count=active(state).filter(t=>t.review&&t.date.startsWith(month)).length;
 if(count)return {text:`${count} transaction${count===1?' needs':'s need'} review for ${month}.`,page:'Transactions',label:'Review transactions'};
 const end=new Date(today+'T12:00:00Z');end.setUTCDate(end.getUTCDate()+7);
 const months=[month];
 const due=months.flatMap(m=>state.bills.filter(b=>!b.paid.includes(m)&&!b.skipped?.includes(m)).map(b=>billOccurrence(b,m))).filter(b=>b.date>=today&&b.date<end.toISOString().slice(0,10)).length;
 if(due)return {text:`${due} recorded bill${due===1?' is':'s are'} due in the next seven days.`,page:'Calendar',label:'See upcoming bills'};
 if(!active(state).length)return {text:'Start with an account balance or your first entry.',page:'Settings',label:'Set up your workspace'};
 return {text:'Take a moment to see where your money is going.',page:'Insights',label:'Explore your insights'};
}
export function Welcome({state,fullState,today,month,ready,onNavigate}:{state:State,fullState:State,today:string,month:string,ready:boolean,onNavigate:(page:string,review?:boolean)=>void}){
 const hour=Number(new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'numeric',hourCycle:'h23'}).format(new Date()));
 const greeting=hour<12?'Good morning':hour<18?'Good afternoon':'Good evening';
 const highlight=welcomeHighlight(state,today,month,ready,unassignedCount(fullState)>0);
 return <section className="home-welcome"><div><p className="welcome-eyebrow">A moment for your money</p><h2>{greeting}, {state.settings.name||'there'}.</h2><p>{highlight.text}</p>{highlight.page&&<button className="text-action" onClick={()=>onNavigate(highlight.page,highlight.page==='Transactions')}>{highlight.label}<ArrowRight size={15}/></button>}</div><span className="welcome-leaf" aria-hidden="true"><Leaf size={60} strokeWidth={1}/></span></section>;
}
export function GoalMoment({name,onClose}:{name:string,onClose:()=>void}){return <div className="goal-moment" role="status"><Target aria-hidden="true"/><span><strong>Goal reached</strong><br/>{name} is fully funded in your records.</span><button aria-label="Dismiss goal celebration" onClick={onClose}>×</button></div>}
