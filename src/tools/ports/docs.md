# Puertos & Servicios

Referencia de unos 60 puertos que aparecen en casi cualquier red corporativa, con qué mirar en un pentest y cómo se protege cada uno. Además, anota la salida de nmap con esas fichas y tiene tarjetas para memorizarlos.

## Cómo se usa

1. **referencia**: busca por número (`445`), por servicio (`kerberos`) o por cualquier palabra de las notas (`responder`, `relay`).
   - El número busca el puerto exacto: `44` no devuelve el 443.
   - Los botones filtran por grupo: Web, Windows/AD, Bases de datos, PAM…
2. **nmap**: pega la salida de un escaneo, en formato normal o grepable (`-oG`).
   - Se quedan solo los puertos abiertos, cada uno con su ficha y la versión que detectó nmap.
   - Los que no tienen ficha aparecen al final, para que los investigues.
3. **flashcards**: elige la dirección (puerto → servicio o servicio → puerto), piensa la respuesta y pulsa **mostrar respuesta**. Márcala como sabida o no para llevar la cuenta.

## Casos de uso

- **Después de un escaneo**: pegar el nmap y tener en una pantalla qué probar en cada puerto.
- **Reconocer el tipo de equipo**: un host con 53, 88, 389, 445 y 3268 abiertos es un controlador de dominio.
- **Revisar reglas de firewall**: qué hace cada puerto que alguien pide abrir y qué riesgo trae.
- **Diseñar la segmentación de un PAM**: qué debe poder llegar al Vault y qué no.
- **Memorizar para certificaciones** (Security+, CCNA, eJPT, OSCP) con las tarjetas.

## Qué es un puerto

Un puerto es un número de 16 bits (0–65535) que identifica a qué servicio va un paquete dentro de un equipo. La IP dice a qué máquina llega; el puerto, a qué programa.

| Rango | Nombre | Uso |
|---|---|---|
| 0–1023 | Bien conocidos (*well-known*) | Servicios estándar. En Unix, abrirlos exige privilegios de root |
| 1024–49151 | Registrados | Asignados por IANA a aplicaciones concretas |
| 49152–65535 | Dinámicos o efímeros | Puertos de origen de los clientes, y RPC dinámico en Windows |

Un mismo número puede tener servicios distintos en **TCP** y en **UDP**. El 53 es DNS en los dos. El 161 (SNMP) solo en UDP.

## TCP frente a UDP al escanear

- **TCP** tiene handshake (SYN → SYN/ACK → ACK), así que nmap distingue con claridad entre abierto (responde SYN/ACK), cerrado (responde RST) y filtrado (no responde).
- **UDP** no tiene handshake. Un puerto abierto a menudo **no responde**, igual que uno filtrado. Por eso nmap muestra `open|filtered` y el escaneo UDP es lento. Aun así hay que hacerlo: SNMP, IPMI, TFTP o IKE solo están en UDP y suelen dar mucho.

```bash
nmap -sV -sC -p- 10.0.0.10        # todos los puertos TCP, con versiones y scripts por defecto
nmap -sU --top-ports 50 10.0.0.10  # los 50 UDP más comunes
nmap -sV -oG scan.gnmap 10.0.0.0/24  # salida grepable, que la herramienta también lee
```

Estado del puerto según nmap:

- **open**: hay un servicio escuchando.
- **closed**: el equipo responde, pero no hay nada escuchando.
- **filtered**: un firewall descarta los paquetes, así que no se sabe.

## Reconocer equipos por sus puertos

| Puertos abiertos | Probablemente es… |
|---|---|
| 53, 88, 135, 389, 445, 464, 636, 3268, 3269 | Controlador de dominio de Active Directory |
| 135, 139, 445, 3389, 5985 | Servidor o estación Windows |
| 22 y nada más | Servidor Linux bastionado |
| 80/443, 8080, 8443 | Servidor web o appliance con consola de gestión |
| 161/udp, 22 o 23, 69/udp | Equipo de red (switch, router, firewall) |
| 623/udp | Gestión fuera de banda de un servidor físico (iLO, iDRAC) |
| 2375, 6443, 10250 | Nodo de Docker o Kubernetes |

## Los puertos de Active Directory

AD necesita muchos puertos a la vez, y casi todos son interesantes en un pentest interno:

- **Kerberos (88)**: autenticación del dominio. Permite enumerar usuarios, AS-REP roasting y Kerberoasting (ver HashID).
- **LDAP (389) y Global Catalog (3268)**: el directorio entero (usuarios, grupos, ACL). Es lo que recopila BloodHound.
- **SMB (445)**: ficheros compartidos y administración remota. Sin SMB signing, permite el **relay NTLM**.
- **LLMNR (5355) y NBT-NS (137)**: resolución de nombres de respaldo. Responder los envenena para capturar hashes NetNTLMv2. Se deshabilitan por GPO.
- **RPC (135 y 49152–65535)**: el endpoint mapper en el 135 indica a qué puerto dinámico ir.

## Los puertos de un PAM

En una arquitectura **CyberArk**:

- El **Vault** escucha en el **1858/tcp** con un protocolo propio. Solo deben alcanzarlo los componentes: PVWA, CPM, PSM y la réplica de DR. Si un equipo de usuario llega al 1858, la segmentación está mal.
- Los usuarios entran por el **PVWA** (443).
- Las sesiones privilegiadas pasan por el **PSM**: los usuarios abren RDP (3389) contra el PSM, o SSH (22) contra el PSM for SSH, y es el PSM el que abre la conexión real contra el servidor de destino.
- El **CPM** necesita llegar a los destinos por el puerto de cada plataforma (445 o RPC en Windows, 22 en Linux, 1433 en SQL Server…) para rotar las contraseñas.

El objetivo de esa segmentación es que los servidores críticos solo acepten conexiones administrativas desde el PSM y el CPM, y que nadie pueda saltarse el PAM entrando directamente.

## Defensa general

- **Mínima exposición**: cada puerto abierto es superficie de ataque. Si no hace falta, se cierra. Si hace falta, solo desde quien lo necesita.
- **Segmentar**: gestión, servidores y usuarios en redes distintas con firewall entre ellas. RDP, WinRM, SSH, IPMI y las consolas de gestión nunca hacia internet.
- **Cifrar**: Telnet, FTP, POP3, IMAP y LDAP sin TLS envían credenciales en claro. Existe siempre una alternativa cifrada.
- **Inventariar**: escanear tu propia red regularmente. Un puerto que aparece de repente es una señal.

## Errores comunes

- **Pensar que "filtrado" significa "seguro"**: solo significa que el escáner no llega desde ahí. Desde otro segmento puede estar abierto.
- **Escanear solo los 1000 puertos por defecto**: servicios en puertos altos (8080, 9200, 10250, 27017) se pierden. Usa `-p-`.
- **Olvidar UDP**: SNMP con la comunidad `public` es de los hallazgos más comunes y más graves.
- **Fiarse del nombre del servicio**: nmap adivina por el número si no consigue hablar con el servicio. Un `http` en el 22 es posible. Confirma con `-sV`.
- **Escanear fuera del alcance autorizado**: en un pentest, el alcance se define por IPs o rangos. Todo lo demás está prohibido.
