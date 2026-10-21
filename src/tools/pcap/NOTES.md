# PCAP Analyzer — apuntes

**Estado:** pendiente.

## Objetivos de aprendizaje
- Leer un formato binario byte a byte con `DataView`: endianness, offsets y longitudes.
- Entender el encapsulado: trama Ethernet → paquete IP → segmento TCP/UDP → aplicación.
- Reconocer patrones de tráfico: el handshake TCP, un escaneo SYN, DNS normal frente a túneles DNS.

## Conceptos clave
- Cabecera global pcap (24 B) + registros (16 B de cabecera + datos). Ver pcap-savefile(5).
- EtherType 0x0800 = IPv4, 0x86DD = IPv6, 0x0806 = ARP.
- Protocolo IP 6 = TCP, 17 = UDP, 1 = ICMP.

## Preguntas de repaso
1. ¿Qué diferencia hay entre `incl_len` y `orig_len`? ¿Cuándo son distintos?
2. ¿Cómo se ve en una captura un escaneo `nmap -sS` frente a un `-sT`?
3. ¿Por qué un HTTP Basic Auth en claro es visible en la captura y uno con TLS no?

## Práctica
- Capturar tráfico propio con Wireshark (`ping`, `curl http://…`, `nslookup`) y comparar la salida de la herramienta con la de Wireshark.
- Muestras públicas: https://wiki.wireshark.org/SampleCaptures
