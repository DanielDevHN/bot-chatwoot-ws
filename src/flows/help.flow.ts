import { addKeyword } from "@builderbot/bot";


export const helpFlow = addKeyword(["ayuda", "help"]).addAnswer(
    "Claro, puedo ayudarte con las siguientes opciones:\n1. Información\n2. Contacto\n3. Soporte"
)