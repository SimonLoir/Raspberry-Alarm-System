declare type sensor_function = 'arm' | 'disarm' | 'trigger';
declare interface AlarmConfig {
    armed: boolean;
    sensors: {
        [id: string]: sensor_function | undefined;
    };
    public_key: string;
    private_key: string;
}
