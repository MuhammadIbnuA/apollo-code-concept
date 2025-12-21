/**
 * Configuration for Apollo Backend Server
 * All environment variables and configuration settings
 */
export declare const config: {
    readonly port: number;
    readonly nodeEnv: string;
    readonly database: {
        readonly host: string;
        readonly port: number;
        readonly database: string;
        readonly user: string;
        readonly password: string;
        readonly ssl: false | {
            rejectUnauthorized: boolean;
        };
    };
    readonly judge0: {
        readonly apiUrl: string;
        readonly pythonLanguageId: 71;
    };
    readonly cors: {
        readonly origin: string;
        readonly credentials: true;
    };
};
export type Config = typeof config;
//# sourceMappingURL=config.d.ts.map