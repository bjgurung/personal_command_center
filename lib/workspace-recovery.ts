// Supabase JSON objects may return keys in a different order than browser storage.
export function workspaceFingerprint(value:unknown):string {
 function sorted(v:unknown):unknown {
  if(Array.isArray(v))return v.map(sorted);
  if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>[k,sorted(x)]));
  return v;
 }
 return JSON.stringify(sorted(value));
}
export function matchesCloudDraft(pending:string,cloud:unknown):boolean {
 try{return workspaceFingerprint(JSON.parse(pending))===workspaceFingerprint(cloud)}catch{return false}
}
