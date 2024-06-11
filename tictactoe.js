const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tictactoe')
        .setDescription('Play a game of TicTacToe!')
        .addUserOption(option => 
            option.setName('opponent')
                .setDescription('Select an opponent')
                .setRequired(false)),
    async execute(interaction) {
        const opponent = interaction.options.getUser('opponent') || interaction.client.user;
        const isAI = opponent.id === interaction.client.user.id;
        
        let board = ['-', '-', '-', '-', '-', '-', '-', '-', '-'];
        let currentPlayer = interaction.user;
        let winner = null;

        const checkWinner = (board) => {
            const winPatterns = [
                [0, 1, 2],
                [3, 4, 5],
                [6, 7, 8],
                [0, 3, 6],
                [1, 4, 7],
                [2, 5, 8],
                [0, 4, 8],
                [2, 4, 6]
            ];
            for (const pattern of winPatterns) {
                const [a, b, c] = pattern;
                if (board[a] === board[b] && board[b] === board[c] && board[a] !== '-') {
                    return board[a];
                }
            }
            if (board.every(cell => cell !== '-')) {
                return 'draw';
            }
            return null;
        };

        const makeMove = (index, playerEmoji) => {
            if (board[index] === '-') {
                board[index] = playerEmoji;
                return true;
            }
            return false;
        };

        const renderBoard = () => {
            return board.map(cell => cell).join('');
        };

        const createButtons = () => {
            const components = [];
            for (let i = 0; i < 3; i++) {
                const row = new MessageActionRow();
                for (let j = 0; j < 3; j++) {
                    const index = i * 3 + j;
                    row.addComponents(
                        new MessageButton()
                            .setCustomId(index.toString())
                            .setLabel(board[index])
                            .setStyle(board[index] === '-' ? 'SECONDARY' : (board[index] === '❌' ? 'DANGER' : 'PRIMARY'))
                            .setDisabled(board[index] !== '-')
                    );
                }
                components.push(row);
            }
            return components;
        };

        const updateGameMessage = async () => {
            const embed = new MessageEmbed()
                .setTitle('Tic Tac Toe')
                .setColor('#5865F2')
                .setDescription(renderBoard())
                .setFooter(winner ? (winner === 'draw' ? 'It was a draw!' : `**${winner}** won the game!`) : `It's now **${currentPlayer.username}**'s turn!`);

            await interaction.editReply({ embeds: [embed], components: winner ? [] : createButtons() });
        };

        await interaction.deferReply();

        const gameMessage = await interaction.followUp({ embeds: [new MessageEmbed().setTitle('Tic Tac Toe').setColor('#5865F2').setDescription(renderBoard())], components: createButtons() });

        const collector = gameMessage.createMessageComponentCollector({ componentType: 'BUTTON', time: 60000 });

        collector.on('collect', async i => {
            await i.deferUpdate();

            if (i.user.id !== currentPlayer.id) {
                return i.followUp({ content: 'It is not your turn!', ephemeral: true });
            }

            const index = parseInt(i.customId);
            const playerEmoji = currentPlayer.id === interaction.user.id ? '❌' : '⭕';

            if (makeMove(index, playerEmoji)) {
                winner = checkWinner(board);
                currentPlayer = currentPlayer.id === interaction.user.id ? opponent : interaction.user;
                await updateGameMessage();
            }

            if (winner || isAI) {
                collector.stop();
            }
        });

        collector.on('end', async () => {
            if (!winner) {
                winner = 'draw';
                await updateGameMessage();
            }
        });
    },
};
