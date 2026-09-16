import { App } from "./App.js";
import { InterfaceUsuario } from "./InterfaceUsuario.js";

const app = new App();

app.inicializar();

const interfaceUsuario =
  new InterfaceUsuario(app);

interfaceUsuario.iniciar();