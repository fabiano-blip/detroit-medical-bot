const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [

  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Responde com Pong!'),

  new SlashCommandBuilder()
    .setName('painelsuporte')
    .setDescription('Envia o painel de suporte'),

  new SlashCommandBuilder()
    .setName('paineldenuncia')
    .setDescription('Envia o painel de denúncias'),

  new SlashCommandBuilder()
    .setName('painelmedicamentos')
    .setDescription('Envia o painel de medicamentos'),

  new SlashCommandBuilder()
    .setName('bateponto')
    .setDescription('Envia o painel de bate ponto'),

  new SlashCommandBuilder()
    .setName('say')
    .setDescription('Faz o bot enviar uma mensagem')
    .addStringOption(option =>
      option
        .setName('mensagem')
        .setDescription('Mensagem para enviar')
        .setRequired(true)
    )

].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {

    console.log('Registrando comandos...');

    await rest.put(
      Routes.applicationGuildCommands(
        '1514296124373073921', // Application ID do bot
        '1514278413307875521'  // ID do servidor
      ),
      { body: commands }
    );

    console.log('✅ Comandos registrados com sucesso!');

  } catch (error) {
    console.error(error);
  }
})();