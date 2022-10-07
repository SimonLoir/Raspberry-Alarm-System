import { alarm } from '../../../core/Core';

export default async function handler(req, res) {
    res.status(200).json(alarm.list_sensors_description());
}
