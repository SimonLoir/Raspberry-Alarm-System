// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';
import { alarm } from '../../../../core/Core';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const state = req.query.state.toString();
    if (state != 'on' && state != 'off')
        res.status(500).json({ error: 'Invalid state string' });
    res.status(200).json({});
}
