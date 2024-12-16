import {
  createBot,
  createFlow,
  createProvider,
  MemoryDB,
  addKeyword,
} from "@builderbot/bot";
import { BaileysProvider as Provider } from "@builderbot/provider-baileys";
import { config } from "~/config";
import { ChatwootService } from "~/services/chatwoot.service";
import { welcomeFlow } from "~/flows/welcome.flow";
import { helpFlow } from "~/flows/help.flow";

// Inicializar el servicio de Chatwoot
const chatwootService = new ChatwootService();

// Configuración principal del bot
export const startServer = async () => {
  const adapterDB = new MemoryDB();
  const adapterFlow = createFlow([welcomeFlow, helpFlow]);
  const adapterProvider = createProvider(Provider);

  // Crear el bot e inicializar el servidor HTTP
  const { handleCtx, httpServer } = await createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  // Interceptar mensajes entrantes al bot
  adapterProvider.on("message", async (payload) => {
    const { from, pushName, body } = payload;

    console.log(`Mensaje recibido de ${from}: ${body}`);

    try {
      const phoneNumber = from.replace("@s.whatsapp.net", "");
      const inbox = await chatwootService.findOrCreateInbox("BOTWS_TS");

      const contact = await chatwootService.findOrCreateContact(
        phoneNumber,
        pushName,
        inbox.id
      );

      let conversation = await chatwootService.findConversationByPhone(
        phoneNumber
      );

      if (!conversation) {
        console.log("No se encontró conversación. Creando una nueva...");
        conversation = await chatwootService.findOrCreateConversation(
          contact.id,
          phoneNumber,
          inbox.id
        );
      }

      await chatwootService.createMessage(conversation.id, body);

      await adapterProvider.sendMessage(
        from,
        "¡Gracias por tu mensaje! Estamos procesando tu solicitud."
      );
    } catch (error: any) {
      console.error("Error al procesar el mensaje:", error.message);
    }
  });

  // Endpoint para manejar los webhooks de Chatwoot
  adapterProvider.server.post("/chatwoot/webhook", async (req, res) => {
    const {
      event,
      message_type,
      content,
      conversation,
      private: isPrivate,
    } = req.body;

    try {
      if (
        event === "message_created" &&
        message_type === "outgoing" &&
        !isPrivate
      ) {
        const phoneNumber = conversation.meta.sender.phone_number;

        console.log(
          `Enviando mensaje desde Chatwoot al usuario: ${phoneNumber}`
        );

        await adapterProvider.sendMessage(
          `${phoneNumber}@s.whatsapp.net`,
          content
        );
      }

      res.status(200).send("Webhook procesado correctamente.");
    } catch (error: any) {
      console.error("Error en el webhook de Chatwoot:", error.message);
      res.status(500).send("Error al procesar el webhook.");
    }
  });

  // Iniciar el servidor HTTP del bot
  httpServer(config.port);
  console.log(
    `Servidor del bot ejecutándose en http://localhost:${config.port}`
  );
};
