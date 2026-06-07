type LogMeta = Record<string, unknown>;
interface LabelLogger {
    info: (msg: string, meta?: LogMeta) => void;
    error: (msg: string, meta?: LogMeta) => void;
    warn: (msg: string, meta?: LogMeta) => void;
    debug: (msg: string, meta?: LogMeta) => void;
}
declare class Labels {
    static createLabel(labelName: string): LabelLogger;
}
export default Labels;
