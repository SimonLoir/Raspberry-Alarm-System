// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';
import { alarm } from '../../../../core/Core';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const sensorID = req.query.id.toString();
    alarm.update_sensor(sensorID, 'trigger');
    res.status(200).json({ [sensorID]: alarm.get_sensor(sensorID) });
}
