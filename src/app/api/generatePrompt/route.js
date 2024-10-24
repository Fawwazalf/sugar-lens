import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

export async function POST(req) {
  const { imageData, language } = await req.json();

  try {
    const english = `If the image does not show the product's ingredients list, please respond with 'Image does not show the ingredients^&*Please ensure that the image you sent displays the ingredients list on the packaging.'

If the image does show the ingredients list, categorize the product as "healthy," "moderate," or "unhealthy" based on its sugar content and overall health impact. Provide a response using only the category ("healthy," "moderate," or "unhealthy") followed by "^&*" and a brief explanation for your categorization.
Example Responses:

'Healthy^&*This product has low added sugar (less than 5g) and is fortified with fiber, promoting better health.'

'Moderate^&*This product contains moderate added sugar (10g) but also includes beneficial nutrients like vitamins and minerals.'

'Unhealthy^&*This product is high in added sugar (more than 20g) and lacks essential nutrients, posing health risks if consumed frequently.'`;

    const indonesian = `jika gambar tidak terdapat komposisi pada kemasan maka beri respon 'Gambar tidak menampilkan komposisi^&*Harap untuk memastikan bahwa gambar yang anda kirim menampilkan komposisi pada kemasan.'
    
    jika gambar terdapat komposisi pada kemasan maka kategorikan produk sebagai "sehat," "sedang," atau "tidak sehat" dalam hal kadar gula dan dampak kesehatannya. Berikan respons dengan hanya menuliskan judul ("sehat," "moderate," atau "tidak sehat") diikuti dengan "^&*" dan berikan penjelasan singkat untuk kategorisasi Anda.
Contoh Respons:



'Sehat^&*Produk ini memiliki kadar gula tambahan yang rendah (kurang dari 5g) dan diperkaya dengan serat, mendukung kesehatan yang lebih baik.'



'Sedang^&*Produk ini mengandung gula tambahan yang moderat (10g) tetapi termasuk nutrisi bermanfaat seperti vitamin dan mineral.'



'Tidak Sehat^&*Produk ini mengandung gula tambahan yang tinggi (lebih dari 20g) dan kurang nutrisi penting, berisiko bagi kesehatan jika sering dikonsumsi.'

`;
    const image = {
      inlineData: {
        data: imageData,
        mimeType: "image/*",
      },
    };

    const final = language ? indonesian : english;

    const result = await model.generateContent([final, image]);
    return NextResponse.json(
      result.response.candidates[0].content.parts[0].text
    );
  } catch (error) {
    return NextResponse.json(error);
  }
}
