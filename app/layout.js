// app/layout.js
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../src/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'NoteBook - Project Collection',
    description: 'A collection of innovative projects and experiments',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <AuthProvider>
            {children}
        </AuthProvider>
        </body>
        </html>
    );
}