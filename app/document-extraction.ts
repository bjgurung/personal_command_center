export async function extractDocument(file:File,progress:(message:string)=>void):Promise<string>{
 if(file.size>10*1024*1024)throw Error('Maximum file size is 10 MB.');
 if(!['application/pdf','image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Choose a JPEG, PNG, WebP or PDF.');
 let worker:Awaited<ReturnType<typeof import('tesseract.js').createWorker>>|undefined;
 async function ocr(image:File|HTMLCanvasElement){
  if(!worker){const {createWorker}=await import('tesseract.js');worker=await createWorker('eng',1,{logger:m=>progress(`${m.status} ${Math.round((m.progress||0)*100)}%`)});}
  return (await worker.recognize(image)).data.text;
 }
 try{
  let result='';
  if(file.type==='application/pdf'){
   const pdfjs=await import('pdfjs-dist');pdfjs.GlobalWorkerOptions.workerSrc='/pdf.worker.min.mjs';
   const task=pdfjs.getDocument({data:await file.arrayBuffer()});
   try{const pdf=await task.promise;if(pdf.numPages>10)throw Error('Use a PDF with 10 pages or fewer.');
    for(let n=1;n<=pdf.numPages;n++){
     progress(`Reading page ${n} of ${pdf.numPages}`);const page=await pdf.getPage(n);const content=await page.getTextContent();
     let text='',lastY:number|undefined;
     for(const item of content.items){if(!('str' in item))continue;const y=item.transform[5];if(lastY!==undefined&&Math.abs(y-lastY)>3)text+='\n';text+=item.str+(item.hasEOL?'\n':' ');lastY=y;}
     if(text.trim().length<15){const viewport=page.getViewport({scale:2});const canvas=document.createElement('canvas');canvas.width=viewport.width;canvas.height=viewport.height;await page.render({canvas,viewport}).promise;text=await ocr(canvas);canvas.width=canvas.height=0;}
     result+=text+'\n';
    }
   }finally{await task.destroy();}
  }else result=await ocr(file);
  if(!result.trim())throw Error('No readable text found. Try a clearer image or type the entry.');
  return result;
 }finally{await worker?.terminate();}
}
