import { Context, Telegraf } from 'telegraf';

function initiateBot() {
    const bot = new Telegraf(process.env.BOT_TOKEN!);

    bot.start((ctx: Context) => ctx.reply('Welcome'));
    bot.help((ctx: Context) =>
        ctx.reply(
            'Send me any file and I will ignore it just like your crush ignores you'
        )
    );
    bot.on('sticker', (ctx: Context) => ctx.reply('Noice 👍'));
    bot.hears('Fuck', (ctx: Context) => ctx.reply('You'));

    bot.launch();
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));

    console.log(' Storage client listening...');
    return bot;
}

export default initiateBot;
