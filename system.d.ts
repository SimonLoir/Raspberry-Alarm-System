declare type sensor_function = 'arm' | 'disarm' | 'trigger';
declare interface AlarmConfig {
    password: string;
    armed: boolean;
    sensors: {
        [id: string]: sensor_function | undefined;
    };
    public_key: string;
    private_key: string;
    subscriptions: {
        [id: string]: PushSubscriptionJSON;
    };
    sensors_description: {
        [id: string]: string;
    };
}
