import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert data URL to a Gemini-compatible format
const dataUrlToGeminiPart = (dataUrl: string) => {
    const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!match) {
        throw new Error("Invalid data URL format");
    }
    const [_, mimeType, base64Data] = match;
    return {
        inlineData: {
            mimeType,
            data: base64Data,
        },
    };
};

/**
 * Describes the main object in an image to create a base prompt for generation.
 * @param imageDataUrl The data URL of the image to describe.
 * @returns A promise that resolves to a string description.
 */
export const describeImage = async (imageDataUrl: string): Promise<string> => {
    try {
        const imagePart = dataUrlToGeminiPart(imageDataUrl);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    imagePart,
                    { text: "Describe the main subject of this image in a single, concise phrase, suitable for a detailed image generation prompt. For example: 'A red sports car' or 'A majestic snow-capped mountain'." }
                ]
            }
        });

        if (!response.text) {
            throw new Error('Failed to get a description from the model.');
        }
        return response.text.trim().replace(/["']/g, ""); // Clean up quotes
    } catch (error) {
        console.error("Error in describeImage:", error);
        throw new Error("Could not analyze the image. Please try another one.");
    }
};

/**
 * Generates an image based on a source image and a text prompt.
 * @param imageDataUrl The data URL of the source image.
 * @param prompt The text prompt for image generation.
 * @returns A promise that resolves to a base64 encoded data URL of the generated image.
 */
export const generateImageView = async (imageDataUrl: string, prompt: string): Promise<string> => {
    try {
        const imagePart = dataUrlToGeminiPart(imageDataUrl);
        const fullPrompt = `${prompt}. IMPORTANT: The face of the person must remain exactly the same as in the provided image. Do not change the facial features, expression, or identity.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    imagePart,
                    { text: fullPrompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imageCandidatePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);

        if (!imageCandidatePart || !imageCandidatePart.inlineData) {
             throw new Error('Image generation failed, no image part returned from the model.');
        }

        const { mimeType, data } = imageCandidatePart.inlineData;
        return `data:${mimeType};base64,${data}`;
        
    } catch (error) {
        console.error("Error in generateImageView:", error);
        throw new Error(`Failed to generate view for prompt: "${prompt}"`);
    }
};