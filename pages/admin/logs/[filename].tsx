import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function LogFile() {
    const router = useRouter();
    const [data, setData] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        (async () => {
            try {
                const response: string = await (
                    await fetch('/api/logs/' + router.query.filename)
                ).text();
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
