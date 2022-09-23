import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminPanelPage from '../components/AdminPanelPage';
import LoginManager from '../components/LoginManage';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
    const router = useRouter();

    if (router.pathname.includes('/login')) {
        return <Component {...pageProps} />;
    }

    if (router.pathname.includes('/admin'))
        return (
            <AdminPanelPage>
                <LoginManager>
                    <Component {...pageProps} />
                </LoginManager>
            </AdminPanelPage>
        );

    return (
        <>
            <Head>
                <title>My page</title>
                <link rel='manifest' href='/manifest.json'></link>
            </Head>
            <LoginManager>
                <Component {...pageProps} />
            </LoginManager>
        </>
    );
}

export default MyApp;
