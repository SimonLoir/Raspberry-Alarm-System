import Head from 'next/head';
import Status from '../components/Status';
import styles from '../styles/Home.module.css';
export default function Home() {
    return (
        <div className={styles.container}>
            <Head>
            </Head>

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
