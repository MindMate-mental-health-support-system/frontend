import { Client } from "@gradio/client";

async function testGradio() {
    try {
        const client = await Client.connect("sidharths9105/mindmate-emotion-detector");
        console.log("Endpoints:", client.config.endpoints);
        for (const ep of client.config.endpoints) {
             console.log("Parameters for", ep.name, ":", ep.parameters);
        }
    } catch (e) {
        console.error(e);
    }
}
testGradio();
