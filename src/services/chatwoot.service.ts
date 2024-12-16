import axios from "axios";
import { config } from "../config";

export class ChatwootService {
  // Configurar headers con api_access_token
  private headers = {
    api_access_token: config.chatwootBotToken,
    "Content-Type": "application/json",
  };

  // Construye la URL base para las peticiones
  private buildUrl(path: string): string {
    return `${config.chatwootApiUrl}/api/v1/accounts/${config.accountId}${path}`;
  }

  // Buscar o crear un inbox
  async findOrCreateInbox(name: string) {
    const url = this.buildUrl("/inboxes");

    try {
      // Buscar si existe el inbox
      const { data } = await axios.get(url, { headers: this.headers });
      const inbox = data.payload.find((i: any) => i.name === name);

      if (inbox) return inbox;

      // Crear un nuevo inbox si no existe
      const payload = { name, channel: { type: "api", webhook_url: "" } };
      const { data: createdInbox } = await axios.post(url, payload, { headers: this.headers });
      return createdInbox;
    } catch (error: any) {
      console.error("Error en findOrCreateInbox:", error.response?.data || error.message);
      throw error;
    }
  }

  // Buscar un contacto por número de teléfono
  async findContact(phone: string) {
    const url = this.buildUrl(`/contacts/search?q=${phone}`);
    try {
      const { data } = await axios.get(url, { headers: this.headers });
      return data.payload.length > 0 ? data.payload[0] : null;
    } catch (error: any) {
      console.error("Error en findContact:", error.response?.data || error.message);
      throw error;
    }
  }

  // Crear un contacto nuevo
  async createContact(phone: string, name: string, inboxId: number) {
    const url = this.buildUrl("/contacts");
    const payload = { inbox_id: inboxId, name, phone_number: phone };

    try {
      const { data } = await axios.post(url, payload, { headers: this.headers });
      return data.payload.contact;
    } catch (error: any) {
      console.error("Error en createContact:", error.response?.data || error.message);
      throw error;
    }
  }

  // Buscar o crear un contacto
  async findOrCreateContact(phone: string, name: string, inboxId: number) {
    try {
      let contact = await this.findContact(phone);

      if (!contact) {
        contact = await this.createContact(phone, name, inboxId);
      }

      return contact;
    } catch (error: any) {
      console.error("Error en findOrCreateContact:", error.response?.data || error.message);
      throw error;
    }
  }

  // Buscar una conversación existente por número de teléfono
  async findConversationByPhone(phone: string) {
    const url = this.buildUrl("/conversations/filter");

    const payload = [
      {
        attribute_key: "phone_number",
        attribute_model: "standard",
        filter_operator: "equal_to",
        values: [phone],
        custom_attribute_type: "",
      },
    ];

    try {
      const { data } = await axios.post(url, { payload }, { headers: this.headers });
      return data.payload.length > 0 ? data.payload[0] : null; // Devuelve la conversación encontrada
    } catch (error: any) {
      console.error("Error en findConversationByPhone:", error.response?.data || error.message);
      throw error;
    }
  }

  // Crear una conversación nueva
  async createConversation(contactId: number, phone: string, inboxId: number) {
    const url = this.buildUrl("/conversations");
    const payload = {
      contact_id: contactId,
      inbox_id: inboxId,
      custom_attributes: { phone_number: phone },
    };

    try {
      const { data } = await axios.post(url, payload, { headers: this.headers });
      return data;
    } catch (error: any) {
      console.error("Error en createConversation:", error.response?.data || error.message);
      throw error;
    }
  }

  // Buscar o crear una conversación
  async findOrCreateConversation(contactId: number, phone: string, inboxId: number) {
    try {
      let conversation = await this.findConversationByPhone(phone);

      if (!conversation) {
        conversation = await this.createConversation(contactId, phone, inboxId);
      }

      return conversation;
    } catch (error: any) {
      console.error("Error en findOrCreateConversation:", error.response?.data || error.message);
      throw error;
    }
  }

  // Crear un mensaje en una conversación existente
  async createMessage(conversationId: number, message: string) {
    const url = this.buildUrl(`/conversations/${conversationId}/messages`);
    const payload = { content: message, message_type: "incoming", private: false };

    try {
      await axios.post(url, payload, { headers: this.headers });
    } catch (error: any) {
      console.error("Error en createMessage:", error.response?.data || error.message);
      throw error;
    }
  }
}
