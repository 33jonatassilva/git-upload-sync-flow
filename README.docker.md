
# Infra Tools - Setup Docker (Windows 10 Pro 22H2)

## Pré-requisitos

Certifique-se de ter instalado na sua VM Windows:
- [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
- Windows 10 Pro 22H2 (versão necessária para Docker Desktop)
- WSL2 habilitado (recomendado para melhor performance)

### Configuração Inicial do Docker Desktop

1. **Instalar Docker Desktop**:
   - Baixe o Docker Desktop para Windows
   - Execute como administrador
   - Reinicie o sistema quando solicitado

2. **Habilitar WSL2** (Recomendado):
   ```cmd
   # Executar no PowerShell como administrador
   dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
   dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
   
   # Reiniciar o sistema e baixar o kernel do WSL2
   # https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi
   
   wsl --set-default-version 2
   ```

3. **Configurar Docker Desktop**:
   - Abra Docker Desktop
   - Vá em Settings > General
   - Marque "Use WSL 2 based engine" (se disponível)
   - Em Resources > WSL Integration, habilite a integração

## 🚀 Deploy Rápido

### Para Produção
```cmd
REM Executar no prompt de comando ou PowerShell
deploy.bat
```

### Para Desenvolvimento
```cmd
REM Executar no prompt de comando ou PowerShell
dev.bat
```

## 📋 Deploy Manual

### Desenvolvimento
```cmd
REM Build e start dos containers
docker-compose -f docker-compose.dev.yml up --build

REM Ou em background
docker-compose -f docker-compose.dev.yml up -d --build
```

### Produção
```cmd
REM Build e start
docker-compose up --build

REM Ou em background
docker-compose up -d --build
```

A aplicação estará disponível em `http://localhost:8080`

## 💾 Persistência de Dados

### Localização dos Dados no Windows
- **Volume Docker**: `database_data` (gerenciado pelo Docker)
- **Localização física**: `C:\ProgramData\docker\volumes\database_data\_data`

### Backup dos Dados (Windows)
```cmd
REM Criar backup
docker run --rm -v database_data:/data -v %cd%:/backup alpine tar czf /backup/backup-%date:~-4,4%%date:~-7,2%%date:~-10,2%-%time:~0,2%%time:~3,2%.tar.gz -C /data .

REM Restaurar backup (substituir YYYYMMDD-HHMM pelo nome do arquivo)
docker run --rm -v database_data:/data -v %cd%:/backup alpine tar xzf /backup/backup-YYYYMMDD-HHMM.tar.gz -C /data
```

### Backup Alternativo (PowerShell)
```powershell
# Criar backup com PowerShell
$date = Get-Date -Format "yyyyMMdd-HHmm"
docker run --rm -v database_data:/data -v ${PWD}:/backup alpine tar czf /backup/backup-$date.tar.gz -C /data .

# Restaurar backup
docker run --rm -v database_data:/data -v ${PWD}:/backup alpine tar xzf /backup/backup-YYYYMMDD-HHMM.tar.gz -C /data
```

## 🔧 Comandos Úteis (Windows)

```cmd
REM Ver logs em tempo real
docker-compose logs -f app

REM Ver logs do desenvolvimento
docker-compose -f docker-compose.dev.yml logs -f app

REM Parar containers
docker-compose down

REM Parar containers de desenvolvimento
docker-compose -f docker-compose.dev.yml down

REM Limpar volumes (⚠️ apaga dados do banco)
docker-compose down -v

REM Rebuild sem cache
docker-compose build --no-cache

REM Entrar no container
docker-compose exec app sh

REM Verificar status dos containers
docker-compose ps

REM Ver uso de recursos
docker stats
```

## 🐛 Resolução de Problemas (Windows)

### Docker Desktop não inicia
```cmd
REM Verificar se o serviço está rodando
sc query com.docker.service

REM Reiniciar serviços do Docker
net stop com.docker.service
net start com.docker.service

REM Ou reiniciar Docker Desktop via interface
```

### Erro de permissões
```cmd
REM Executar prompt como administrador
REM Verificar se Docker Desktop está rodando

REM Recriar volume do banco
docker-compose down -v
docker-compose up --build
```

### WSL2 não funciona
```cmd
REM Verificar se WSL2 está instalado
wsl --list --verbose

REM Atualizar WSL2
wsl --update

REM Definir WSL2 como padrão
wsl --set-default-version 2
```

### Problemas de rede/firewall
```cmd
REM Verificar se a porta 8080 está livre
netstat -an | findstr :8080

REM Configurar firewall Windows (executar como admin)
netsh advfirewall firewall add rule name="Docker-8080" dir=in action=allow protocol=TCP localport=8080
```

### Performance lenta
1. **Aumentar recursos do Docker**:
   - Docker Desktop > Settings > Resources
   - Aumentar CPU e Memory conforme necessário
   - Recomendado: 4 CPUs, 8GB RAM

2. **Usar WSL2** para melhor performance:
   - Seguir passos de configuração WSL2 acima

3. **Limpar recursos**:
   ```cmd
   docker system prune -a
   docker volume prune
   ```

## 🖥️ Configuração da VM Windows

### Requisitos Mínimos
- **CPU**: 4 cores (com Hyper-V)
- **RAM**: 8GB (4GB para Windows + 4GB para Docker)
- **Disco**: 50GB livres
- **SO**: Windows 10 Pro 22H2 (necessário para Docker Desktop)

### Recursos Recomendados
- **CPU**: 6-8 cores
- **RAM**: 12-16GB
- **Disco**: SSD com 100GB livres

### Configurações Importantes
1. **Habilitar Hyper-V**:
   ```cmd
   REM Executar como administrador
   DISM /Online /Enable-Feature /All /FeatureName:Microsoft-Hyper-V
   ```

2. **Configurar Firewall**:
   ```cmd
   REM Executar como administrador
   netsh advfirewall firewall add rule name="Infra-Tools" dir=in action=allow protocol=TCP localport=8080
   ```

3. **Configurar Energia**:
   - Definir plano de energia como "Alto desempenho"
   - Desabilitar suspensão/hibernação se for server

## 🔒 Segurança no Windows

### Firewall
```cmd
REM Configurar regras específicas
netsh advfirewall firewall add rule name="Docker-Infra-Tools" dir=in action=allow protocol=TCP localport=8080 remoteip=localsubnet

REM Para acesso externo (cuidado!)
netsh advfirewall firewall add rule name="Docker-External" dir=in action=allow protocol=TCP localport=8080
```

### Atualizações Automáticas
1. **Configurar Windows Update**:
   - Manter sistema atualizado
   - Configurar horários de manutenção

2. **Backup Automático** (Task Scheduler):
   ```cmd
   REM Criar task para backup diário
   schtasks /create /tn "InfraTools-Backup" /tr "C:\path\to\backup-script.bat" /sc daily /st 02:00
   ```

## 📊 Monitoramento (Windows)

### Performance
```cmd
REM Monitor de recursos
perfmon

REM Task Manager - aba Performance
taskmgr

REM Logs do Docker Desktop
docker system events
```

### Status da Aplicação
```cmd
REM Health check manual
curl http://localhost:8080

REM Se curl não estiver disponível
powershell -Command "Invoke-WebRequest -Uri http://localhost:8080"

REM Status dos containers
docker-compose ps
```

## 🔄 Atualizações no Windows

### Atualizar a Aplicação
```cmd
REM Parar aplicação
docker-compose down

REM Fazer backup
docker run --rm -v database_data:/data -v %cd%:/backup alpine tar czf /backup/backup-pre-update.tar.gz -C /data .

REM Atualizar código (git pull ou copiar novos arquivos)
REM git pull

REM Rebuildar e iniciar
docker-compose up --build -d
```

### Rollback em Caso de Problemas
```cmd
REM Parar aplicação
docker-compose down

REM Restaurar backup
docker run --rm -v database_data:/data -v %cd%:/backup alpine tar xzf /backup/backup-pre-update.tar.gz -C /data .

REM Voltar código (git checkout ou restaurar arquivos)
REM git checkout HEAD~1

REM Rebuildar
docker-compose up --build -d
```

## 📱 Acesso Remoto na VM Windows

### Acessar de Outras Máquinas na Rede
A aplicação estará disponível em:
- `http://IP_DA_VM:8080`
- Para descobrir o IP: `ipconfig /all`

### Configurar Acesso Externo
1. **Configurar Port Forwarding** no router/firewall
2. **Configurar DNS** se necessário
3. **Usar HTTPS** com certificado SSL (recomendado para produção)

## 📞 Suporte Específico Windows

### Arquivos de Log Importantes
- Docker Desktop logs: `%APPDATA%\Docker\log.txt`
- Container logs: `docker-compose logs app`
- System logs: Event Viewer > Windows Logs

### Informações do Sistema
```cmd
REM Versão do Windows
winver

REM Versão do Docker
docker --version
docker-compose --version

REM Informações do sistema
systeminfo

REM Uso de espaço Docker
docker system df
```

### Comandos de Diagnóstico
```cmd
REM Verificar Hyper-V
bcdedit /enum | findstr hypervisor

REM Verificar WSL2
wsl --status

REM Verificar Docker
docker system info

REM Teste de conectividade
ping localhost
telnet localhost 8080
```

## ⚠️ Limitações e Considerações

1. **Windows Home**: Não suporta Docker Desktop nativamente
2. **Antivírus**: Pode interferir com Docker, configure exclusões
3. **VPN**: Pode causar conflitos de rede com Docker
4. **Recursos**: Docker no Windows consome mais recursos que no Linux

## 🆘 Solução Rápida de Problemas

### Container não inicia
1. Verificar se Docker Desktop está rodando
2. Verificar logs: `docker-compose logs app`
3. Reiniciar Docker Desktop
4. Reboot da VM se necessário

### Aplicação não responde
1. Verificar se porta 8080 está livre: `netstat -an | findstr :8080`
2. Verificar firewall do Windows
3. Testar com `curl http://localhost:8080`
4. Verificar logs do container

### Performance ruim
1. Aumentar recursos da VM
2. Habilitar WSL2
3. Usar SSD se possível
4. Fechar aplicações desnecessárias

Para mais ajuda, consulte a documentação oficial do Docker Desktop para Windows.
