import {active,accountCash,metrics,type State,type Transaction} from './model';
export type Scope='All'|'Personal'|'Business';
export function transactionScope(s:State,t:Transaction):Exclude<Scope,'All'>|undefined {
 if(t.scope)return t.scope;
 const account=s.accounts?.find(a=>a.name===t.account);
 return account?.scope==='Personal'||account?.scope==='Business'?account.scope:undefined;
}
export function scopedState(s:State,scope:Scope):State{
 if(scope==='All')return s;
 const accounts=(s.accounts||[]).filter(a=>a.scope===scope),names=new Set(accounts.map(a=>a.name));
 return {...s,accounts,transactions:s.transactions.filter(t=>t.kind==='Transfer'?(names.has(t.account)||names.has(t.toAccount||'')):transactionScope(s,t)===scope),bills:s.bills.filter(b=>b.scope===scope),goals:s.goals.filter(g=>g.scope===scope),expectedIncome:s.expectedIncome?.filter(i=>i.scope===scope),invoices:scope==='Business'?s.invoices:[],clients:scope==='Business'?s.clients:[],proposals:scope==='Business'?s.proposals:[],settings:{...s.settings,openingCash:0,liquidSavings:0}};
}
export function scopedMetrics(s:State,scope:Scope,month:string,asOf?:string){
 const view=scopedState(s,scope),base=metrics(view,month),end=asOf||month+'-'+new Date(Number(month.slice(0,4)),Number(month.slice(5)),0).getDate();
 const accounts=(view.accounts||[]).filter(a=>a.date<=end);
 const cash=accounts.length?accountCash({...s,accounts},end):scope==='All'&&!s.accounts?.length?base.cash:null;
 // Spending-based runway: three completed months, excluding transfers and savings allocations.
 const months=Array.from({length:3},(_,i)=>{const d=new Date(Number(month.slice(0,4)),Number(month.slice(5))-2-i,1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`});
 const expenses=active(view).filter(t=>months.includes(t.date.slice(0,7))).reduce((n,t)=>n+(['Need','Want','Business'].includes(t.kind)?t.amount:t.kind==='Refund'?-t.amount:0),0);
 const burn=Math.max(0,expenses/3);
 return {...base,cash,runway:cash!==null&&burn>0?Math.max(0,cash)/burn:null,burn};
}
export function unassignedCount(s:State){return active(s).filter(t=>t.kind!=='Transfer'&&!transactionScope(s,t)).length+s.bills.filter(b=>!b.scope).length+s.goals.filter(g=>!g.scope).length+(s.expectedIncome||[]).filter(i=>!i.scope).length;}
// A filtered editor must never overwrite hidden records in the full workspace.
export function mergeScopedState(full:State,before:State,next:State):State{
 const merge=<T extends {id:string}>(all:T[],visible:T[],edited:T[])=>[...all.filter(x=>!visible.some(v=>v.id===x.id)&&!edited.some(v=>v.id===x.id)),...edited];
 return {...full,bills:merge(full.bills,before.bills,next.bills),goals:merge(full.goals,before.goals,next.goals),expectedIncome:merge(full.expectedIncome||[],before.expectedIncome||[],next.expectedIncome||[]),transactions:merge(full.transactions,before.transactions,next.transactions),insightPreferences:next.insightPreferences};
}
