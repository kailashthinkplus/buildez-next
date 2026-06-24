// freepikClient.ts

type FreepikImageInput = {
  prompt: string;
  style?: string;
  aspectRatio?: "1:1" | "16:9" | "4:3";
};

export async function generateFreepikImage(
  input: FreepikImageInput
): Promise<string> {
  const res = await fetch("https://api.freepik.com/v1/ai/text-to-image", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.FREEPIK_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: input.prompt,
      aspect_ratio: input.aspectRatio ?? "16:9",
      style: input.style ?? "modern clean illustration",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Freepik error: ${err}`);
  }

  const json = await res.json();

  const imageUrl = json?.data?.[0]?.url;

  if (!imageUrl) {
    throw new Error("Freepik returned no image");
  }

  return imageUrl;
}
