// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import Core from '../../core/Core';

export default async function handler(req, res) {
    await Core.initDatabase();
    const armed = await Core.isArmed();
    res.status(200).json({ e: armed });
}
