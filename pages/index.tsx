import Head from 'next/head';
import { useEffect } from 'react';
import Status from '../components/Status';
import styles from '../styles/Home.module.css';

async function saveSubscription(subscription: PushSubscription) {
    const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
    });
    return response.json();
}

export default function Home() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            (async () => {
                const permission = await Notification.requestPermission();
                if (permission != 'granted') return;
                navigator.serviceWorker.register('/sw.js');
                navigator.serviceWorker.ready.then(async (reg) => {
                    let sub = await reg.pushManager.getSubscription();
                    if (!sub) {
                        try {
                            sub = await reg.pushManager.subscribe({
                                userVisibleOnly: true,
                                applicationServerKey: (
                                    await (
                                        (await fetch(
                                            '/api/subscriptions/public-key'
                                        )) as any
                                    ).json()
                                ).public_key,
                            });
                        } catch (error) {
                            console.log(error);
                            return;
                        }
                    }
                    saveSubscription(sub);
                    console.log(sub);
                });
            })();
        }
    }, []);
    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <Status></Status>
            </main>

            <footer className={styles.footer}>
                <a
                    href='https://simonloir.be'
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    Created by Simon Loir
                </a>
            </footer>
        </div>
    );
}
