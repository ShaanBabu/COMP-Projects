import sys
import socket

def send_query(resolver_ip, resolver_port, name, timeout):
    try:
        # Create a UDP socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        
        # Set the socket timeout
        sock.settimeout(timeout)
        
        # Send the query to the resolver
        sock.sendto(name.encode(), (resolver_ip, resolver_port))
        
        # Receive the response from the resolver
        response, _ = sock.recvfrom(1024)
        
        # Decode and display the response
        response = response.decode().strip()
        
        # Check for error response
        if response.startswith("Error:"):
            print(response)
            sys.exit(1)
            
        print("Response:", response)
        
    except socket.timeout:
        print("Timeout occurred. No response from the resolver.")
        sys.exit(1)
        
    except socket.error as e:
        print("Error:", e)
        sys.exit(1)

if __name__ == "__main__":
    # Check if the correct number of arguments is provided
    if len(sys.argv) < 4 or len(sys.argv) > 5:
        print("Usage: python client.py resolver_ip resolver_port name [timeout]")
        sys.exit(1)
        
    # Get the command-line arguments
    resolver_ip = sys.argv[1]
    resolver_port = int(sys.argv[2])
    name = sys.argv[3]
    
    # Check if the timeout argument is provided
    if len(sys.argv) == 5:
        timeout = int(sys.argv[4])
    else:
        # Set a default timeout of 5 seconds
        timeout = 5
    
    # Check if the timeout value is valid
    if timeout <= 0:
        print("Error: Invalid timeout value. Timeout must be greater than 0.")
        sys.exit(1)
    
    # Send the query to the resolver
    send_query(resolver_ip, resolver_port, name, timeout)
