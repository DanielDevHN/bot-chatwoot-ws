import { createFlow } from "@builderbot/bot";
import { welcomeFlow } from "./welcome.flow";
import { helpFlow } from "./help.flow";


export const flow = createFlow([welcomeFlow, helpFlow]);