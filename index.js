const http = require("http");

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.end(`
    <html>
      <head>
        <title>Your Web View</title>
      </head>
      <body style="margin: 0; padding: 0;">
        <iframe width="100%" height="100%" src="https://axocoder.vercel.app/" frameborder="0" allowfullscreen></iframe>
      </body>
    </html>`);
});

server.listen(3000, () => {
  console.log("Server Online because of Axo Coder ✅!!");
});

const {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
  EmbedBuilder,
  ActivityType,
} = require("discord.js");
const path = require("path");
const fs = require("fs");
const { token, clientId } = require("./config.json");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.commands = new Collection();
const commandStatesPath = path.join(__dirname, "commandStates.json");
const adminCommandStatesPath = path.join(__dirname, "adminCommandStates.json");
let commandStates = {};
let adminCommandStates = {};

// Function to load command states
const loadCommandStates = () => {
  try {
    if (fs.existsSync(commandStatesPath)) {
      const data = fs.readFileSync(commandStatesPath, "utf8");
      commandStates = JSON.parse(data);
      console.log("Command states loaded:", commandStates);
    } else {
      commandStates = {};
    }
  } catch (error) {
    console.error("Error loading command states:", error.message);
  }
};

// Function to load admin command states
const loadAdminCommandStates = () => {
  try {
    if (fs.existsSync(adminCommandStatesPath)) {
      const data = fs.readFileSync(adminCommandStatesPath, "utf8");
      adminCommandStates = JSON.parse(data);
      console.log("Admin command states loaded:", adminCommandStates);
    } else {
      adminCommandStates = {};
    }
  } catch (error) {
    console.error("Error loading admin command states:", error.message);
  }
};

// Load command states initially
loadCommandStates();

// Load admin command states initially
loadAdminCommandStates();

// Watch for changes in the commandStates.json file
fs.watch(commandStatesPath, (eventType, filename) => {
  if (eventType === "change") {
    console.log("commandStates.json file changed, reloading...");
    loadCommandStates();
  }
});

// Watch for changes in the adminCommandStates.json file
fs.watch(adminCommandStatesPath, (eventType, filename) => {
  if (eventType === "change") {
    console.log("adminCommandStates.json file changed, reloading...");
    loadAdminCommandStates();
  }
});

// Function to recursively read command files from subdirectories
const readCommands = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      readCommands(filePath);
    } else if (file.endsWith(".js")) {
      const command = require(filePath);
      if (command.data && command.data.name) {
        client.commands.set(command.data.name, command);
      } else {
        console.warn(
          `The command at ${filePath} is missing a required "data" or "data.name" property.`,
        );
      }
    }
  }
};

// Load slash commands
readCommands(path.join(__dirname, "commands"));

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const commands = [];
  client.commands.forEach((command) => {
    if (command.data && command.data.toJSON) {
      commands.push(command.data.toJSON());
    } else {
      console.warn(
        `The command ${command.data.name} is missing a required "data" or "data.toJSON" method.`,
      );
    }
  });

  const rest = new REST({ version: "10" }).setToken(token);

  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(clientId), { body: commands });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }

  // Set up a custom presence that changes periodically
  const activities = [
    { name: "with Karma", type: ActivityType.Playing },
    { name: "Over the Server!", type: ActivityType.Watching },
    { name: "Commands", type: ActivityType.Listening },
    { name: "The Community!", type: ActivityType.Watching },
    { name: "for New Updates!", type: ActivityType.Watching },
  ];
  let activityIndex = 0;

  setInterval(() => {
    client.user.setActivity(activities[activityIndex]);
    activityIndex = (activityIndex + 1) % activities.length;
  }, 10000); // Change presence every 10 seconds
});

client.on("interactionCreate", async (interaction) => {
  // Check if the interaction is in a guild
  if (!interaction.guild) {
    return;
  }

  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  const guildId = interaction.guild.id;

  // Check if the command is disabled by the admin
  if (adminCommandStates[interaction.commandName] === false) {
    const embed = new EmbedBuilder()
      .setColor("#8B0000") // Dark red color
      .setTitle("Error")
      .setDescription(
        `The command \`${interaction.commandName}\` has been disabled by an \`ADMIN\` of this bot and cannot be used.`,
      )
      .setTimestamp();

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // Check if the command is disabled for the specific server
  if (
    commandStates[guildId] &&
    commandStates[guildId].commands &&
    commandStates[guildId].commands[interaction.commandName] === false
  ) {
    const embed = new EmbedBuilder()
      .setColor("#8B0000") // Dark red color
      .setTitle("Command Disabled")
      .setDescription(
        `The command \`${interaction.commandName}\` has been disabled on this server.`,
      )
      .setTimestamp();

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error("Error executing command:", error);
    const embed = new EmbedBuilder()
      .setColor("#8B0000") // Dark red color
      .setTitle("Error")
      .setDescription("There was an error while executing this command!")
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
});

client.login(token);
