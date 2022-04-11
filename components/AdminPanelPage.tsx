import Link from 'next/link';
import { ReactChild } from 'react';
import style from '../styles/Admin.module.scss';

export default function AdminPanelPage({ children }: { children: ReactChild }) {
    return (
        <>
            <header className={style.header}>
                <h1>Admin Panel</h1>
                <nav className={style.links}>
                    <Link href='/admin'>Home</Link>
                    <Link href='/admin/logs'>Logs</Link>
                    <Link href='/admin/sensors'>Sensors</Link>
                    <Link href='/admin/cron'>Cron</Link>
                </nav>
            </header>
            <div className={style.content}>{children}</div>
        </>
    );
}
