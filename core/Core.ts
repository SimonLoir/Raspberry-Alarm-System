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
const beep = () => {
    try {
        const b = new Gpio(14, 'out');
        b.writeSync(1);
        b.writeSync(0);
        b.unexport();
    } catch (error) {
        console.log(error);
    }
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

    public get armed() {
        return this.__config.armed;
    }

    public set armed(armed: boolean) {
        log(`System ${armed ? 'armed' : 'disarmed'} successfully`);
        this.__config.armed = armed;
        this.__saveConfig();
        beep();
    }

    public set config(config: AlarmConfig) {
        this.__config = config;
        this.__saveConfig();
    }

    private __saveConfig() {
        fs.writeFileSync(config_file, JSON.stringify(this.__config));
    }

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
