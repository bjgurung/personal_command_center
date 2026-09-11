import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Personal Command Center',description:'Your finances, with perspective.'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}
