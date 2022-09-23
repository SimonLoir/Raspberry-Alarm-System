import { useEffect, useState } from 'react';

export default function SensorsPage() {
    const [data, setData] = useState<any>({});

    useEffect(() => {
        (async () => {
            const response = await fetch('/api/sensors');
            const data = await response.json();
            setData(data);
        })();
    }, []);

    return (
        <>
            <h2>Sensors</h2>
            {Object.keys(data).map((key) => {
                return (
                    <div key={key}>
                        <h3>{key}</h3>
                    </div>
                );
            })}
        </>
    );
}
