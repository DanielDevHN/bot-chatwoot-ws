import { addKeyword } from "@builderbot/bot";

export const welcomeFlow = addKeyword(["hola", "hello", "buenos días"]).addAnswer(
  "¡Hola! ¿En qué puedo ayudarte?"
);
