import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { images, mimeType, fileName } = await req.json();
    
    // Support both single image (imageData) and multiple images (images array)
    const imageArray = images || [];
    
    if (imageArray.length === 0) {
      // Check for legacy single image format
      const body = await req.clone().json();
      if (body.imageData) {
        imageArray.push(body.imageData);
      } else {
        return new Response(
          JSON.stringify({ error: "Image data is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Processing ${imageArray.length} page(s) from ${fileName} (${mimeType})`);

    const extractedTexts: string[] = [];

    // Process each image/page
    for (let i = 0; i < imageArray.length; i++) {
      const imageData = imageArray[i];
      console.log(`Processing page ${i + 1} of ${imageArray.length}...`);

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `You are a screenplay/script text extractor. Extract ALL text from this script page image exactly as it appears, preserving the formatting.

IMPORTANT RULES:
1. Preserve the exact page numbering (PAGE 1, PAGE 10, etc.)
2. Keep all "Reads:" narration blocks intact
3. Keep all numbered panel descriptions (1 - description, 2 - description, etc.)
4. Preserve any dialogue or caption text
5. Maintain paragraph breaks between sections
6. If no page number is visible, infer it as PAGE ${i + 1}

Output ONLY the extracted script text, nothing else. Do not add commentary or explanations.`
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageData.startsWith("data:") ? imageData : `data:${mimeType};base64,${imageData}`
                  }
                }
              ]
            }
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        const errorText = await response.text();
        console.error(`AI gateway error for page ${i + 1}:`, response.status, errorText);
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      const extractedText = data.choices?.[0]?.message?.content;
      
      if (extractedText) {
        extractedTexts.push(extractedText);
        console.log(`Page ${i + 1}: extracted ${extractedText.length} characters`);
      }
    }

    if (extractedTexts.length === 0) {
      throw new Error("Failed to extract text from any page");
    }

    // Combine all extracted texts
    const combinedText = extractedTexts.join('\n\n');
    console.log(`Successfully extracted ${combinedText.length} total characters from ${extractedTexts.length} page(s)`);

    return new Response(
      JSON.stringify({ 
        text: combinedText,
        fileName,
        pageCount: extractedTexts.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error extracting script:", error);
    const message = error instanceof Error ? error.message : "Failed to extract script text";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
