import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { decodeJwt } from 'jose';

export default function LoginManager({
    children,
}: {
    children: React.ReactNode;
}) {
    const [loggedIn, setLoggedIn] = useState(false);
    const router = useRouter();
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && decodeJwt(token).exp * 1000 > Date.now()) {
            console.log(decodeJwt(token));
            setLoggedIn(true);
        } else {
            router.push('/login');
        }
    });
    if (loggedIn) return <>{children}</>;
    return <></>;
}
