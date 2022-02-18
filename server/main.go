package main

import (
	"io"
	"log"
	"net"
	"os"
	"time"
)

func main() {
	l, err := net.Listen("tcp", "localhost:4200")
	if err != nil {
		log.Fatal(err)
	}

	for {
		conn, err := l.Accept()
		if err != nil {
			log.Fatal(err)
		}

		go copyToStdout(conn)
	}
}

func copyToStdout(conn net.Conn) {
	defer conn.Close()
	for {
		conn.SetReadDeadline(time.Now().Add(5 * time.Second))
		var buf [128]byte
		conn.Read(buf[:])

	}
	n, err := io.Copy(os.Stdout, conn)
	log.Printf("Copied %d bytes; finished with err = %v", n, err)
}
