import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY!})

export type InvoiceFile = {
  name: string;
  type: string;
  buffer: string; 
};

const PROMPT = `
Analiza esta imagen de un ticket y extrae la información.

Devuelve una respuesta (NO JSON) con el siguiente formato:

images[<cantidad_de_imagenes>]:
  - items[<cantidad_de_items>]{quantity, name, unit_price, measure}:
      <unidad_item1>,<nombre_item1>,<precio_unitario_item1>,<medida_item1>
    supplier: <NOMBRE DE VENDEDOR O TIENDA>
    payment_method: <CONTADO | CREDITO | TRANSFERENCIA>
    valid: <true | false>
  ...
...

Determina la medida del item si el ticket no la incluye con estos valores: kg|g|l|ml|cc|m.
El precio debe ir con punto decimal, no coma.
Si algún campo NO está presente, devuelve null donde corresponda.
Si alguna imagen no es un ticket válido, devuelve valid: false para esa imagen.
Si NINGUNA imagen es un ticket válido, devuelve: "Imagen invalida"
`;

const MODEL_NAME = "gemini-2.5-pro";

export async function processInvoices(files: InvoiceFile[]) {
  try {
    const promptParts = files.map((file) => ({
      inlineData: {
        data: file.buffer,
        mimeType: file.type,
      },
    }));

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [ { text: PROMPT }, ...promptParts ],
      // config: {
      //   thinkingConfig: {
      //     thinkingLevel: ThinkingLevel.HIGH
      //   }
      // }
    })

    const usage = response.usageMetadata;
  
    console.log("\n📊 REPORTE DE CONSUMO DE TOKENS:");
    if (usage) {
      console.log(`   🔹 Input Tokens (Imagenes + Prompt): ${usage.promptTokenCount}`);
      console.log(`   🔹 Output Tokens (Respuesta):      ${usage.candidatesTokenCount}`);
      console.log(`   🔹 Total Tokens:                   ${usage.totalTokenCount}`);
    }

    return response.text;

  } catch (error) {
    throw error;
  }
}