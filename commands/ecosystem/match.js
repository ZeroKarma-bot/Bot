const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { DateTime } = require('luxon');
const { embedColor } = require('../../config.json');

const KARMA_FILE_PATH = path.join(__dirname, '../../karma.json');

function loadKarmaData() {
    if (!fs.existsSync(KARMA_FILE_PATH)) {
        fs.writeFileSync(KARMA_FILE_PATH, JSON.stringify({ users: {} }, null, 4));
    }
    return JSON.parse(fs.readFileSync(KARMA_FILE_PATH, 'utf8'));
}

function saveKarmaData(data) {
    fs.writeFileSync(KARMA_FILE_PATH, JSON.stringify(data, null, 4));
}

function requiredKarma(level) {
    return 500 + (level - 1) * 500; // Level up requirement starts at 500 and increases by 500 each level
}

function randomMatchPercentage() {
    return Math.floor(Math.random() * 101); // Generates a random percentage between 0 and 100
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('match')
        .setDescription('Match two users and calculate their compatibility')
        .addUserOption(option =>
            option.setName('user1')
                .setDescription('The first user to match')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('user2')
                .setDescription('The second user to match')
                .setRequired(true)),
    async execute(interaction) {
        const user1 = interaction.options.getUser('user1');
        const user2 = interaction.options.getUser('user2');

        if (user1.id === user2.id) {
            return interaction.reply({ content: 'You cannot match a user with themselves.', ephemeral: true });
        }

        const matchPercentage = randomMatchPercentage();
        let data = loadKarmaData();

        const username = interaction.user.username;

        if (!data.users[username]) {
            data.users[username] = {
                karma: 0,
                level: 1,
                last_daily: null,
                streak: 0,
                next_daily: null,
                goodmorning: [],
                goodnight: []
            };
        }

        const user = data.users[username];

        const embed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle('💖 Matchmaker 💖')
            .setDescription(`Matching ${user1} and ${user2}...`)
            .addFields(
                { name: 'Match Percentage', value: `${matchPercentage}%`, inline: true }
            )
            .setFooter({ text: 'Love is in the air!' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        if (matchPercentage >= 90) {
            user.karma += 200;

            let leveledUp = false;
            while (user.karma >= requiredKarma(user.level)) {
                user.karma -= requiredKarma(user.level);
                user.level += 1;
                leveledUp = true;
            }

            data.users[username] = user;
            saveKarmaData(data);

            await interaction.followUp({
                content: `Congratulations! You have earned **200 karma points** for a match percentage of ${matchPercentage}% with ${user2.username}!`,
                ephemeral: true
            });

            if (leveledUp) {
                await interaction.followUp({
                    content: `Congratulations! You have leveled up to **Level ${user.level}**!`,
                    ephemeral: true
                });
            }
        }
    }
};
