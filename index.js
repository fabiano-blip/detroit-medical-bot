const {
  Client,
  GatewayIntentBits,
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelType,
  PermissionFlagsBits,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const fs = require('fs');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const CARGO_STAFF_SUPORTE = '1514334581501722746';
const CARGO_STAFF_DENUNCIA = '1514331164645658675';

const CATEGORIA_SUPORTE = '1514336486504398959';
const CATEGORIA_DENUNCIA = '1514336531538641017';

const CANAIS_TURNO = {
  manha: '1514347318491480174',
  tarde: '1514347412661993472',
  noite: '1514347483361316915',
  madrugada: '1514347555088236784'
};

const ARQUIVO_RGS = './rgs_bloqueados.json';
const ARQUIVO_PONTOS = './pontos_abertos.json';

if (!fs.existsSync(ARQUIVO_RGS)) fs.writeFileSync(ARQUIVO_RGS, JSON.stringify([]));
if (!fs.existsSync(ARQUIVO_PONTOS)) fs.writeFileSync(ARQUIVO_PONTOS, JSON.stringify({}));

function carregarRgs() {
  return JSON.parse(fs.readFileSync(ARQUIVO_RGS));
}

function salvarRgs(rgs) {
  fs.writeFileSync(ARQUIVO_RGS, JSON.stringify(rgs, null, 2));
}

function limparExpirados() {
  const agora = Date.now();
  const rgs = carregarRgs().filter(rg => rg.expiraEm > agora);
  salvarRgs(rgs);
  return rgs;
}

function carregarPontos() {
  return JSON.parse(fs.readFileSync(ARQUIVO_PONTOS));
}

function salvarPontos(pontos) {
  fs.writeFileSync(ARQUIVO_PONTOS, JSON.stringify(pontos, null, 2));
}

function criarEmbedMedicamentos() {
  const rgs = limparExpirados();

  const lista = rgs.length > 0
    ? rgs.map(r => `RG: ${r.rg} | ${r.produto} | Qtd: ${r.quantidade}`).join('\n')
    : 'Nenhum RG bloqueado no momento.';

  return new EmbedBuilder()
    .setColor('#00BFFF')
    .setTitle('💙 Medicamentos')
    .setDescription(`
Olá, doutores!

É por meio deste painel que é possível verificar os RGs já bloqueados para venda.

\`\`\`
${lista}
\`\`\`

Adicione os RGs no bloqueio ou consulte abaixo!

Detroit Medical Center © Detroit Roleplay
`);
}

function criarBotoesMedicamentos() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('adicionar_rg')
      .setLabel('Adicionar RG')
      .setEmoji('💊')
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId('consultar_rg')
      .setLabel('Consultar RG')
      .setEmoji('🔍')
      .setStyle(ButtonStyle.Primary)
  );
}

async function atualizarPainelMedicamentos(interaction) {
  const mensagens = await interaction.channel.messages.fetch({ limit: 20 });

  const painel = mensagens.find(msg =>
    msg.author.id === client.user.id &&
    msg.embeds.length > 0 &&
    msg.embeds[0].title === '💙 Medicamentos'
  );

  if (painel) {
    await painel.edit({
      embeds: [criarEmbedMedicamentos()],
      components: [criarBotoesMedicamentos()]
    });
  }
}

function turnoDentroDoHorario(turno) {
  const hora = new Date().getHours();

  if (turno === 'manha') return hora >= 6 && hora < 12;
  if (turno === 'tarde') return hora >= 12 && hora < 18;
  if (turno === 'noite') return hora >= 18 && hora < 24;
  if (turno === 'madrugada') return hora >= 0 && hora < 6;

  return false;
}

function nomeTurno(turno) {
  if (turno === 'manha') return '🌅 Manhã';
  if (turno === 'tarde') return '☀️ Tarde';
  if (turno === 'noite') return '🌙 Noite';
  if (turno === 'madrugada') return '🌑 Madrugada';
  return 'Turno';
}

function formatarDataHora(timestamp) {
  return new Date(timestamp).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo'
  });
}

client.once(Events.ClientReady, () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {

  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === 'ping') {
      return interaction.reply('🏓 Pong!');
    }

    if (interaction.commandName === 'say') {
      const mensagem = interaction.options.getString('mensagem');

      await interaction.channel.send({
        content: mensagem
      });

      return interaction.reply({
        content: '✅ Mensagem enviada.',
        ephemeral: true
      });
    }

    if (interaction.commandName === 'bateponto') {
      const embed = new EmbedBuilder()
        .setColor('#00BFFF')
        .setTitle('📋 Bate-Ponto | Detroit Medical Center')
        .setDescription(`
Selecione abaixo o seu turno para abrir o ponto.

🌅 **Manhã:** 06:00 às 12:00  
☀️ **Tarde:** 12:00 às 18:00  
🌙 **Noite:** 18:00 às 00:00  
🌑 **Madrugada:** 00:00 às 06:00  

Se abrir fora do horário do turno, será registrado como **PONTO EXTRA**.

Detroit Medical Center © Detroit Roleplay
`);

      const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('abrir_ponto_manha').setLabel('Manhã').setEmoji('🌅').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('abrir_ponto_tarde').setLabel('Tarde').setEmoji('☀️').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('abrir_ponto_noite').setLabel('Noite').setEmoji('🌙').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('abrir_ponto_madrugada').setLabel('Madrugada').setEmoji('🌑').setStyle(ButtonStyle.Primary)
      );

      const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('fechar_ponto').setLabel('Fechar Ponto').setEmoji('✅').setStyle(ButtonStyle.Success)
      );

      return interaction.reply({
        embeds: [embed],
        components: [row1, row2]
      });
    }

    if (interaction.commandName === 'painelmedicamentos') {
      return interaction.reply({
        embeds: [criarEmbedMedicamentos()],
        components: [criarBotoesMedicamentos()]
      });
    }

    if (interaction.commandName === 'painelsuporte') {
      const embed = new EmbedBuilder()
        .setColor('#00BFFF')
        .setTitle('🎫 • Suporte | Detroit Medical Center')
        .setDescription(`
Nós estamos prontos para te ajudar!

Por favor, selecione abaixo a categoria desejada para abrir seu ticket.

⏱️ **Tempo médio de resposta:** até 30 minutos.

⚠️ **Lembre-se:** não abra ticket sem necessidade.

🏥 **Detroit Medical Center © Detroit Roleplay**
`);

      const menu = new StringSelectMenuBuilder()
        .setCustomId('menu_suporte')
        .setPlaceholder('Selecione a categoria desejada.')
        .addOptions([
          { label: 'Suporte Geral', description: 'Suporte Geral do Hospital.', emoji: '🎧', value: 'suporte_geral' },
          { label: 'Bate-Ponto', description: 'Setor de Bate-Ponto.', emoji: '⚖️', value: 'bate_ponto' },
          { label: 'Denúncia', description: 'Denuncie uma situação.', emoji: '📢', value: 'denuncia_suporte' },
          { label: 'Desligamento', description: 'Solicite desligamento.', emoji: '🔵', value: 'desligamento' },
          { label: 'Prêmios', description: 'Resgate prêmios ou benefícios.', emoji: '🎁', value: 'premios' }
        ]);

      return interaction.reply({
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(menu)]
      });
    }

    if (interaction.commandName === 'paineldenuncia') {
      const embed = new EmbedBuilder()
        .setColor('#00BFFF')
        .setTitle('⚖️ Denúncias | Detroit Medical Center')
        .setDescription(`
Caso tenha identificado alguma conduta errada, falta de profissionalismo ou quebra de regras, abra uma denúncia.

Todas as denúncias serão analisadas pela equipe responsável.

⚠️ Denúncias falsas podem gerar punições.

🏥 **Detroit Medical Center © Detroit Roleplay**
`);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('abrir_denuncia_botao')
          .setLabel('Denunciar')
          .setEmoji('🚨')
          .setStyle(ButtonStyle.Danger)
      );

      return interaction.reply({
        embeds: [embed],
        components: [row]
      });
    }
  }

  if (interaction.isButton()) {

    if (interaction.customId.startsWith('abrir_ponto_')) {
      const turno = interaction.customId.replace('abrir_ponto_', '');
      const pontos = carregarPontos();

      if (pontos[interaction.user.id]) {
        return interaction.reply({
          content: '⚠️ Você já tem um ponto aberto. Feche o ponto atual antes de abrir outro.',
          ephemeral: true
        });
      }

      const agora = Date.now();
      const extra = !turnoDentroDoHorario(turno);

      pontos[interaction.user.id] = {
        userId: interaction.user.id,
        username: interaction.user.username,
        turno,
        abertoEm: agora,
        extra
      };

      salvarPontos(pontos);

      const canal = await interaction.guild.channels.fetch(CANAIS_TURNO[turno]);

      const embed = new EmbedBuilder()
        .setColor(extra ? '#FFD700' : '#00BFFF')
        .setTitle('📋 Ponto Aberto')
        .setDescription(`
👤 **Funcionário:** ${interaction.user}
🆔 **ID:** ${interaction.user.id}

🕒 **Abertura:** ${formatarDataHora(agora)}
📌 **Turno:** ${nomeTurno(turno)}

${extra ? '💰 **PONTO EXTRA**' : '✅ **PONTO NORMAL**'}
`);

      await canal.send({ embeds: [embed] });

      return interaction.reply({
        content: `✅ Ponto aberto em **${nomeTurno(turno)}**.${extra ? '\n💰 Registrado como **EXTRA**.' : ''}`,
        ephemeral: true
      });
    }

    if (interaction.customId === 'fechar_ponto') {
      const pontos = carregarPontos();
      const ponto = pontos[interaction.user.id];

      if (!ponto) {
        return interaction.reply({
          content: '⚠️ Você não tem nenhum ponto aberto.',
          ephemeral: true
        });
      }

      const agora = Date.now();
      const tempoMs = agora - ponto.abertoEm;
      const minutos = Math.floor(tempoMs / 60000);
      const horas = Math.floor(minutos / 60);
      const minutosRestantes = minutos % 60;

      const canal = await interaction.guild.channels.fetch(CANAIS_TURNO[ponto.turno]);

      const embed = new EmbedBuilder()
        .setColor(ponto.extra ? '#FFD700' : '#00BFFF')
        .setTitle('✅ Ponto Fechado')
        .setDescription(`
👤 **Funcionário:** ${interaction.user}
🆔 **ID:** ${interaction.user.id}

🕒 **Abertura:** ${formatarDataHora(ponto.abertoEm)}
🕘 **Fechamento:** ${formatarDataHora(agora)}

📌 **Turno:** ${nomeTurno(ponto.turno)}
⏳ **Tempo total:** ${horas}h ${minutosRestantes}m

${ponto.extra ? '💰 **PONTO EXTRA**' : '✅ **PONTO NORMAL**'}
`);

      await canal.send({ embeds: [embed] });

      delete pontos[interaction.user.id];
      salvarPontos(pontos);

      return interaction.reply({
        content: `✅ Ponto fechado com sucesso. Tempo total: **${horas}h ${minutosRestantes}m**.`,
        ephemeral: true
      });
    }

    if (interaction.customId === 'abrir_denuncia_botao') {
      const modal = new ModalBuilder()
        .setCustomId('modal_ticket_denuncia')
        .setTitle('Abrir Denúncia');

      const assunto = new TextInputBuilder()
        .setCustomId('assunto_ticket')
        .setLabel('Descreva o assunto da denúncia')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(assunto));

      return interaction.showModal(modal);
    }

    if (interaction.customId === 'adicionar_rg') {
      const modal = new ModalBuilder()
        .setCustomId('modal_adicionar_rg')
        .setTitle('Adicionar RG Bloqueado');

      const rg = new TextInputBuilder().setCustomId('rg').setLabel('Qual o RG?').setStyle(TextInputStyle.Short).setRequired(true);
      const produto = new TextInputBuilder().setCustomId('produto').setLabel('O que comprou?').setStyle(TextInputStyle.Short).setRequired(true);
      const quantidade = new TextInputBuilder().setCustomId('quantidade').setLabel('Quantos comprou?').setStyle(TextInputStyle.Short).setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(rg),
        new ActionRowBuilder().addComponents(produto),
        new ActionRowBuilder().addComponents(quantidade)
      );

      return interaction.showModal(modal);
    }

    if (interaction.customId === 'consultar_rg') {
      const modal = new ModalBuilder()
        .setCustomId('modal_consultar_rg')
        .setTitle('Consultar RG');

      const rg = new TextInputBuilder()
        .setCustomId('rg_consulta')
        .setLabel('Digite o RG para consultar')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(rg));

      return interaction.showModal(modal);
    }
  }

  if (interaction.isStringSelectMenu()) {
    const categoria = interaction.values[0];

    if (interaction.customId === 'menu_suporte') {
      const modal = new ModalBuilder()
        .setCustomId(`modal_ticket_${categoria}`)
        .setTitle('Abrir Ticket');

      const assunto = new TextInputBuilder()
        .setCustomId('assunto_ticket')
        .setLabel('Descreva o assunto do ticket')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(assunto));

      return interaction.showModal(modal);
    }
  }

  if (interaction.isModalSubmit()) {

    if (interaction.customId === 'modal_adicionar_rg') {
      const rg = interaction.fields.getTextInputValue('rg');
      const produto = interaction.fields.getTextInputValue('produto');
      const quantidade = interaction.fields.getTextInputValue('quantidade');

      const rgs = limparExpirados();

      rgs.push({
        rg,
        produto,
        quantidade,
        autor: interaction.user.id,
        criadoEm: Date.now(),
        expiraEm: Date.now() + 60 * 60 * 1000
      });

      salvarRgs(rgs);
      await atualizarPainelMedicamentos(interaction);

      return interaction.reply({
        content: `✅ RG **${rg}** bloqueado por **1 hora**.`,
        ephemeral: true
      });
    }

    if (interaction.customId === 'modal_consultar_rg') {
      const rgConsulta = interaction.fields.getTextInputValue('rg_consulta');
      const rgs = limparExpirados();

      const encontrado = rgs.find(r => r.rg === rgConsulta);

      await atualizarPainelMedicamentos(interaction);

      if (!encontrado) {
        return interaction.reply({
          content: `✅ O RG **${rgConsulta}** não está bloqueado.`,
          ephemeral: true
        });
      }

      const minutos = Math.ceil((encontrado.expiraEm - Date.now()) / 60000);

      return interaction.reply({
        content: `🚫 O RG **${rgConsulta}** está bloqueado.\n💊 Comprou: **${encontrado.produto}**\n📦 Quantidade: **${encontrado.quantidade}**\n⏳ Tempo restante: **${minutos} minutos**`,
        ephemeral: true
      });
    }

    if (interaction.customId === 'modal_ticket_denuncia') {
      const assunto = interaction.fields.getTextInputValue('assunto_ticket');

      const canal = await interaction.guild.channels.create({
        name: `denuncia-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: CATEGORIA_DENUNCIA,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
          { id: CARGO_STAFF_DENUNCIA, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
        ]
      });

      const embed = new EmbedBuilder()
        .setColor('#00BFFF')
        .setTitle('📢 Denúncia')
        .setDescription(`
<@&${CARGO_STAFF_DENUNCIA}>

👤 **Autor:** ${interaction.user}

📝 **Assunto:**
${assunto}

A equipe responsável irá analisar o caso.
`);

      await canal.send({
        content: `<@&${CARGO_STAFF_DENUNCIA}>`,
        embeds: [embed]
      });

      return interaction.reply({
        content: `✅ Denúncia criada com sucesso: ${canal}`,
        ephemeral: true
      });
    }

    if (interaction.customId.startsWith('modal_ticket_')) {
      const categoria = interaction.customId.replace('modal_ticket_', '');
      const assunto = interaction.fields.getTextInputValue('assunto_ticket');

      let nomeCategoria = 'ticket';
      let titulo = '🎫 Novo Ticket';
      let cargoStaff = CARGO_STAFF_SUPORTE;
      let categoriaCanal = CATEGORIA_SUPORTE;

      if (categoria === 'suporte_geral') {
        nomeCategoria = 'suporte-geral';
        titulo = '🎧 Suporte Geral';
      }

      if (categoria === 'bate_ponto') {
        nomeCategoria = 'bate-ponto';
        titulo = '⚖️ Bate-Ponto';
      }

      if (categoria === 'denuncia_suporte') {
        nomeCategoria = 'denuncia';
        titulo = '📢 Denúncia';
      }

      if (categoria === 'desligamento') {
        nomeCategoria = 'desligamento';
        titulo = '🔵 Desligamento';
      }

      if (categoria === 'premios') {
        nomeCategoria = 'premios';
        titulo = '🎁 Prêmios';
      }

      const canal = await interaction.guild.channels.create({
        name: `${nomeCategoria}-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: categoriaCanal,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
          { id: cargoStaff, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
        ]
      });

      const embed = new EmbedBuilder()
        .setColor('#00BFFF')
        .setTitle(titulo)
        .setDescription(`
<@&${cargoStaff}>

👤 **Autor:** ${interaction.user}

📌 **Categoria:** ${titulo}

📝 **Assunto:**
${assunto}

Aguarde a equipe responsável atender.
`);

      await canal.send({
        content: `<@&${cargoStaff}>`,
        embeds: [embed]
      });

      return interaction.reply({
        content: `✅ Ticket criado com sucesso: ${canal}`,
        ephemeral: true
      });
    }
  }
});

client.login(process.env.TOKEN).catch(console.error);