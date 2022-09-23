import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminPanelPage from '../components/AdminPanelPage';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
    const router = useRouter();
    if (router.pathname.includes('/admin'))
        return (
            <AdminPanelPage>
                <Component {...pageProps} />
            </AdminPanelPage>
        );

    return (
        <>
            <Head>
                <title>My page</title>
                <link rel='manifest' href='/manifest.json'></link>
            </Head>
            <Component {...pageProps} />
        </>
    );
}

export default MyApp;
