import { createProvider, MemoryDB } from "@builderbot/bot";
import { BaileysProvider } from "@builderbot/provider-baileys";


export const baileysProvider = createProvider(BaileysProvider)
export const database = new MemoryDB();