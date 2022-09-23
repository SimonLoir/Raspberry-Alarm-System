import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function LoginManager({
    children,
}: {
    children: React.ReactNode;
}) {
    const [loggedIn, setLoggedIn] = useState(false);
    const router = useRouter();
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setLoggedIn(true);
        } else {
            router.push('/login');
        }
    });
    if (loggedIn) return <>{children}</>;
    return <></>;
}
