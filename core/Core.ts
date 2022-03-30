import * as sqlite from 'sqlite-async';
const database = sqlite.open(process.cwd() + '/db.sqlite');

enum State {
    Armed = 'Armed',
    Password = 'Password',
}
export default class Core {
    static async setArmed(armed: boolean) {
        const db = await database;
        const value = armed ? '1' : '0';
        await db.run(
            `UPDATE state SET value = ${value} WHERE name = "${State.Armed}"`
        );
    }

    static async isArmed() {
        const value = await (
            await database
        ).get(`SELECT * FROM state WHERE name = "${State.Armed}"`);
        return value.value == '1';
    }

    static async initDatabase() {
        console.log('init database');
        const db = await database;
        await db.run(`CREATE TABLE IF NOT EXISTS logs (
            event_id INTEGER NOT NULL,
            timestamp INTEGER NOT NULL 
        )`);

        await db.run(`CREATE TABLE IF NOT EXISTS state (
            name TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )`);

        await db.run(
            `INSERT INTO state(name, value) SELECT "${State.Armed}", "0" WHERE NOT EXISTS (SELECT * FROM state where name = "${State.Armed}")`
        );
        await db.run(
            `INSERT INTO state(name, value) SELECT "${State.Password}", "12345678" WHERE NOT EXISTS (SELECT * FROM state where name = "${State.Password}")`
        );
    }
}
