export const APP_BASE_NAME = "Blueprint Foundry";
export const APP_STAGE_LABEL = import.meta.env.DEV ? "Dev" : "Preview";
export const APP_DISPLAY_NAME = `${APP_BASE_NAME} (${APP_STAGE_LABEL})`;
export const APP_VERSION = import.meta.env.APP_VERSION || "0.0.0";
