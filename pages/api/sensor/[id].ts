// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';
import { alarm } from '../../../core/Core';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    alarm.handleSensor(req.query.id.toString());
    res.status(200).json({});
}
