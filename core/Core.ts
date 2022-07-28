import * as fs from 'fs';
import { Gpio } from 'onoff';
import webpush from 'web-push';

const app_path = process.env.APP_PATH || process.cwd();
const config_file = app_path + '/db.json';
const log_directory = app_path + '/logs/';
const getLogFileName = (date: Date) =>
    `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.log`;
const log = (message: string) => {
    fs.appendFileSync(
        log_directory + getLogFileName(new Date()),
        new Date().toLocaleString() + ' ' + message + '\n'
    );
    console.log(message);
};

export function getLogs() {
    return fs.readdirSync(log_directory);
}

const beep = (duration = 100) => {
    return new Promise<void>((resolve, reject) => {
        try {
            const b = new Gpio(20, 'out');
            b.writeSync(1);
            setTimeout(() => {
                b.writeSync(0);
                b.unexport();
                resolve();
            }, duration);
        } catch (error) {
            console.log(error.toString());
            resolve();
        }
    });
};

if (!fs.existsSync(config_file))
    fs.writeFileSync(
        config_file,
        JSON.stringify({
            armed: false,
            password: '1234',
            rules: {},
            sensors: {},
        })
    );

if (!fs.existsSync(log_directory)) fs.mkdirSync(log_directory);

class Core {
    private __config: AlarmConfig;
    private __interval: NodeJS.Timer;
    private __s: Gpio;

    constructor() {
        try {
            this.__s = new Gpio(21, 'out');
        } catch (error) {}
    }

    /**
     * Tells whether the system is armed or not.
     * @return if the system is armed.
     */
    public get armed() {
        return this.__config.armed;
    }

    /**
     * Sets whether the system is armed or not.
     * @param armed whether the system should be armed or not.
     */
    public set armed(armed: boolean) {
        log(`System ${armed ? 'armed' : 'disarmed'} successfully`);
        this.__config.armed = armed;
        this.__saveConfig();
        beep();
    }

    /**
     * Sets the configuration used by the system.
     * @param config the new configuration used by the system.
     */
    public set config(config: AlarmConfig) {
        this.__config = config;
        this.__saveConfig();
    }

    /**
     * Saves the current config in db.json.
     */
    private __saveConfig() {
        fs.writeFileSync(config_file, JSON.stringify(this.__config));
    }

    /**
     * Handles the data that comes from a sensor.
     * @param sensor_id The ID of the sensor.
     */
    public handleSensor(sensor_id: string) {
        const sf = this.__config.sensors[sensor_id];
        const save_signal = () => log(`${sensor_id} sent ${sf} signal`);
        switch (sf) {
            case 'arm':
                this.armed = true;
                save_signal();
                break;

            case 'disarm':
                this.armed = false;
                save_signal();
                this.stopAlarm();
                break;

            case 'trigger':
                save_signal();
                if (!this.armed) break;
                this.alarm();
                break;

            default:
                break;
        }
    }

    /**
     * Sets the alarm in the alarming state.
     * @returns
     */
    public alarm() {
        if (this.__interval != undefined) return;
        this.__interval = setInterval(async () => {
            await beep();
        }, 200);
        this.__s?.writeSync(1);
    }

    /**
     * Disables the alarming state.
     * @returns
     */
    public stopAlarm() {
        if (this.__interval == undefined) return;
        clearInterval(this.__interval);
        this.__interval = undefined;
        this.__s?.writeSync(0);
    }

    /**
     * Generates a new public and private key for push notifications system.
     */
    public new_key_pair() {
        const keys = webpush.generateVAPIDKeys();
        this.__config.public_key = keys.publicKey;
        this.__config.private_key = keys.privateKey;
        this.__saveConfig();
    }

    public get public_key() {
        if (this.__config.public_key == undefined) this.new_key_pair();
        return this.__config.public_key;
    }

    public get private_key() {
        if (this.__config.private_key == undefined) this.new_key_pair();
        return this.__config.private_key;
    }
}

export const alarm = new Core();

alarm.config = JSON.parse(fs.readFileSync(config_file, 'utf-8'));

log('System started');
