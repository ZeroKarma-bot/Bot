const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { embedColor } = require('../../config.json'); // Fetch the embed color from config.json

const quotes = [
  "“I'm gonna make him an offer he can't refuse.” – The Godfather (1972)",
  "“May the Force be with you.” – Star Wars (1977)",
  "“You talking to me?” – Taxi Driver (1976)",
  "“Here's looking at you, kid.” – Casablanca (1942)",
  "“Go ahead, make my day.” – Sudden Impact (1983)",
  "“I love the smell of napalm in the morning.” – Apocalypse Now (1979)",
  "“Say hello to my little friend!” – Scarface (1983)",
  "“Why so serious?” – The Dark Knight (2008)",
  "“I'm king of the world!” – Titanic (1997)",
  "“You can't handle the truth!” – A Few Good Men (1992)",
  "“I'll be back.” – The Terminator (1984)",
  "“Here's Johnny!” – The Shining (1980)",
  "“E.T. phone home.” – E.T. the Extra-Terrestrial (1982)",
  "“To infinity and beyond!” – Toy Story (1995)",
  "“Houston, we have a problem.” – Apollo 13 (1995)",
  "“There's no place like home.” – The Wizard of Oz (1939)",
  "“I'm walking here! I'm walking here!” – Midnight Cowboy (1969)",
  "“You had me at ‘hello.’” – Jerry Maguire (1996)",
  "“Hasta la vista, baby.” – Terminator 2: Judgment Day (1991)",
  "“You’re gonna need a bigger boat.” – Jaws (1975)",
  "“I feel the need – the need for speed.” – Top Gun (1986)",
  "“Life is like a box of chocolates. You never know what you're gonna get.” – Forrest Gump (1994)",
  "“Keep your friends close, but your enemies closer.” – The Godfather Part II (1974)",
  "“I see dead people.” – The Sixth Sense (1999)",
  "“Nobody puts Baby in a corner.” – Dirty Dancing (1987)",
  "“I’ll have what she’s having.” – When Harry Met Sally (1989)",
  "“If you build it, he will come.” – Field of Dreams (1989)",
  "“Just keep swimming.” – Finding Nemo (2003)",
  "“I am serious. And don't call me Shirley.” – Airplane! (1980)",
  "“I’m the king of the world!” – Titanic (1997)",
  "“Show me the money!” – Jerry Maguire (1996)",
  "“It’s alive! It’s alive!” – Frankenstein (1931)",
  "“My precious.” – The Lord of the Rings: The Two Towers (2002)",
  "“You’re killin’ me, Smalls.” – The Sandlot (1993)",
  "“I’ll be back.” – The Terminator (1984)",
  "“You can’t handle the truth!” – A Few Good Men (1992)",
  "“I see dead people.” – The Sixth Sense (1999)",
  "“I’m the king of the world!” – Titanic (1997)",
  "“To infinity and beyond!” – Toy Story (1995)",
  "“I am your father.” – Star Wars: Episode V – The Empire Strikes Back (1980)",
  "“The first rule of Fight Club is: You do not talk about Fight Club.” – Fight Club (1999)",
  "“Bond. James Bond.” – Dr. No (1962)",
  "“It’s not a man purse. It’s called a satchel. Indiana Jones wears one.” – The Hangover (2009)",
  "“I am Groot.” – Guardians of the Galaxy (2014)",
  "“I’ll have what she’s having.” – When Harry Met Sally (1989)",
  "“You’re gonna need a bigger boat.” – Jaws (1975)",
  "“I’m the Dude, so that’s what you call me.” – The Big Lebowski (1998)",
  "“I am serious. And don’t call me Shirley.” – Airplane! (1980)",
  "“I will find you, and I will kill you.” – Taken (2008)",
  "“Keep the change, ya filthy animal.” – Home Alone (1990)",
  "“You’re tearing me apart, Lisa!” – The Room (2003)",
  "“I’m just one stomach flu away from my goal weight.” – The Devil Wears Prada (2006)",
  "“We’re not in Kansas anymore.” – The Wizard of Oz (1939)",
  "“I drink your milkshake!” – There Will Be Blood (2007)",
  "“I’m having an old friend for dinner.” – The Silence of the Lambs (1991)",
  "“You make me want to be a better man.” – As Good as It Gets (1997)",
  "“You can’t sit with us!” – Mean Girls (2004)",
  "“They may take our lives, but they’ll never take our freedom!” – Braveheart (1995)",
  "“You’re a wizard, Harry.” – Harry Potter and the Sorcerer’s Stone (2001)",
  "“It’s called a hustle, sweetheart.” – Zootopia (2016)",
  "“I volunteer as tribute!” – The Hunger Games (2012)",
  "“You can’t handle the truth!” – A Few Good Men (1992)",
  "“I am Iron Man.” – Iron Man (2008)",
  "“You talkin’ to me?” – Taxi Driver (1976)",
  "“Here’s looking at you, kid.” – Casablanca (1942)",
  "“You had me at ‘hello.’” – Jerry Maguire (1996)",
  "“There’s no place like home.” – The Wizard of Oz (1939)",
  "“I love the smell of napalm in the morning.” – Apocalypse Now (1979)",
  "“I see dead people.” – The Sixth Sense (1999)",
  "“May the Force be with you.” – Star Wars (1977)",
  "“You’re gonna need a bigger boat.” – Jaws (1975)",
  "“I’ll be back.” – The Terminator (1984)",
  "“It’s alive! It’s alive!” – Frankenstein (1931)",
  "“You can’t handle the truth!” – A Few Good Men (1992)",
  "“I am serious. And don’t call me Shirley.” – Airplane! (1980)",
  "“I drink your milkshake!” – There Will Be Blood (2007)",
  "“You’re killin’ me, Smalls.” – The Sandlot (1993)",
  "“I volunteer as tribute!” – The Hunger Games (2012)",
  "“I am Groot.” – Guardians of the Galaxy (2014)",
  "“You can’t sit with us!” – Mean Girls (2004)",
  "“It’s called a hustle, sweetheart.” – Zootopia (2016)",
  "“My precious.” – The Lord of the Rings: The Two Towers (2002)",
  "“You’re a wizard, Harry.” – Harry Potter and the Sorcerer’s Stone (2001)",
  "“I’m just one stomach flu away from my goal weight.” – The Devil Wears Prada (2006)",
  "“Keep the change, ya filthy animal.” – Home Alone (1990)",
  "“You make me want to be a better man.” – As Good as It Gets (1997)",
  "“I will find you, and I will kill you.” – Taken (2008)",
  "“I’m the Dude, so that’s what you call me.” – The Big Lebowski (1998)",
  "“It’s not a man purse. It’s called a satchel. Indiana Jones wears one.” – The Hangover (2009)",
  "“Bond. James Bond.” – Dr. No (1962)",
  "“The first rule of Fight Club is: You do not talk about Fight Club.” – Fight Club (1999)"
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('moviequote')
    .setDescription('Share a random movie quote.'),
  async execute(interaction) {
    try {
      let randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      let [quote, movieInfo] = randomQuote.split(' – ');
      let formattedQuote = `**${quote}** – ${movieInfo}`;

      const embed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle('🎬 Random Movie Quote')
        .setDescription(formattedQuote)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error fetching fact:', error);
        await interaction.reply({ content: 'There was an error fetching your fact. Please try again later.', ephemeral: true });
      }
    },
};