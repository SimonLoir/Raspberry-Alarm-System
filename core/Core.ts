import * as fs from 'fs';
import { Gpio } from 'onoff';

const app_path = process.env.APP_PATH || process.cwd();
const config_file = app_path + '/db.json';
const log_directory = app_path + '/logs/';
const getLogFileName = (date: Date) =>
    `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.log`;
const log = (message: string) =>
    fs.appendFileSync(
        log_directory + getLogFileName(new Date()),
        new Date().toLocaleString() + ' ' + message + '\n'
    );

const beep = (duration = 100) => {
    return new Promise<void>((resolve, reject) => {
        try {
            const b = new Gpio(14, 'out');
            b.writeSync(1);
            setTimeout(() => {
                b.writeSync(0);
                b.unexport();
                resolve();
            }, duration);
        } catch (error) {
            console.log(error);
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
        const save = () => log(`${sensor_id} sent ${sf} signal`);
        switch (sf) {
            case 'arm':
                this.armed = true;
                save();
                break;

            case 'disarm':
                this.armed = false;
                save();
                break;

            case 'trigger':
                save();
                break;

            default:
                break;
        }
    }
}

export const alarm = new Core();

alarm.config = JSON.parse(fs.readFileSync(config_file, 'utf-8'));

log('System started');
