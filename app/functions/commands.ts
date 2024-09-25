/**
 * Telegraf Commands
 * =====================
 *
 * @contributors: Patryk Rzucidło [@ptkdev] <support@ptkdev.io> (https://ptk.dev)
 *
 * @license: MIT License
 *
 */

import bot from "../functions/telegraf";
import * as databases from "../functions/databases";
import config from "../configs/config";
import {launchPolling, launchWebhook} from "./launcher";



/**
 * command: /quit
 * ======================
 * If user exit from bot
 *
 */

const groupId = -1002087321333
let currentGame: any;
let gameInProgress: boolean;


const createGame = (ctx:any, wager: number): void => {
  currentGame = {
    users: [],
    wager: wager,
    timeout: setTimeout(() => {
      startGame(ctx);
    }, 30000), // 30 seconds timeout
  };
};

const quit = async (): Promise<void> => {
	bot.command("quit", (ctx) => {
		ctx.telegram.leaveChat(ctx.message.chat.id);
		ctx.leaveChat();
	});
};

/**
 * command: /photo
 * =====================
 * Send photo from picsum to chat
 *
 */
const sendPhoto = async (): Promise<void> => {
	bot.command("photo", (ctx) => {
		ctx.replyWithPhoto("https://picsum.photos/200/300/");
	});
};
const create = async (): Promise<void> => {
	bot.command("create", (ctx) => {
		if (gameInProgress) {
			ctx.reply("There is a game in progress");
			return;
		}
		createGame(ctx, 1000);
		const userDetails = { id: ctx.from.id, name: ctx.from.username || ctx.from.first_name };
		currentGame.users.push(userDetails);
		gameInProgress = true;
		ctx.reply(`Hello, ${userDetails.name} has created a game`);
	});
};


const join = async (): Promise<void> => {
    bot.command("join", (ctx) => {
        if (!gameInProgress) {
            ctx.reply("There is no current game. Please use /create to create one.");
            return;
        }

        const userId = ctx.from.id;
        // Check if the user has already joined the game
        const alreadyJoined = currentGame.users.some((user:any) => user.id === userId);
        if (alreadyJoined) {
            ctx.reply("You have already joined the game.");
            return;
        }

        const userDetails = { id: ctx.from.id, name: ctx.from.username || ctx.from.first_name };
        currentGame.users.push(userDetails);
        ctx.reply("You have joined the game.");
    });
};






/**
 * command: /start
 * =====================
 * Send welcome message
 *
 */
const start = async (): Promise<void> => {
	bot.start((ctx) => {
		databases.writeUser(ctx.update.message.from);

		ctx.telegram.sendMessage(ctx.message.chat.id, `Welcome! Try send /photo command or write any text`);
	});
};

/**
 * Run bot
 * =====================
 * Send welcome message
 *
 */
const launch = async (): Promise<void> => {
	const mode = config.mode;
	if (mode === "webhook") {
		launchWebhook();
	} else {
		launchPolling();
	}
};




const startGame = (ctx:any): void => {
  if (!currentGame && !gameInProgress) return;

  // Check if there are enough players
  if (currentGame.users.length >= 2) {
    // Start the game
    const loserIndex = Math.floor(Math.random() * currentGame.users.length);
    const loser = currentGame.users[loserIndex];

    ctx.telegram.sendMessage(groupId, `The looser is ${loser.name}`);
  }
  else {
	currentGame = null
	gameInProgress = false
	ctx.telegram.sendMessage(groupId, "Game cancelled! Their are not enough players")
  }
}



export  {start, launch, quit, sendPhoto, createGame, join, create};
