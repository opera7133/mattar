import { defineConfig } from "cypress";
import dotenvPlugin from "cypress-dotenv";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      config = dotenvPlugin(config)
      return config
    },
    experimentalSessionAndOrigin: true,
    baseUrl: 'http://localhost:3000'
  },
});
