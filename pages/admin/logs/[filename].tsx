import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import getHeaders from '../../../utils/getHeaders';

export default function LogFile() {
    const router = useRouter();
    const [data, setData] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (!router.isReady) return;
        (async () => {
            try {
                const response: string = await (
                    await fetch('/api/logs/' + router.query.filename, {
                        headers: getHeaders(),
                    })
                ).json();
                console.log(response);
                setData(response);
                setLoading(false);
            } catch (error) {
                setError(error.toString());
            }
        })();
    }, [router.query.filename]);

    if (error != '') return <>An error ocurred {error}</>;
    if (loading) return <>Loading</>;

    return (
        <>
            <pre>{data}</pre>
        </>
    );
}
