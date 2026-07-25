import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_HOME_CHANNEL || process.env.TELEGRAM_ALLOWED_USERS;

    if (!token || !chatId) {
      return NextResponse.json(
        { success: false, error: "Telegram bot token veya chat ID bulunamadı." },
        { status: 500 }
      );
    }

    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: Number(chatId),
          text: message || "🧪 CarryHub Ops Agent test mesajı",
          parse_mode: "HTML",
        }),
      }
    );

    const data = await res.json();

    if (data.ok) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: data.description || "Telegram hatası" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
