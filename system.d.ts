declare type sensor_function = 'arm' | 'disarm' | 'trigger';
declare interface AlarmConfig {
    armed: boolean;
    sensors: {
        [id: string]: sensor_function | undefined;
    };
}
