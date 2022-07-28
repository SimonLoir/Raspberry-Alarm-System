// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';
import { alarm } from '../../../core/Core';
import webpush from 'web-push';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    console.log(req.body);
    webpush.setVapidDetails(
        'mailto:contact@simonloir.be',
        alarm.public_key,
        alarm.private_key
    );
    webpush.sendNotification(req.body, 'hello world');
    res.status(200).json({});
}
