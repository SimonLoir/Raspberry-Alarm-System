import * as fs from 'fs';

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

    public set config(config: AlarmConfig) {
        this.__config = config;
    }
}

export const alarm = new Core();

alarm.config = JSON.parse(fs.readFileSync(config_file, 'utf-8'));

log('System started');
