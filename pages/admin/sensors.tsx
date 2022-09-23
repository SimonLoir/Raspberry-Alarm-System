import { useCallback, useEffect, useState } from 'react';
import getHeaders from '../../utils/getHeaders';

const types = ['trigger', 'arm', 'disarm'];

function Select({ type, onChange }) {
    return (
        <select onChange={onChange} value={type}>
            {types.map((t) => (
                <option value={t} key={t}>
                    {t}
                </option>
            ))}
        </select>
    );
}

export default function SensorsPage() {
    const [data, setData] = useState<any>({});
    const [name, setName] = useState('');
    const loader = useCallback(async () => {
        const response = await fetch('/api/sensors', {
            headers: getHeaders(),
        });
        const data = await response.json();
        setData(data);
    }, []);

    useEffect(() => {
        loader();
    }, []);

    return (
        <>
            <h2>Sensors</h2>

            <table>
                <thead>
                    <tr>
                        <th>Sensor ID</th>
                        <th>Sensor type</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(data).map((sensorID, id) => {
                        const type = data[sensorID];
                        return (
                            <tr key={id}>
                                <td>{sensorID}</td>
                                <td>
                                    <Select
                                        type={type}
                                        onChange={async (e) => {
                                            const response = await fetch(
                                                `/api/sensor/type/${e.target.value}/${sensorID}`,
                                                { headers: getHeaders() }
                                            );
                                            const d = await response.json();

                                            setData({
                                                ...data,
                                                ...d,
                                            });
                                        }}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <input
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <button
                onClick={async () => {
                    const response = await fetch(`/api/sensor/add/${name}`, {
                        headers: getHeaders(),
                    });
                    const d = await response.json();
                    setData((data) => ({ ...data, ...d }));
                }}
            >
                Add sensor
            </button>
        </>
    );
}
