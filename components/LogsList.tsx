import Link from 'next/link';
import { useEffect, useState } from 'react';
import getHeaders from '../utils/getHeaders';

export default function LogsList() {
    const [data, setData] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        (async () => {
            try {
                const response: string[] = await (
                    await fetch('/api/logs', { headers: getHeaders() })
                ).json();
                console.log(response);
                setData(response.reverse());
                setLoading(false);
            } catch (error) {
                setError(error.toString());
            }
        })();
    }, []);

    if (error != '') return <>An error ocurred {error}</>;
    if (loading) return <>Loading</>;

    return (
        <>
            <ul>
                {data.map((e) => (
                    <li key={e}>
                        <Link href={`/admin/logs/${e}`}>{e}</Link>
                    </li>
                ))}
            </ul>
        </>
    );
}
