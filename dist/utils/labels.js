"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./logger");
class Labels {
    static createLabel(labelName) {
        return {
            info: (msg, meta) => logger_1.logger.info(msg, { label: labelName, ...meta }),
            error: (msg, meta) => logger_1.logger.error(msg, { label: labelName, ...meta }),
            warn: (msg, meta) => logger_1.logger.warn(msg, { label: labelName, ...meta }),
            debug: (msg, meta) => logger_1.logger.debug(msg, { label: labelName, ...meta }),
        };
    }
}
exports.default = Labels;
//# sourceMappingURL=labels.js.map