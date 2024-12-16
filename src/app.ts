import "dotenv/config";
import { startServer } from "./server/server";


const main = async () => {
  try {
    console.log("Inicializando el servidor del bot...");
    await startServer();
    console.log("Servidor iniciado correctamente.");
  } catch (error: any) {
    console.error("Error al iniciar el servidor:", error.message);
    process.exit(1);
  }
};

main();
