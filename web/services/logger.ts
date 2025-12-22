import { toast } from "@/components/ui/sonner";

type LogLevel = 'info' | 'warn' | 'error';

interface LogOptions {
    showToast?: boolean;
    toastMessage?: string;
}

class Logger {
    private prefix = '[TWAI]';

    private log(level: LogLevel, message: string, data?: any, options?: LogOptions) {
        const timestamp = new Date().toLocaleTimeString();
        const formattedMessage = `${this.prefix} [${timestamp}] [${level.toUpperCase()}] ${message}`;

        switch (level) {
            case 'info':
                console.log(formattedMessage, data || '');
                break;
            case 'warn':
                console.warn(formattedMessage, data || '');
                break;
            case 'error':
                console.error(formattedMessage, data || '');
                break;
        }

        if (options?.showToast) {
            const toastMsg = options.toastMessage || message;
            if (level === 'error') {
                toast.error(toastMsg);
            } else if (level === 'warn') {
                toast.warning(toastMsg);
            } else {
                toast.info(toastMsg);
            }
        }
    }

    info(message: string, data?: any, options?: LogOptions) {
        this.log('info', message, data, options);
    }

    warn(message: string, data?: any, options?: LogOptions) {
        this.log('warn', message, data, options);
    }

    error(message: string, data?: any, options?: LogOptions) {
        this.log('error', message, data, options);
    }
}

export const logger = new Logger();
