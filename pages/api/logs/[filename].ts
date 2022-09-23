import { NextApiRequest, NextApiResponse } from 'next';
import { getLogFile } from '../../../core/Core';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    console.log(req.query);
    res.status(200).json(getLogFile(req.query.filename.toString()));
}
