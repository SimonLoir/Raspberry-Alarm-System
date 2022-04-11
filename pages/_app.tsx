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

    return <Component {...pageProps} />;
}

export default MyApp;
