import "dotenv/config";


export const config = {
    chatwootApiUrl: process.env.CHATWOOT_API_URL,
    chatwootBotToken: process.env.CHATWOOT_TOKEN || "",
    accountId: process.env.CHATWOOT_ACCOUNT_ID || "",
    port: parseInt(process.env.PORT),
};