// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';
import { alarm } from '../../../core/Core';
import webpush from 'web-push';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    alarm.save_subscription(req.body);
    res.status(200).json({});
}
