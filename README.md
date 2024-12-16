# WhatsApp Chatbot + Chatwoot Integration

This project is a WhatsApp chatbot built using the **BuilderBot** library and integrated with **Chatwoot** to manage conversations, contacts, and messages. The bot automatically creates inboxes, contacts, and conversations in Chatwoot, ensuring seamless message synchronization between WhatsApp and Chatwoot.

---

## **Table of Contents**

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Running the Project](#running-the-project)
- [How It Works](#how-it-works)
- [Dependencies](#dependencies)
- [Testing Hooks](#testing-webhooks)
- [Autor](#autor)
- [Credits](#credits)

---

## **Features**

- Integrates **WhatsApp** via BuilderBot's **Baileys provider**.
- Automatically creates inboxes, contacts, and conversations in **Chatwoot**.
- Receives incoming messages from WhatsApp and logs them to Chatwoot.
- Sends outgoing messages from Chatwoot to WhatsApp users in real time.

---

## **Requirements**

Make sure you have the following installed:

- **Node.js** (version 18+ recommended)
- **npm** or **yarn**
- **Chatwoot API Access Token** (admin permissions required)
- **WhatsApp Business Account** with a phone number ready to connect
- **BuilderBot library** (latest version)

---

## **Installation**

Follow these steps to set up the project:

1. **Clone the repository**:
   ```https://github.com/DanielDevHN/bot-chatwoot-ws.git```

   ```base-ts-baileys-memory```

2. **Install project dependencies**:
   ```npm install```


## **Environment Configuration**

Create a ```.env``` file in the root directory and add the following environment variables:

## Chatwoot Configuration
```CHATWOOT_API_URL=https://app.chatwoot.com```

```CHATWOOT_BOT_TOKEN=your_chatwoot_api_token```

```CHATWOOT_ACCOUNT_ID=your_account_id```               

## BuilderBot Configuration
```PORT=you_port```                                      

- Replace ```your_chatwoot_api_token``` with a valid API Access Token generated in Chatwoot.
- Update ```CHATWOOT_API_URL``` with your Chatwoot instance URL.

## Running the Project

To start the chatbot server, run the following command:

```npm run dev```

The bot server will start at ```http://localhost:3002```

## How It Works

When a user sends a message to your WhatsApp number:

1. **The bot intercepts the message**.
- Automatically creates or finds the corresponding inbox, contact, and conversation in Chatwoot.
- Logs the incoming message in the Chatwoot dashboard.
- When an agent replies to the conversation from Chatwoot:

2. **Chatwoot sends a webhook to the bot**.
- The bot processes the webhook and delivers the message back to the WhatsApp user.

## Dependencies

The following libraries and tools are used in this project:

| **Package**                         | **Version** | **Description**                                     |
|-------------------------------------|-------------|----------------------------------------------------|
| **@builderbot/bot**                 | ^1.2.2      | Core library for creating the WhatsApp bot.        |
| **@builderbot/provider-baileys**    | ^1.2.2      | WhatsApp provider using Baileys library.           |
| **axios**                           | ^1.5.0      | HTTP client for making requests to Chatwoot.       |
| **dotenv**                          | ^16.0.0     | Loads environment variables from `.env` file.      |
| **express**                         | ^4.21.2     | Lightweight HTTP server for webhook integration.   |
| **typescript**                      | ^5.3.0      | TypeScript support for the project.                |


## Testing Webhooks

1. **Configure your Chatwoot Webhook settings**:

- Go to Settings → Account Settings → Webhooks.
- Add a webhook pointing to:

```http://<your-server-url>:3002/chatwoot```

- Enable the message_created event.

2. **Send a message from the Chatwoot dashboard to verify**:

- The message should be delivered to the WhatsApp user.
- Logs will confirm webhook processing.

## License

This project is licensed under the MIT License.

## Autor

[Daniel Reyes](mailto:dangrereyes@gmail.com)

## Credits

[Builderbot](https://www.builderbot.app/)