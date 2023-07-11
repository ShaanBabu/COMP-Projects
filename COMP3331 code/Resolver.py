import sys
import socket
import struct

def handle_query(query_name):
    # DNS server address and port
    dns_server = ('8.8.8.8', 53)
    
    # Create a UDP socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.settimeout(5)  # Set a timeout of 5 seconds
    
    # Construct the DNS query message
    query = construct_dns_query(query_name)
    print("QUERY AFTER CONSTRUCTION:",query)
    
    try:
        # Send the query to the DNS server
        sock.sendto(query, dns_server)
        
        # Receive the response from the DNS server
        response, _ = sock.recvfrom(1024)
        
        # Parse the DNS response
        response_code = get_response_code(response)
        print("RESPONSE CODE:",response_code)
        print("RESPONSE FROM DNS SERVER:",response.decode('utf-8', errors='ignore'))
        
        if response_code == 0:
            # Successful response
            parsed_response = parse_dns_response(response)
            # Extract the IP address from the response
            ip_address = parsed_response['answers'][0]['address']
            response = "IP address: {}".format(ip_address)
        elif response_code == 1:
            # Format error
            response = "Error: Format error"
        elif response_code == 2:
            # Server failure
            # Try querying other servers before reporting an error to the client
            response = "Error: Server failure"
        elif response_code == 3:
            # Name error
            response = "Error: Server can't find {}".format(query_name)
        else:
            # Other error conditions
            response = "Error: Response code {}".format(response_code)
    
    except socket.timeout:
        response = "Error: Timeout occurred. No response from the DNS server."
    
    except socket.error as e:
        response = "Error: {}".format(e)
    
    finally:
        # Close the socket
        sock.close()
    
    return response

def construct_dns_query(query_name):
    # DNS query header
    ID = 1234  # Example ID (can be random)
    flags = 0x0100  # Standard query
    qdcount = 1  # Number of questions
    ancount = 0  # Number of answers
    nscount = 0  # Number of authority records
    arcount = 0  # Number of additional records
    
    header = struct.pack('!HHHHHH', ID, flags, qdcount, ancount, nscount, arcount)
    
    # DNS query question section
    qname = construct_qname(query_name)
    qtype = 1  # Query type A (IPv4 address)
    qclass = 1  # Query class IN (Internet)
    
    question = struct.pack('!{}sHH'.format(len(qname)), qname, qtype, qclass)
    
    # Combine the header and question sections to form the complete query
    query = header + question
    
    return query

def construct_qname(query_name):
    qname = b''
    labels = query_name.split('.')
    
    for label in labels:
        length = len(label)
        qname += struct.pack('B{}s'.format(length), length, label.encode())
    
    qname += b'\x00'  # Null termination
    
    return qname

def get_response_code(response):
    # Extract the response code from the DNS message header
    return ord(response[3]) & 0x0F

def parse_dns_response(response):

    #error checking
    if len(response) < 22:
        return None
    
    parsed_response = {}
    
    # Extract the header fields
    ID, flags, qdcount, ancount, nscount, arcount = struct.unpack('!HHHHHH', response[:12])
    parsed_response['ID'] = ID
    parsed_response['flags'] = flags
    parsed_response['qdcount'] = qdcount
    parsed_response['ancount'] = ancount
    parsed_response['nscount'] = nscount
    parsed_response['arcount'] = arcount
    
    # Parse the question section
    qname = ''
    qtype, qclass = 0, 0
    
    # Start parsing at offset 12 to skip the header
    offset = 12
    
    # Parse the domain name (QNAME) in the question section
    while True:
        length = response[offset]
        if length == 0:
            offset += 1
            break
        if length >= 192:
            pointer_offset = struct.unpack('!H', response[offset:offset+2])[0] & 0x3FFF
            recursive_result = parse_dns_response(response[pointer_offset:])
            if recursive_result is not None:
                qname += recursive_result['question']['qname']
            offset += 2
            break

        qname += response[offset+1:offset+1+length].decode() + '.'
        offset += length + 1
    
    parsed_response['question'] = {
        'qname': qname,
        'qtype': qtype,
        'qclass': qclass
    }

    print("PARSED RESPONSE FOR QNAME:",parsed_response) #debuggin print
    
    # Parse the answer section (if available)
    answers = []
    for _ in range(ancount):
        name_offset, offset = parse_name(response, offset)
        print("RESPONSE:", response)
        print("OFFSET:", offset)
        answer_type, answer_class, ttl, rdlength = struct.unpack('!HHIH', response[offset:offset+10])
        print('RAW BYTES:', response[offset:offset+10])  # Debugging print
        offset += 10

        print("ANSWER TYPE:", answer_type, answer_class, ttl, rdlength)
        answer_type = 1
        
        if answer_type == 1:  # A record
            address = socket.inet_ntoa(struct.pack('!I', socket.htonl(struct.unpack('!I', response[offset:offset+4])[0])))
            print('A record:', address)  # Debugging print
            offset += 4
        else:
            # Skip unknown record type
            address = 'Unsupported record type'
            offset += rdlength

        answers.append({
            'name': name_offset,
            'type': answer_type,
            'class': answer_class,
            'ttl': ttl,
            'address': address,
        })

    parsed_response['answers'] = answers

    return parsed_response

def parse_name(response, offset):
    initial_offset = offset
    labels = []
    while True:
        # Check if offset is out of range
        if offset >= len(response):
            break
  
        length = response[offset]
        if length == 0:
            offset += 1
            break
        if length >= 192:
            pointer_offset = struct.unpack('!H', response[offset:offset+2])[0] & 0x3FFF
            if pointer_offset >= len(response):
                break

            labels.append(parse_name(response, pointer_offset)[0])
            offset += 2
            break

        labels.append(response[offset+1:offset+1+length].decode())
        offset += length + 1

    return '.'.join(labels), offset


def run_resolver(port):
    try:
        # Create a UDP socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        
        # Bind the socket to the specified port
        sock.bind(('localhost', port))
        print("DNS resolver listening on port", port)
        
        while True:
            # Receive data from clients
            data, addr = sock.recvfrom(1024)
            
            # Decode the received data
            query_name = data.decode().strip()
            print("Received query:", query_name)
            
            # Handle the query and generate the response
            response = handle_query(query_name)
            
            # Send the response back to the client
            sock.sendto(response.encode(), addr)
            print("Sent response:", response)
            
    except socket.error as e:
        print("Error:", e)
        sys.exit(1)
        
if __name__ == "__main__":
    # Check if the correct number of arguments is provided
    if len(sys.argv) != 2:
        print("Usage: python resolver.py port")
        sys.exit(1)
        
    # Get the port number from the command-line argument
    port = int(sys.argv[1])
    
    # Run the DNS resolver
    run_resolver(port)
