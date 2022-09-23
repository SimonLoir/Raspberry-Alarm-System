import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';

const toggleArm = (enabled: boolean) => {
    const state = enabled ? 'off' : 'on';
    fetch('/api/alarm/state/' + state);
};

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
        <div onClick={() => toggleArm(enabled)}>
            <h1 className={styles.title}>
                System {enabled ? 'Armed' : 'Disarmed'}
            </h1>

            <div className={styles.description}>
                {enabled ? (
                    <div className={styles.button}>
                        <LockOpenIcon />
                    </div>
                ) : (
                    <div className={styles.button}>
                        <LockIcon />
                    </div>
                )}
            </div>
        </div>
    );
}
