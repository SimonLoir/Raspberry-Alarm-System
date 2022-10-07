import { NextApiRequest, NextApiResponse } from 'next';
import { alarm } from '../../../../core/Core';

export default function updateDescription(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id } = req.query;
    const { description } = req.body;

    alarm.update_sensor_description(id as string, description);

    res.status(200).json({ id, description });
}
