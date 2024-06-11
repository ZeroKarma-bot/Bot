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
        .setName('karma')
        .setDescription('Karma commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('check')
                .setDescription('Check your karma balance and level'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('daily')
                .setDescription('Claim your daily karma')),
    async execute(interaction) {
        const username = interaction.user.username;
        const userDM = await interaction.user.createDM();
        let data = loadKarmaData();

        if (!data.users[username]) {
            data.users[username] = {
                karma: 0,
                level: 1,
                last_daily: null,
                streak: 0,
                next_daily: null
            };
            saveKarmaData(data);
        }

        const user = data.users[username];

        if (interaction.options.getSubcommand() === 'check') {
            const currentKarma = user.karma;
            const currentLevel = user.level;
            const nextLevelKarma = requiredKarma(currentLevel);

            const embed = new EmbedBuilder()
                .setColor(embedColor)
                .setTitle('Karma Status')
                .setDescription(`**${username}** - Karma Status`)
                .addFields(
                    { name: 'Current Karma', value: `\`${currentKarma}/${nextLevelKarma}\``, inline: false },
                    { name: 'Current Level', value: `**${currentLevel}**`, inline: false },
                    { name: 'Karma Needed for Next Level', value: `\`${nextLevelKarma - currentKarma}\``, inline: false }
                )
                .setFooter({ text: 'Keep earning karma to level up!' });

            await interaction.reply({ embeds: [embed] });
        } else if (interaction.options.getSubcommand() === 'daily') {
            const now = DateTime.utc();

            if (user.next_daily && now < DateTime.fromISO(user.next_daily)) {
                const nextAvailable = DateTime.fromISO(user.next_daily);
                const timeRemaining = nextAvailable.diff(now, ['hours', 'minutes']).toObject();

                const embed = new EmbedBuilder()
                    .setColor(embedColor)
                    .setTitle('Daily Karma')
                    .setDescription(`You cannot use this command yet. Next available in **${Math.floor(timeRemaining.hours)} hours and ${Math.floor(timeRemaining.minutes)} minutes**.`);

                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            let dailyKarma;
            if (user.last_daily) {
                const lastDaily = DateTime.fromISO(user.last_daily);
                if (now < lastDaily.plus({ hours: 48 })) {
                    user.streak += 1;
                    dailyKarma = 100 + (user.streak * 20); // Increase daily karma by 20 for each streak day
                } else {
                    // User has lost their streak
                    await userDM.send(`You have lost your streak of **${user.streak}** because you haven't used the \`/karma\` daily command.`);
                    user.streak = 1;
                    dailyKarma = 110; // Reset daily karma to 110 if streak is lost
                }
            } else {
                user.streak = 1;
                dailyKarma = 110; // Initial daily karma amount
            }

            user.last_daily = now.toISO();
            user.next_daily = now.plus({ hours: 24 }).toISO();
            user.karma += dailyKarma; // Directly update the user's karma here

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
                .setTitle('🎉 Daily Karma Claimed! 🎉')
                .setDescription(`Daily karma claimed! You received **${dailyKarma}** karma points. Current streak: **${user.streak}** days.`);

            await interaction.reply({ embeds: [embed] });

            if (leveledUp) {
                await interaction.followUp({
                    content: `Congratulations! You have leveled up to **Level ${user.level}**!`,
                    ephemeral: true
                });
            }
        }
    }
};
