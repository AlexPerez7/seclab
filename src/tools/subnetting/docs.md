# Subnetting & VLSM

Calcula todos los datos de una subred IPv4, la muestra en binario, reparte una red en subredes de distinto tamaño (VLSM) y genera ejercicios para practicar el cálculo a mano.

## Cómo se usa

1. **calculadora**: escribe una IP con su prefijo (`192.168.1.10/24`) o con su máscara (`192.168.1.10 255.255.255.0`).
   - Puedes poner cualquier IP de la red, no hace falta que sea la dirección de red.
   - El **deslizador** cambia el prefijo y verás cómo cambia todo al instante.
   - **En binario** muestra los bits de red en verde y los de host en ámbar.
2. **vlsm**: escribe la red base y los segmentos con los hosts que necesita cada uno. Puedes añadir y quitar segmentos. La tabla muestra la subred asignada a cada uno, cuántas direcciones sobran y cuánto espacio de la red base queda ocupado.
3. **práctica**: calcula a mano la red, el broadcast, el primer y último host y los hosts útiles. **comprobar** marca en verde o rojo cada campo (también con Enter). **ver solución** muestra las respuestas y **otro ejercicio** genera uno nuevo.

## Casos de uso

- **Diseñar una red**: repartir un rango entre usuarios, servidores, gestión y enlaces sin desperdiciar direcciones.
- **Revisar una regla de firewall o una ACL**: comprobar qué rango exacto cubre un `10.20.32.0/20`, o qué wildcard poner en una ACL de Cisco.
- **Pentest**: saber cuántos hosts tiene un rango antes de escanearlo, o si una IP encontrada pertenece al alcance autorizado.
- **Diagnosticar**: entender por qué dos equipos con máscaras distintas no se ven, o qué significa una IP `169.254.x.x`.
- **Preparar certificaciones** (CCNA, Network+, Security+): practicar hasta calcular un /27 de cabeza.

## Lo básico

Una IPv4 son 32 bits, escritos como 4 octetos en decimal. El **prefijo** (`/24`) indica cuántos bits, empezando por la izquierda, identifican la **red**. El resto identifica al **host** dentro de esa red.

```
IP        192.168.1.10   11000000.10101000.00000001.00001010
Máscara   255.255.255.0  11111111.11111111.11111111.00000000
                         └──────── 24 bits de red ────────┘└ host ┘
```

- **Red**: la IP con todos los bits de host a 0 → `192.168.1.0`. Es la operación `IP AND máscara`.
- **Broadcast**: la IP con todos los bits de host a 1 → `192.168.1.255`.
- **Hosts útiles**: todo lo que queda entre red y broadcast → 2^(bits de host) − 2.
- **Wildcard**: la máscara invertida → `0.0.0.255`. La usan las ACL de Cisco y OSPF.

## Cálculo rápido sin binario: el número mágico

Para prefijos que no caen en un octeto completo:

1. Busca el **octeto interesante**: el primero cuya máscara no es 255.
2. **Número mágico** = 256 − valor de la máscara en ese octeto.
3. Las redes empiezan en los múltiplos del número mágico.

Ejemplo, `172.16.37.200/20`:

- La máscara es `255.255.240.0`, así que el octeto interesante es el tercero (240).
- Número mágico: 256 − 240 = **16**. Las redes empiezan en 0, 16, 32, 48…
- 37 cae entre 32 y 48, así que la red es `172.16.32.0` y el broadcast `172.16.47.255` (el siguiente bloque menos uno).
- Hosts útiles: 2^12 − 2 = **4094**.

## Tabla de referencia

| Prefijo | Máscara | Direcciones | Hosts útiles | Uso típico |
|---|---|---|---|---|
| /30 | 255.255.255.252 | 4 | 2 | Enlace punto a punto |
| /29 | 255.255.255.248 | 8 | 6 | Grupo pequeño de servidores |
| /28 | 255.255.255.240 | 16 | 14 | |
| /27 | 255.255.255.224 | 32 | 30 | |
| /26 | 255.255.255.192 | 64 | 62 | |
| /25 | 255.255.255.128 | 128 | 126 | |
| /24 | 255.255.255.0 | 256 | 254 | La LAN "de toda la vida" |
| /23 | 255.255.254.0 | 512 | 510 | |
| /22 | 255.255.252.0 | 1024 | 1022 | |
| /16 | 255.255.0.0 | 65 536 | 65 534 | |

Cada bit menos de prefijo **duplica** el tamaño de la red.

## Casos borde: /31 y /32

- **/32**: una sola dirección. Se usa para identificar un host concreto en rutas y reglas de firewall, o para interfaces loopback.
- **/31**: dos direcciones y ninguna se "pierde" en red y broadcast. La RFC 3021 lo permite en enlaces punto a punto, donde no hace falta broadcast: ahorra la mitad de direcciones frente a un /30.

## VLSM: subredes de tamaño variable

Con una máscara fija, todos los segmentos tendrían el tamaño del más grande. VLSM da a cada segmento solo lo que necesita. El método es:

1. Ordenar los segmentos de **mayor a menor** número de hosts.
2. A cada uno darle el prefijo más pequeño que alcance (hosts + 2 ≤ 2^bits de host).
3. Asignarlos en orden desde el principio de la red base.

Ir de mayor a menor garantiza que cada bloque empiece en un múltiplo de su tamaño, que es lo que exige el subnetting. Al revés quedarían huecos y bloques desalineados.

La herramienta reserva como mínimo un /30 por segmento, aunque pida 1 o 2 hosts.

## Rangos especiales

| Rango | Qué es |
|---|---|
| `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` | Privadas (RFC 1918): no se enrutan en internet |
| `100.64.0.0/10` | CGNAT: las usan los operadores entre su NAT y tu router |
| `127.0.0.0/8` | Loopback: el propio equipo |
| `169.254.0.0/16` | Link-local / APIPA: el equipo no consiguió IP por DHCP |
| `192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24` | Documentación (RFC 5737): para ejemplos, nunca en redes reales |
| `224.0.0.0/4` | Multicast |
| `240.0.0.0/4` | Reservada |

Un error habitual: `172.16.0.0/12` va de `172.16.0.0` a `172.31.255.255`. `172.32.x.x` ya es **pública**.

## Las clases (historia)

Antes de CIDR (1993), la máscara dependía del primer octeto: clase **A** (0–127, /8), **B** (128–191, /16), **C** (192–223, /24), **D** multicast y **E** reservada. Hoy no se usan para enrutar, pero siguen apareciendo en exámenes y en la documentación antigua. La calculadora las muestra solo como referencia.

## Relación con seguridad y PAM

- **Segmentación**: separar usuarios, servidores y gestión en subredes distintas permite poner un firewall entre ellas. Es la base de que un equipo comprometido no llegue a todo.
- En una arquitectura **CyberArk**, el Vault suele ir en su propio segmento y solo los componentes (PVWA, CPM, PSM) tienen permitido llegar a él. Los usuarios entran a los servidores a través del PSM, no directamente.
- En un **pentest**, el alcance se define en rangos CIDR. Escanear una IP fuera del rango autorizado es un problema legal, no técnico.

## Errores comunes

- **Usar la dirección de red o de broadcast como host.** En un /24, `.0` y `.255` no se asignan.
- **Máscaras no contiguas** (`255.0.255.0`): no son válidas. Los unos de la máscara siempre van seguidos.
- **Ceros a la izquierda** (`010.0.0.1`): la herramienta los rechaza porque algunos sistemas leen `010` en octal (= 8). Es una fuente real de bypass en filtros de IP.
- **Confundir /24 con "254 hosts" siempre**: el número de hosts depende del prefijo, no de la clase.
