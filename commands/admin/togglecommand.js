const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');

const commandStatesPath = path.join(__dirname, '../../commandStates.json');
const adminCommandStatesPath = path.join(__dirname, '../../adminCommandStates.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('togglecommand')
        .setDescription('Enable or disable a command for this server')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('The name of the command to enable/disable')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('status')
                .setDescription('Enable or disable the command')
                .setRequired(true)
                .addChoices(
                    { name: 'Enable', value: 'enable' },
                    { name: 'Disable', value: 'disable' }
                )),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const commandName = interaction.options.getString('name');
        const status = interaction.options.getString('status');
        const guildId = interaction.guild.id;

        try {
            // Check if the user has the ADMINISTRATOR permission
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                const embed = new EmbedBuilder()
                    .setColor('#8B0000') // Dark red color
                    .setTitle('Error')
                    .setDescription('You do not have permission to use this command.')
                    .setTimestamp();
                return interaction.editReply({ embeds: [embed] });
            }

            // Check if the command exists
            if (!interaction.client.commands.has(commandName)) {
                const embed = new EmbedBuilder()
                    .setColor('#8B0000') // Dark red color
                    .setTitle('Error')
                    .setDescription(`The command \`${commandName}\` does not exist.`)
                    .setTimestamp();
                return interaction.editReply({ embeds: [embed] });
            }

            // Load admin command states
            let adminCommandStates = {};
            if (fs.existsSync(adminCommandStatesPath)) {
                try {
                    adminCommandStates = JSON.parse(fs.readFileSync(adminCommandStatesPath, 'utf8'));
                } catch (error) {
                    console.error('Error reading admin command states:', error.message);
                    const embed = new EmbedBuilder()
                        .setColor('#8B0000') // Dark red color
                        .setTitle('Error')
                        .setDescription('An error occurred while reading admin command states.')
                        .setTimestamp();
                    return interaction.editReply({ embeds: [embed] });
                }
            }

            // Check if the command is globally disabled
            if (adminCommandStates[commandName] === false && status === 'enable') {
                const embed = new EmbedBuilder()
                    .setColor('#8B0000') // Dark red color
                    .setTitle('Error')
                    .setDescription(`The command \`${commandName}\` has been disabled by an admin and cannot be re-enabled.`)
                    .setTimestamp();
                return interaction.editReply({ embeds: [embed] });
            }

            // Load command states
            let commandStates = {};
            if (fs.existsSync(commandStatesPath)) {
                try {
                    commandStates = JSON.parse(fs.readFileSync(commandStatesPath, 'utf8'));
                } catch (error) {
                    console.error('Error reading command states:', error.message);
                    const embed = new EmbedBuilder()
                        .setColor('#8B0000') // Dark red color
                        .setTitle('Error')
                        .setDescription('An error occurred while reading command states.')
                        .setTimestamp();
                    return interaction.editReply({ embeds: [embed] });
                }
            }

            if (!commandStates[guildId]) {
                commandStates[guildId] = { commands: {} };
            }

            // Enable or disable the command
            commandStates[guildId].commands[commandName] = (status === 'enable');

            // Save the command states
            try {
                fs.writeFileSync(commandStatesPath, JSON.stringify(commandStates, null, 2));
            } catch (error) {
                console.error('Error writing command states:', error.message);
                const embed = new EmbedBuilder()
                    .setColor('#8B0000') // Dark red color
                    .setTitle('Error')
                    .setDescription('An error occurred while saving command states.')
                    .setTimestamp();
                return interaction.editReply({ embeds: [embed] });
            }

            const embed = new EmbedBuilder()
                .setTitle('Toggle Command')
                .setDescription(`Command \`${commandName}\` has been ${status === 'enable' ? 'enabled' : 'disabled'} for this server.`)
                .setColor(status === 'enable' ? '#00FF00' : '#FF0000')
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error executing togglecommand:', error.message);
            const embed = new EmbedBuilder()
                .setColor('#8B0000') // Dark red color
                .setTitle('Error')
                .setDescription('An unexpected error occurred while executing the command.')
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
    }
};
