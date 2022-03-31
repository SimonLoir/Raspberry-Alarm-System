// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { alarm } from '../../../core/Core';

export default async function handler(req, res) {
    console.log(alarm);
    res.status(200).json({});
}
