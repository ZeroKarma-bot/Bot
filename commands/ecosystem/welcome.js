const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { DateTime } = require('luxon');
const { embedColor } = require('../../config.json');

const KARMA_FILE_PATH = path.join(__dirname, './karma.json');

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
        .setName('welcome')
        .setDescription('Welcome a new user and earn karma')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The new user you want to welcome')
                .setRequired(true)),
    async execute(interaction) {
        const username = interaction.user.username;
        const targetUser = interaction.options.getUser('user');
        const guildMember = interaction.guild.members.cache.get(targetUser.id);

        const joinDate = DateTime.fromJSDate(guildMember.joinedAt);
        const now = DateTime.utc();

        // Check if the user has been on the server for longer than a day
        if (now.diff(joinDate, 'hours').hours > 24) {
            return interaction.reply({ content: 'This user has been on the server for longer than a day.', ephemeral: true });
        }

        let data = loadKarmaData();

        if (!data.users[username]) {
            data.users[username] = {
                karma: 0,
                level: 1,
                last_daily: null,
                streak: 0,
                next_daily: null,
                goodmorning: [],
                goodnight: [],
                welcomed: []
            };
        }

        const user = data.users[username];
        if (!user.welcomed) {
            user.welcomed = [];
        }

        // Check if the user has already been welcomed
        if (user.welcomed.includes(targetUser.id)) {
            return interaction.reply({ content: 'You have already welcomed this user.', ephemeral: true });
        }

        user.welcomed.push(targetUser.id);
        user.karma += 30;

        let leveledUp = false;
        while (user.karma >= requiredKarma(user.level)) {
            user.karma -= requiredKarma(user.level);
            user.level += 1;
            leveledUp = true;
        }

        data.users[username] = user;
        saveKarmaData(data);

        const embed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle('👋 Welcome!')
            .setDescription(`Welcome to the server, ${targetUser}! We're glad to have you here! 🎉`)
            .setFooter({ text: 'Make yourself at home!' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        await interaction.followUp({
            content: `You have gained **30 karma points** for welcoming ${targetUser.username}!`,
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
