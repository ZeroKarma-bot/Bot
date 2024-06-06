const fs = require('fs');

module.exports = (client) => {
  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    // Check global command state
    const globalCommandStatesPath = './adminCommandStates.json';
    let globalCommandStates = {};
    if (fs.existsSync(globalCommandStatesPath)) {
      globalCommandStates = JSON.parse(fs.readFileSync(globalCommandStatesPath, 'utf8'));
    }

    if (globalCommandStates[interaction.commandName] === false) {
      return interaction.reply({ content: 'The admin of this bot has disabled this command.', ephemeral: true });
    }

    // Check server-specific command state
    const commandStatesPath = `./commandStates_${interaction.guild.id}.json`;
    let commandStates = {};
    if (fs.existsSync(commandStatesPath)) {
      commandStates = JSON.parse(fs.readFileSync(commandStatesPath, 'utf8'));
    }

    if (commandStates[interaction.commandName] === false) {
      return interaction.reply({ content: 'This command has been disabled on this server.', ephemeral: true });
    }

    try {
      await interaction.deferReply(); // Defer the reply to give more time for command execution
      await command.execute(interaction);
      await interaction.followUp({ content: 'Command executed successfully!' });
    } catch (error) {
      console.error(error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      } else {
        await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    }
  });
};
