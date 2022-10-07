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
    const [descriptions, setDescriptions] = useState<any>({});
    const [name, setName] = useState('');
    const loader = useCallback(async () => {
        const response = await fetch('/api/sensors', {
            headers: getHeaders(),
        });

        const data = await response.json();
        setData(data);

        const response2 = await fetch('/api/sensors/descriptions', {
            headers: getHeaders(),
        });

        const data2 = await response2.json();
        setDescriptions(data2);
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
                        <th>Sensor Description</th>
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
                                <td
                                    onClick={() => {
                                        const description = prompt(
                                            'Sensor description',
                                            descriptions[sensorID]
                                        );
                                        if (
                                            description &&
                                            description !=
                                                descriptions[sensorID]
                                        ) {
                                            fetch(
                                                '/api/sensor/' +
                                                    sensorID +
                                                    '/description',
                                                {
                                                    method: 'POST',
                                                    headers: {
                                                        ...getHeaders(),
                                                        'Content-Type':
                                                            'application/json',
                                                    },
                                                    body: JSON.stringify({
                                                        description,
                                                    }),
                                                }
                                            ).then(() => {
                                                setDescriptions({
                                                    ...descriptions,
                                                    [sensorID]: description,
                                                });
                                            });
                                        }
                                    }}
                                >
                                    {descriptions[sensorID]}
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
