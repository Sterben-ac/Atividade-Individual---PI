create database sterben;
use sterben;

create table usuario (
idUsuario int primary key auto_increment,
nome varchar (20) not null unique,
email varchar (100) not null unique,
senha varchar (50) not null,
dtCadastro datetime default current_timestamp
);

-- 1:1 → o fkUsuario é unique: cada usuário tem no máximo uma conta Roblox
create table contaRoblox (
idContaRoblox int primary key auto_increment,
robloxId varchar (20) not null,
dtVinculo datetime default current_timestamp,
fkUsuario int unique,
constraint fkContaUsuario foreign key (fkUsuario) references usuario (idUsuario)
);

create table pergunta (
idPergunta int primary key,
texto varchar (200)
);

-- 1:N → um usuário faz várias tentativas
create table tentativa (
idTentativa int primary key auto_increment,
acertos int,
total int,
dtTentativa datetime default current_timestamp,
fkUsuario int,
constraint fkTentativaUsuario foreign key (fkUsuario) references usuario (idUsuario),
constraint chkAcertos check (acertos between 0 and total)
);

-- N:N → tentativa x pergunta (tabela associativa)
create table resposta (
fkTentativa int,
fkPergunta int,
acertou tinyint,
constraint chkAcertou check (acertou in (0, 1)),
constraint fkRespostaTentativa foreign key (fkTentativa) references tentativa (idTentativa),
constraint fkRespostaPergunta foreign key (fkPergunta) references pergunta (idPergunta),
constraint pkComposta primary key (fkTentativa, fkPergunta)
);

insert into pergunta values
(1, 'Em que ano o Roblox foi lançado oficialmente?'),
(2, 'Quem fundou o Roblox?'),
(3, 'Além do Robux, qual moeda existia no Roblox até 2016?'),
(4, 'Como eram chamados os jogadores que entravam sem ter conta?'),
(5, 'Em que ano o modo convidado saiu do Roblox no PC?'),
(6, 'Qual programa os criadores usam para fazer jogos no Roblox?'),
(7, 'De onde vem o nome "Roblox"?'),
(8, 'Qual cabelo padrão virou apelido para jogadores iniciantes?'),
(9, 'Em que ano o som clássico de "oof" foi substituído?'),
(10, 'Qual jogo do Roblox, lançado em 2025, bateu o recorde mundial de jogadores simultâneos e passou o Fortnite?');
