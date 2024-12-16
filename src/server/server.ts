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
  adapterProvider.server.post(
    "/chatwoot",
    handleCtx(async (_, req, res) => {
      const { event, message_type, content, conversation, private: isPrivate } = req.body;
  
      try {
        // Validar si el evento es relevante
        if (event === "message_created" && message_type === "outgoing" && !isPrivate) {
          const phoneNumber = conversation?.meta?.sender?.phone_number;
  
          if (!phoneNumber) {
            console.error("Número de teléfono no encontrado en el webhook.");
            res.end("Error: Número de teléfono no encontrado.");
            return;
          }
  
          console.log(`Enviando mensaje desde Chatwoot al usuario: ${phoneNumber}`);
          console.log(`Contenido del mensaje: ${content}`);
  
          // Formatear el número correctamente para Baileys
          const formattedNumber = `${phoneNumber.replace("+", "")}@s.whatsapp.net`;
  
          // Debug: verificar el formato
          console.log("Número formateado para Baileys:", formattedNumber);
  
          // Enviar mensaje al usuario en WhatsApp
          await adapterProvider.sendMessage(formattedNumber, content, {});
  
          console.log("Mensaje enviado correctamente.");
          res.end("Webhook procesado correctamente.");
        } else {
          console.log("Evento no relevante para el webhook.");
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
