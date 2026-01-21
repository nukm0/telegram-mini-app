import os
from telegram import Update, InlineKeyboardMarkup, InlineKeyboardButton
from telegram.ext import Application, CommandHandler, ContextTypes, CallbackQueryHandler

# Конфигурация
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "8496999739:AAFXomzsV-myTJ9kVngb3Hc2WAuW8JBR644")
MINI_APP_URL = "https://telegram-mini-app-nukm0.vercel.app"
SUPPORT_USERNAME = "@nukm0"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("🚀 Открыть мини-приложение", web_app={"url": MINI_APP_URL})],
        [InlineKeyboardButton("📖 Описание", callback_data="description")],
        [InlineKeyboardButton("❓ Как использовать", callback_data="how_to_use")],
        [InlineKeyboardButton("🆘 Поддержка", url=f"https://t.me/{SUPPORT_USERNAME[1:]}")]
    ])
    
    await update.message.reply_text(
        f"👋 Привет! Я бот для мини-приложения по работе с текстом.\n\n"
        "Выберите действие:",
        reply_markup=keyboard
    )

async def handle_description(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    
    await query.edit_message_text(
        "📖 *О приложении:*\n\n"
        "Это мини-приложение в Telegram для работы с текстом:\n"
        "• ✏️ Редактирование текста\n"
        "• 🎨 Форматирование\n"
        "• 💾 Сохранение заметок\n"
        "• 📋 Копирование в буфер\n\n"
        "Работает прямо в Telegram!",
        parse_mode='Markdown'
    )

async def handle_how_to_use(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    
    await query.edit_message_text(
        "❓ *Инструкция:*\n\n"
        "1. Нажмите 'Открыть мини-приложение'\n"
        "2. Вводите текст в поле\n"
        "3. Используйте кнопки для форматирования\n"
        "4. Сохраняйте или копируйте результат\n\n"
        "Всё просто! 🚀",
        parse_mode='Markdown'
    )

def main():
    app = Application.builder().token(TOKEN).build()
    
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(handle_description, pattern="description"))
    app.add_handler(CallbackQueryHandler(handle_how_to_use, pattern="how_to_use"))
    
    print("🤖 Бот запущен...")
    app.run_polling()

if __name__ == "__main__":
    main()
