import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Status() {
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        const fn = () => {
            (async () => {
                const json = await (await fetch('/api/alarm/state')).json();
                setEnabled(json.armed);
                console.log(json);
            })();
        };
        const interval = setInterval(fn, 1000);
        fn();
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <h1 className={styles.title}>
                System {enabled ? 'Armed' : 'Disarmed'}
            </h1>
        </>
    );
}
