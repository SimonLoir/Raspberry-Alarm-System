import * as fs from 'fs';
import * as path from 'path';
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

export function getLogFile(name: string) {
    const p = log_directory + path.basename(name);

    if (!fs.existsSync(p)) throw new Error('File not found');

    return fs.readFileSync(p, 'utf-8');
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
            console.log('beep missed');
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
            sensors_description: {},
        })
    );

if (!fs.existsSync(log_directory)) fs.mkdirSync(log_directory);

class Core {
    private __cooldown_duration = 1000 * 30;
    private __config: AlarmConfig;
    private __interval: NodeJS.Timer;
    private __alarm_armed_beep: NodeJS.Timer;
    private __alarm_armed_beep_timeout: NodeJS.Timeout;
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
        if (this.__config.armed == armed) return;
        log(`System ${armed ? 'armed' : 'disarmed'} successfully`);
        this.send_notification('System ' + (armed ? 'armed' : 'disarmed'));
        this.__config.armed = armed;
        if (armed) {
            this.__config.activation_time = new Date().getTime();
            this.__alarm_armed_beep = setInterval(async () => {
                await beep();
            }, 1000);
            this.__alarm_armed_beep_timeout = setTimeout(() => {
                if (this.__alarm_armed_beep != undefined) {
                    clearInterval(this.__alarm_armed_beep);
                    this.__alarm_armed_beep = undefined;
                }
            }, this.__cooldown_duration);
        } else {
            if (this.__alarm_armed_beep) {
                clearInterval(this.__alarm_armed_beep);
                this.__alarm_armed_beep = undefined;
            }
        }
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
                if (!this.armed) break;
                save_signal();
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
        if (
            new Date().getTime() - this.__config.activation_time <
            this.__cooldown_duration
        )
            return console.log(
                'alarm prevented because cooldown is still active'
            );
        if (this.__interval != undefined) return;
        this.__interval = setInterval(async () => {
            await beep();
        }, 200);
        this.__s?.writeSync(1);
        this.send_notification(
            'Alarm triggered ! - ' + new Date().toLocaleString()
        );
        log('Alarm triggered !');
        setTimeout(() => {
            this.stopAlarm();
        }, 1000 * 60 * 10);
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

    /**
     * Returns the public key used by the system.
     */
    public get public_key() {
        if (this.__config.public_key == undefined) this.new_key_pair();
        return this.__config.public_key;
    }

    /**
     * Returns the private key used by the system.
     */
    public get private_key() {
        if (this.__config.private_key == undefined) this.new_key_pair();
        return this.__config.private_key;
    }

    /**
     * Saves a new subscription in the config.
     * @param subscription The subscription to save.
     */
    public save_subscription(subscription: PushSubscriptionJSON) {
        console.log(subscription);
        if (!this.__config.subscriptions) this.__config.subscriptions = {};
        this.__config.subscriptions[subscription.endpoint] = subscription;
        this.__saveConfig();
    }

    /**
     * Gets all the subscriptions saved in the config.
     */
    public get subscriptions() {
        return Object.keys(this.__config.subscriptions).map(
            (s) => this.__config.subscriptions[s]
        );
    }

    /**
     * Sends a notification to all the subscribers.
     * @param text The text of the notification.
     */
    public send_notification(text: string) {
        console.log('Sending notification to subscribers : ' + text);
        this.subscriptions.forEach((s) => {
            try {
                webpush
                    .sendNotification(s as any, text, {
                        vapidDetails: {
                            subject: 'mailto:contact@simonloir.be',
                            publicKey: this.public_key,
                            privateKey: this.private_key,
                        },
                    })
                    .catch(() => console.log("Couldn't send notification"));
            } catch (error) {
                console.log(error.toString());
            }
        });
    }

    /**
     * Gets a list of sensors
     * @returns an object with the sensor as key and the type as value.
     */
    public list_sensors() {
        return { ...this.__config.sensors };
    }

    /**
     * Returns the password of the system.
     */
    public get password() {
        return this.__config.password;
    }

    /**
     * Updates the type of the sensor
     * @param sensorID The ID of the sensor
     * @param sensorType The new type of the sensor
     */
    public update_sensor(sensorID: string, sensorType: sensor_function) {
        this.__config.sensors[sensorID] = sensorType;
        this.__saveConfig();
    }

    /**
     * Returns the function of a sensor
     * @param sensorID the ID of the sensor
     * @returns The function of the sensor
     */
    public get_sensor(sensorID: string) {
        return this.__config.sensors[sensorID];
    }

    /**
     * Returns the description of a sensor.
     * @param sensorID Te ID of the sensor
     * @returns The description of the sensor
     */
    public get_sensor_description(sensorID: string) {
        return this.__config.sensors_description[sensorID];
    }

    /**
     * Lists all the descriptions of the sensors
     * @returns An object with the sensor ID as key and the description as value
     */
    public list_sensors_description() {
        return { ...this.__config.sensors_description };
    }

    /**
     * Updates the description of a sensor
     * @param sensorID The ID of the sensor
     *  @param description The new description of the sensor
     * @returns The description of the sensor
     */
    public update_sensor_description(sensorID: string, description: string) {
        this.__config.sensors_description[sensorID] = description;
        this.__saveConfig();
    }
}

export const alarm = new Core();

alarm.config = JSON.parse(fs.readFileSync(config_file, 'utf-8'));

log('System started');
