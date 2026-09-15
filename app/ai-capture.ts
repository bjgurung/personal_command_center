import {uid} from './model';
import {validDate,type CaptureDraft} from './capture-model';
export function aiDraft(raw:Record<string,string>,account:string,scope:string):CaptureDraft[]{
 const warnings=['AI draft: verify all fields and select Include draft.'];
 let amount=/^\d+(\.\d{1,2})?$/.test(raw.amount)&&Number.isSafeInteger(Math.round(Number(raw.amount)*100))?raw.amount:'';
 if(raw.currency!=='USD'){amount='';warnings.push('Currency is missing or not USD. Enter the USD amount manually; no conversion was performed.');}
 const date=validDate(raw.date)?raw.date:'';
 if(!date)warnings.push('Choose the actual purchase date.');
 if(raw.warning)warnings.push(raw.warning);
 if(/product|listing|quote|invoice/i.test(raw.documentType)){warnings.push('Not proof of payment. Verify the purchase before recording.');}
 const parts=[raw.subtotal,raw.tax,raw.tip];
 if(parts.every(p=>/^\d+(\.\d{1,2})?$/.test(p))&&amount&&Math.abs(parts.reduce((n,p)=>n+Math.round(Number(p)*100),0)-Math.round(Number(amount)*100))>1)warnings.push('Subtotal, tax and tip do not match total. Review discounts, fees and amount.');
 return [{id:uid(),vendor:raw.merchant.slice(0,140),date,amount,account,scope,kind:scope==='Business'?'Business':'Need',category:'Other',type:'Transaction',include:false,warning:warnings.join(' ')}];
}
