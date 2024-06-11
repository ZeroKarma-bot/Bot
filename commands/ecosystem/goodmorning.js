const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { DateTime } = require('luxon');
const { embedColor } = require('../../config.json');

const KARMA_FILE_PATH = path.join(__dirname, '../../karma.json'); // Updated path

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

module.exports = {
    data: new SlashCommandBuilder()
        .setName('goodmorning')
        .setDescription('Greet another user and earn karma')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user you want to greet')
                .setRequired(true)),
    async execute(interaction) {
        const username = interaction.user.username;
        const targetUser = interaction.options.getUser('user');

        if (targetUser.id === interaction.user.id) {
            return interaction.reply({ content: 'You cannot use this command on yourself.', ephemeral: true });
        }

        let data = loadKarmaData();

        if (!data.users[username]) {
            data.users[username] = {
                karma: 0,
                level: 1,
                last_daily: null,
                streak: 0,
                next_daily: null,
                goodmorning: []
            };
        }

        const user = data.users[username];
        if (!user.goodmorning) {
            user.goodmorning = [];
        }

        const now = DateTime.utc();

        // Filter out entries older than 24 hours
        user.goodmorning = user.goodmorning.filter(timestamp => DateTime.fromISO(timestamp).plus({ hours: 24 }) > now);

        if (user.goodmorning.length >= 3) {
            const embed = new EmbedBuilder()
                .setColor(embedColor)
                .setTitle('🌞 Good Morning!')
                .setDescription(`Good morning, ${targetUser}! Have a great day ahead! 🌞`)
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        user.goodmorning.push(now.toISO());
        user.karma += 20;

        let leveledUp = false;
        while (user.karma >= requiredKarma(user.level)) {
            user.karma -= requiredKarma(user.level);
            user.level += 1;
            leveledUp = true;
        }

        data.users[username] = user; // Ensure the updated user data is saved
        saveKarmaData(data);

        const embed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle('🌞 Good Morning!')
            .setDescription(`Good morning, ${targetUser}! Have a great day ahead! 🌞`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        await interaction.followUp({
            content: `You have gained **20 karma points** for greeting ${targetUser.username}!`,
            ephemeral: true
        });

        if (leveledUp) {
            await interaction.followUp({
                content: `Congratulations! You have leveled up to **Level ${user.level}**!`,
                ephemeral: true
            });
        }
    }
};
