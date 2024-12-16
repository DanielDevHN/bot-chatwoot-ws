import { createBot } from "@builderbot/bot";
import { config } from "~/config";
import { database } from "~/database";
import { flow } from "~/flows";
import { provider } from "~/providers/baileys.provider";
import { ChatwootService } from "~/services/chatwoot.service";

// Inicializar el servicio de Chatwoot
const chatwootService = new ChatwootService();

// Configuración principal del bot
export const startServer = async () => {
  const adapterProvider = provider;

  // Crear el bot e inicializar el servidor HTTP
  const { handleCtx, httpServer } = await createBot({
    flow,
    provider,
    database,
  });

  // Interceptar mensajes entrantes al bot
  adapterProvider.on("message", async (payload) => {
    const { from, pushName, body } = payload;

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
        "¡Gracias por tu mensaje! Estamos procesando tu solicitud.",
        {}
      );
    } catch (error: any) {
      console.error("Error al procesar el mensaje:", error.message);
    }
  });

  // Endpoint para manejar los webhooks de Chatwoot
  adapterProvider.server.post(
    "/chatwoot",
    handleCtx(async (_, req, res) => {
      const { event, message_type, content, conversation, private: isPrivate } = req.body;
  
      try {
        if (event === "message_created" && message_type === "outgoing" && !isPrivate) {
          const phoneNumber = conversation?.meta?.sender?.phone_number;
  
          if (!phoneNumber) {
            res.end("Error: Número de teléfono no encontrado.");
            return;
          }

          const formattedNumber = `${phoneNumber.replace("+", "")}@s.whatsapp.net`;

          await adapterProvider.sendMessage(formattedNumber, content, {});
          res.end("Mensaje enviado correctamente.");

        } else {
          res.end("Evento no relevante.");
        }
      } catch (error: any) {
        console.error("Error en el webhook de Chatwoot:", error.message);
        res.end("Error al procesar el webhook.");
      }
    })
  );
  
  // Iniciar el servidor HTTP del bot
  httpServer(config.port);
  console.log(
    `Servidor del bot ejecutándose en http://localhost:${config.port}`
  );
};
