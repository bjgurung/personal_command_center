import {uid} from './model';
import {validDate,type CaptureDraft} from './capture-model';
export function aiDraft(raw:Record<string,string>,account:string,scope:string):CaptureDraft[]{
 const warnings=['AI draft: verify all fields and select Include draft.'];
 const normalized=raw.amount.trim().replace(/^(?:USD|US\$|\$)\s*/i,'').replace(/(?<=\d),(?=\d{3}(?:,|\.|$))/g,'');
 let amount=/^\d+(\.\d{1,2})?$/.test(normalized)&&Number.isSafeInteger(Math.round(Number(normalized)*100))?normalized:'';
 const currency=raw.currency.trim().toUpperCase();
 if(!currency){warnings.push('Currency was not detected. Confirm USD below before saving.');}
 else if(currency!=='USD'){warnings.push(`Detected ${raw.amount} ${currency}. Enter the converted USD amount and select USD below; no conversion was performed.`);amount='';}
 if(!amount)warnings.push('A usable USD total was not available. Review the receipt and enter the amount.');
 const date=validDate(raw.date)?raw.date:'';
 if(!date)warnings.push('Choose the actual purchase date.');
 if(raw.warning)warnings.push(raw.warning);
 if(/product|listing|quote|invoice/i.test(raw.documentType)){warnings.push('Not proof of payment. Verify the purchase before recording.');}
 const parts=[raw.subtotal,raw.tax,raw.tip];
 if(parts.every(p=>/^\d+(\.\d{1,2})?$/.test(p))&&amount&&Math.abs(parts.reduce((n,p)=>n+Math.round(Number(p)*100),0)-Math.round(Number(amount)*100))>1)warnings.push('Subtotal, tax and tip do not match total. Review discounts, fees and amount.');
 return [{id:uid(),vendor:raw.merchant.slice(0,140),date,amount,currency:currency||'Unknown',account,scope,kind:scope==='Business'?'Business':'Need',category:'Other',type:'Transaction',include:false,warning:warnings.join(' ')}];
}
